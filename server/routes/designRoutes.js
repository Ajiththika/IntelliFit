
const express = require('express');
const router = express.Router();
const { generateDesign } = require('../controllers/designController');

router.post('/generate', generateDesign);

module.exports = router;
