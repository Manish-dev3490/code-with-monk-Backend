const mongoose = require('mongoose');
const { schema } = mongoose;


const userSchema = new schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
        trim: true
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 50,
        trim: true
    },
    age: {
        type: Number,
        min: 6,
        max: 80,
    },
    emailId: {
        type: String,
        required: true,
        minLength: 12,
        maxLength: 30,
        unique: true,
        trim: true,
        immutable: true,
        lowercase: true
    },
    password: {
        type: String,
        minLength: 8,
        maxLength: 20,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    problemSolved: {
        type: [String]
    }

}, { timeStamps: true });

const userModel = new mongoose.model("user", userSchema);
module.exports = userModel;