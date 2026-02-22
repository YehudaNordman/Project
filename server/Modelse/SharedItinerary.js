const mongoose = require('mongoose');

const SharedItinerarySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userName: String, // Added field
    destination: {
        type: String,
        required: true
    },
    aiPlan: {
        type: String, // Stored as JSON string
        required: true
    },
    flightDetails: {
        landingDate: String,
        landingTime: String,
        takeoffDate: String,
        takeoffTime: String
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        userEmail: String,
        userName: String, // Added field
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SharedItinerary', SharedItinerarySchema);
