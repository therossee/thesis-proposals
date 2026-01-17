const { Op, where } = require('sequelize');
const { QueryTypes } = require('sequelize');
const { z } = require('zod');
const {
  sequelize,
  Company,
  Teacher,
  ThesisApplication,
  ThesisApplicationSupervisorCoSupervisor,
  ThesisApplicationStudent,
  ThesisApplicationCompany,
  ThesisApplicationProposal,
} = require('../models');
const thesisApplicationRequestSchema = require('../schemas/ThesisApplicationRequest');
const thesisApplicationResponseSchema = require('../schemas/ThesisApplicationResponse');
const selectTeacherAttributes = require('../utils/selectTeacherAttributes');



// ==========================================
// CONTROLLERS
// ==========================================


const createThesisApplication = async (req, res) => {
  const t = await sequelize.transaction();

  try {

    const applicationData = thesisApplicationRequestSchema.parse(req.body);
    const supervisorData = await Teacher.findByPk(applicationData.supervisor.id, 
      { 
        attributes: selectTeacherAttributes(true), 
      });
    const coSupervisorsData = [];
    if (applicationData.coSupervisors) {
      for (const coSup of applicationData.coSupervisors) {
        const coSupervisor = await Teacher.findByPk(coSup.id, { attributes: selectTeacherAttributes(true) });
        if (coSupervisor) coSupervisorsData.push(coSupervisor);
      }
    }
    const loggedStudent = await sequelize.query(
      `
      SELECT 
        s.*
      FROM student s
      INNER JOIN logged_student ls ON s.id = ls.student_id
      LIMIT 1
      `,
      { type: QueryTypes.SELECT },
    );

    // Create ThesisApplication
    const newApplication = await ThesisApplication.create({
      topic: applicationData.topic,
      status: 'pending',
      submission_date: new Date().toISOString()
    }, { transaction: t });
    console.log('After Application Creation');
    // Link Student
    await ThesisApplicationStudent.create({
      thesis_application_id: newApplication.id,
      student_id: loggedStudent[0].id,
    }, { transaction: t });
    console.log('After Student Link');
    // Link Company if provided
    if (applicationData.company) {
      await ThesisApplicationCompany.create({
        thesis_application_id: newApplication.id,
        company_id: applicationData.company.id,
      }, { transaction: t });
    }
    console.log('After Company Link');
    // Link Proposal if provided
    if (applicationData.proposal) {
      await ThesisApplicationProposal.create({
        thesis_application_id: newApplication.id,
        thesis_proposal_id: applicationData.proposal.id,
      }, { transaction: t });
    }
    console.log('After Proposal Link');
    // Link Supervisor and Co-Supervisors
    const supervisors = [applicationData.supervisor, ...(applicationData.coSupervisors || [])];
    for (const supervisor of supervisors) {
      await ThesisApplicationSupervisorCoSupervisor.create({
        thesis_application_id: newApplication.id,
        teacher_id: supervisor.id,
        is_supervisor: supervisor.id === applicationData.supervisor.id,
      }, { transaction: t });
    }
    console.log('After Supervisors Link');
    await t.commit();
    const responsePayload = {
      id: newApplication.id,
      topic: newApplication.topic,
      supervisor: supervisorData,
      coSupervisors: coSupervisorsData,
      company: newApplication.company || null,
      proposal: newApplication.proposal || null,
      submissionDate: newApplication.submission_date.toISOString(),
      status: newApplication.status || 'pending',
    };

    const validatedResponse = await thesisApplicationResponseSchema.parseAsync(responsePayload);
    return res.status(201).json(validatedResponse);
  } catch (error) {
    console.error(error);
    console.error(error?.stack);
    if (t && !t.finished) await t.rollback();
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message });
  }
};

const checkStudentEligibility = async (req, res) => {
  try {
    const loggedStudent = await sequelize.query(
      `
      SELECT 
        s.*
      FROM student s
      INNER JOIN logged_student ls ON s.id = ls.student_id
      LIMIT 1
      `,
      { type: QueryTypes.SELECT },
    );

    const links = await ThesisApplicationStudent.findAll({
      where: { student_id: loggedStudent[0].id }
    });

    const applicationIds = links.map(l => l.thesis_application_id);

    let eligible = true;
    if (applicationIds.length > 0) {
      const activeApplication = await ThesisApplication.findAll({
        where: {
          id: { [Op.in]: applicationIds },
          status: { [Op.in]: ['pending', 'approved'] }
        }
      });
      if (activeApplication.length > 0) eligible = false;
    }

    res.json({ studentId: loggedStudent[0].id, eligible });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentActiveApplication = async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ error: 'studentId query parameter is required' });
    }

    const links = await ThesisApplicationStudent.findAll({
      where: { student_id: studentId }
    });

    const applicationIds = links.map(l => l.thesis_application_id);

    if (applicationIds.length === 0) {
      return res.status(404).json({ error: 'No application found' });
    }

    const activeApplication = await ThesisApplication.findOne({
      where: {
        id: { [Op.in]: applicationIds },
        status: { [Op.in]: ['pending', 'accepted', 'conclusion_requested', 'conclusion_accepted', 'done'] }
      }
      // Add include if needed
    });

    if (!activeApplication) {
      return res.status(404).json({ error: 'No active application found for the student' });
    }

    const activeAppJson = activeApplication.toJSON();
    // format if needed

    // We can use the response schema here if fully populated
    // res.json(thesisApplicationResponseSchema.parse(activeAppJson));
    res.json(activeAppJson);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteLastThesisApplication = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const loggedStudent = await sequelize.query(
      `
      SELECT 
        s.*
      FROM student s
      INNER JOIN logged_student ls ON s.id = ls.student_id
      LIMIT 1
      `,
      { type: QueryTypes.SELECT },
    );

    const links = await ThesisApplicationStudent.findAll({
      where: { student_id: loggedStudent[0].id },
      transaction: t
    });

    if (!links.length) {
      await t.rollback();
      return res.status(404).json({ error: 'No application found to delete' });
    }

    const applicationIds = links.map(l => l.thesis_application_id);

    const lastApplication = await ThesisApplication.findOne({
      where: { id: { [Op.in]: applicationIds } },
      order: [['id', 'DESC']],
      transaction: t
    });

    if (!lastApplication) {
      await t.rollback();
      return res.status(404).json({ error: 'No application found to delete' });
    }

    // Must delete link rows first or rely on CASCADE
    // Since we have manual link tables, explicit delete is safer

    await ThesisApplicationSupervisorCoSupervisor.destroy({
      where: { thesis_application_id: lastApplication.id },
      transaction: t
    });

    await ThesisApplicationCompany.destroy({
      where: { thesis_application_id: lastApplication.id },
      transaction: t
    });

    await ThesisApplicationProposal.destroy({
      where: { thesis_application_id: lastApplication.id },
      transaction: t
    });

    await ThesisApplicationStudent.destroy({
      where: { thesis_application_id: lastApplication.id },
      transaction: t
    });

    await lastApplication.destroy({ transaction: t });

    await t.commit();
    res.status(200).json({ message: 'Last thesis application deleted successfully' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createThesisApplication,
  checkStudentEligibility,
  getStudentActiveApplication,
  deleteLastThesisApplication
};