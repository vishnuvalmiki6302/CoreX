const mongoose = require('mongoose');

const TransformationPhotoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    photoUrl: {
        type: String,
        required: true,
    },
    caption: String,
    isPrivate: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('TransformationPhoto', TransformationPhotoSchema);
