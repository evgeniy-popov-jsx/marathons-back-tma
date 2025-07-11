const authController = require('../controllers/authController');
const express = require('express');
const router = express.Router();

router.route('/').post(authController.authUser);

module.exports = router;
