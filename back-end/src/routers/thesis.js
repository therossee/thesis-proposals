const express = require('express');
const router = express.Router();
const { getLoggedStudentThesis, createStudentThesis } = require('../controllers/thesis');

router.get('/', getLoggedStudentThesis);
router.post('/', createStudentThesis);

module.exports = router;
