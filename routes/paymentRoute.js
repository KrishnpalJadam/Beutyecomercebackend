const express = require("express");
const router = express.Router();
const {AuthenticateTheUserss, AuthenticateTheUser } = require('../middleware/AuthenticateTheUser');
const { processPayment, sendStripeApiKey } = require("../controllers/paymentControllers");

router.route("/payment/process").post(AuthenticateTheUserss, processPayment)
router.route("/payment/stripeapikey").get(AuthenticateTheUserss, sendStripeApiKey)
module.exports = router;