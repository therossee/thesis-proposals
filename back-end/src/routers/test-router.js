const express = require('express');
const router = express.Router();
const { updateThesisApplicationStatus } = require('../controllers/test-controller');

router.put('/thesis-application', updateThesisApplicationStatus);

module.exports = router;
