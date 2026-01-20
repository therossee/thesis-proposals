const express = require('express');
const router = express.Router();
const {
  getLoggedStudentThesis,
  createStudentThesis,
  updateStudentThesis
} = require('../controllers/thesis');

router.get('/', getLoggedStudentThesis);
router.post('/', createStudentThesis);
router.put('/', updateStudentThesis);

module.exports = router;