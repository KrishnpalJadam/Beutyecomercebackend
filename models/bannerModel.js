const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    image1: String
})
module.exports = mongoose.model("banner", OrderSchema);