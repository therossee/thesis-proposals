const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');
const {
  sequelize,
  Company,
  Student,
  Supervisor,
  ThesisProposal,
  ThesisApplication,
  ThesisApplicationSupervisorCoSupervisor,
  ThesisApplicationStudent,
  ThesisApplicationCompany,
  ThesisApplicationProposal
} = require('../models');
const thesisApplicationRequestSchema = require('../schemas/ThesisApplicationRequest');
const thesisApplicationResponseSchema = require('../schemas/ThesisApplicationResponse');
const thesisApplicationStatusSchema = require('../schemas/ThesisApplicationStatus');
const getPaginationParams = require('../utils/paginationParams'); // Assumo esista come nel file proposals
const student = require('../models/student');

const camelToSnakeCase = str => str.replace(/([A-Z])/g, '_$1').toLowerCase();



// ==========================================
// CONTROLLERS
// ==========================================




const createThesisApplication = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const payload = thesisApplicationRequestSchema.parse(req.body);
    const {
      student_id,
      thesis_proposal_id,
      topic,
      description,
      company,
      supervisors,
      companyId,
      proposal,
      thesisProposal
    } = payload;

    let companyIdValue = companyId ?? company?.id ?? null;

    if (!companyIdValue && company) {
      const companyName = company.corporateName || company.name;
      if (companyName) {
        const [comp] = await Company.findOrCreate({
          where: { corporateName: companyName },
          transaction: t
        });
        companyIdValue = comp.id;
      }
    }

    const thesisProposalId = thesis_proposal_id ?? thesisProposal?.id ?? proposal?.id ?? null;

    const newApplication = await ThesisApplication.create({
      topic,
      status: 'pending'
    }, { transaction: t });

    await ThesisApplicationStudent.create({
      thesis_application_id: newApplication.id,
      student_id
    }, { transaction: t });

    if (thesisProposalId) {
      await ThesisApplicationProposal.create({
        thesis_application_id: newApplication.id,
        thesis_proposal_id: thesisProposalId
      }, { transaction: t });
    }

    if (companyIdValue) {
      await ThesisApplicationCompany.create({
        thesis_application_id: newApplication.id,
        company_id: companyIdValue
      }, { transaction: t });
    }

    if (supervisors && supervisors.length > 0) {
      const supervisorData = supervisors.map(sup => ({
        thesis_application_id: newApplication.id,
        supervisor_id: sup.supervisor_id,
        is_supervisor: sup.is_supervisor
      }));
      await ThesisApplicationSupervisorCoSupervisor.bulkCreate(supervisorData, { transaction: t });
    }

    await t.commit();

    // Fetch dell'oggetto creato per restituirlo formattato
    const createdApp = await ThesisApplication.findByPk(newApplication.id, {
      include: getApplicationIncludes()
    });

    res.status(201).json(thesisApplicationResponseSchema.parse(createdApp.toJSON()));
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
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

    const activeApplication = await ThesisApplication.findAll({
      where: {
        id: { [Op.in]: applicationIds },
        status: { [Op.in]: ['pending', 'approved'] }
      }
    });

    res.json({ studentId: loggedStudent[0].id, eligible: activeApplication.length === 0 });
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

    const activeApplication = await ThesisApplication.findOne({
      where: {
        id: { [Op.in]: applicationIds },
        status: { [Op.in]: ['pending', 'accepted', 'conclusion_requested', 'conclusion_accepted', 'done'] }
      },
      include: getApplicationIncludes()
    });

    if (!activeApplication) {
      return res.status(404).json({ error: 'No active application found for the student' });
    }

    // Normalize included teachers key to match schema expectations
    const activeAppJson = activeApplication.toJSON();
    if (!activeAppJson.teachers && activeAppJson.Teachers) {
      activeAppJson.teachers = activeAppJson.Teachers;
    }

    const formattedApplication = thesisApplicationSchema.parse(activeAppJson);

    res.json(formattedApplication);
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

    const applicationIds = links.map(l => l.thesis_application_id);

    const lastApplication = await ThesisApplication.findOne({
      where: {
        id: { [Op.in]: applicationIds }
      },
      order: [['id', 'DESC']],
      transaction: t
    });

    if (!lastApplication) {
      await t.rollback();
      return res.status(404).json({ error: 'No application found to delete' });
    }

    await ThesisApplicationSupervisorCoSupervisor.destroy({
      where: {
        thesis_application_id: lastApplication.id
      },
      transaction: t
    });

    await ThesisApplicationStudent.destroy({
      where: {
        thesis_application_id: lastApplication.id
      },
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