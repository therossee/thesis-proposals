const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');
const { z } = require('zod');
const {
    sequelize,
    Teacher,
    Student,
    ThesisProposal,
    ThesisApplication,
    ThesisApplicationSupervisorCoSupervisor,
    ThesisApplicationStatusHistory
} = require('../models');
const thesisApplicationSchema = require('../schemas/ThesisApplication');
const selectTeacherAttributes = require('../utils/selectTeacherAttributes');

const updateThesisApplicationStatus = async (req, res) => {
    try {
        // Example logic to update a thesis application
        const { id, old_status, new_status, note } = req.body;

        const application = await ThesisApplication.findByPk(id);
        if (!application) {
            return res.status(404).json({ error: 'Thesis application not found' });
        }

        await ThesisApplicationStatusHistory.create({
            thesis_application_id: id,
            old_status: application.status,
            new_status: new_status,
            note: note || null,
        });
        application.status = new_status;
        await application.save();
        const updatedApplication = await ThesisApplication.findByPk(id);
        
        res.status(200).json(updatedApplication);
    } catch (error) {
        console.error('Error updating thesis application status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    updateThesisApplicationStatus,
};


