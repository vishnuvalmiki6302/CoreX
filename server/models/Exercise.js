const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    targetBodyPart: {
        type: String,
        required: true,
        index: true,
    },
    equipment: {
        type: String,
        required: true,
    },
    gifUrl: {
        type: String,
        required: true,
    },
    instructions: [{
        type: String,
    }],
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
