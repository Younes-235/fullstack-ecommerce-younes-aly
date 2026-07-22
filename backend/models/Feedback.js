const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    productId: {
        type: Number,
        required: true,
        index: true 
    },
    userId: {
        type: Number,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Feedback', feedbackSchema);