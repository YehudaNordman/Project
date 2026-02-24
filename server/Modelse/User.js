const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true, // מבטיח שלא יהיו שני יוזרים עם אותו מייל ברמת ה-DB
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: [8, 'Password must be at least 8 characters long'],
        },
        admin: Boolean,
        itineraries: [
            {
                destination: String,
                aiPlan: String,
                flightDetails: {
                    landingDate: String,
                    landingTime: String,
                    takeoffDate: String,
                    takeoffTime: String
                },
                createdAt: { type: Date, default: Date.now }
            }
        ]
    }
);

module.exports = mongoose.model('User', userSchema);