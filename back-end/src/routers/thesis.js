const express = require('express');
const router = express.Router();
const {
  getLoggedStudentThesis
} = require('../controllers/thesis');

router.get('/thesis', getLoggedStudentThesis);