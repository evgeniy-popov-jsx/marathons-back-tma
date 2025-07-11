const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.route('/create-payment').post(paymentController.createPayment);
router.route('/webhook').post(paymentController.handleWebhook);

module.exports = router;