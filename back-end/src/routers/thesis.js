const express = require('express');
const router = express.Router();
const { getLoggedStudentThesis, createStudentThesis, getAllTheses, getThesisFile } = require('../controllers/thesis');

router.get('/', getLoggedStudentThesis);
router.post('/', createStudentThesis);
router.get('/all', getAllTheses);
router.get('/:id/:fileType', getThesisFile);

module.exports = router;
