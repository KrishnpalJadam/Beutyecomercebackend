const express = require('express');
const router = express.Router();
const { createContact, getAllContacts } = require('../controllers/contactUsController');

// POST: Submit a new contact form
router.post('/contact', createContact);

// GET: Fetch all contact form submissions
router.get('/contact', getAllContacts);

// Export router
module.exports = router;
