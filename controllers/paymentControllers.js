const AsyncAwaitError = require('../middleware/AsyncAwaitError');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

exports.processPayment = AsyncAwaitError(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        metadata: {
            company: "Mellow"
        }
    })
    res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret
    })
})

exports.sendStripeApiKey = AsyncAwaitError(async (req, res, next) => {
    res.status(200).json({
        success: true,
        stripeApiKey: process.env.STRIPE_API_KEY
    })
})