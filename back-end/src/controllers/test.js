const { ThesisApplication, ThesisApplicationStatusHistory } = require('../models');

const updateThesisApplicationStatus = async (req, res) => {
  try {
    // Example logic to update a thesis application
    const { id, new_status, note } = req.body;

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
