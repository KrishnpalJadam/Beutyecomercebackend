const mongoose = require('mongoose');

// Define schema for Contact Us
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Create model
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
