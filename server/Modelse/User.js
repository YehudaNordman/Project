const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        email: {
            type: String,//
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

// בדיקה לפני שמירת הסיסמה - הצפנה
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// בדיקה של הסיסמה בעת ההתחברות
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);