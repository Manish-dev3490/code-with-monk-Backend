const mongoose = require('mongoose');


const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficultyLevel: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    tags: {
        type: [String],
        enum: ['linked list', 'array', 'string', 'dynamic programming', 'trees', 'graph', 'priority queue'],
        required: true
    },
    visibleTestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            },
            explanation: {
                type: String,
                required: true
            }
        }
    ],
    hiddenTestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            },

        }
    ],
    initialCode: [
        {
            language: {
                type: String,
                required: true
            },
            boilerPlate: {
                type: String,
                required: true
            }
        }
    ],
    refrenceSolution: [{
        language: {
            type: String,
            required: true
        },
        completeCode: {
            type: String,
            required: true
        }
    }],
    problemCreator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
}, { timestamps: true });

const problemModel = mongoose.model("problem", problemSchema);

module.exports = problemModel;