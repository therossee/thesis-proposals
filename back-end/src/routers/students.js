const express = require('express');
const router = express.Router();
const {
  getStudents,
  getLoggedStudent,
  updateLoggedStudent,
  getRequiredResumeForLoggedStudent,
} = require('../controllers/students');

router.get('/', getStudents);
router.get('/logged-student', getLoggedStudent);
router.get('/required-resume', getRequiredResumeForLoggedStudent);
router.put('/logged-student', updateLoggedStudent);

module.exports = router;
