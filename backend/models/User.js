const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['job_seeker', 'employer'],
        required: true
    },
    // Job Seeker Profile Details
    resumeUrl: {
        type: String,
        default: null
    },
    skills: {
        type: [String],
        default: []
    },
    // Employer Profile Details
    companyName: {
        type: String,
        default: null
    },
    companyDescription: {
        type: String,
        default: null
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
