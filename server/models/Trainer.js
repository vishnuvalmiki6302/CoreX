const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    socials: {
        instagram: String,
        twitter: String,
        linkedin: String,
    }
});

module.exports = mongoose.model('Trainer', TrainerSchema);
