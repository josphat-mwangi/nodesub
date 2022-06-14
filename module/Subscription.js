
const mongoose = require('mongoose')


const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
}, {timestamps: true});


module.exports = mongoose.model('Subscription', subscriptionSchema);