const Exercise = require('../models/Exercise');

exports.getExercises = async (req, res) => {
    try {
        const { bodyPart } = req.query;
        let query = {};
        if (bodyPart) {
            query.targetBodyPart = bodyPart;
        }
        const exercises = await Exercise.find(query);
        res.json(exercises);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getExerciseById = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);
        if (!exercise) {
            return res.status(404).json({ msg: 'Exercise not found' });
        }
        res.json(exercise);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Exercise not found' });
        }
        res.status(500).send('Server Error');
    }
};

exports.createExercise = async (req, res) => {
    try {
        const newExercise = new Exercise(req.body);
        const exercise = await newExercise.save();
        res.json(exercise);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
