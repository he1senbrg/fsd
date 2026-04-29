const express = require('express');
const artFormController = require('../controllers/artFormController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(artFormController.getAllArtForms)
    .post(authenticate, artFormController.createArtForm);

module.exports = router;
