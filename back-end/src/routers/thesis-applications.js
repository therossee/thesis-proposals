const express = require('express');
const router = express.Router();
const {
  createThesisApplication,
  deleteLastThesisApplication,
  checkStudentEligibility,
  getStudentActiveApplication
} = require('../controllers/thesis-applications');

router.get('/eligibility', checkStudentEligibility);
router.get('/', getStudentActiveApplication);
router.post('/', createThesisApplication);
router.delete('/', deleteLastThesisApplication);


module.exports = router;