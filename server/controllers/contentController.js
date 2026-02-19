const Plan = require('../models/Plan');
const Trainer = require('../models/Trainer');
const Contact = require('../models/Contact');

exports.getPlans = async (req, res) => {
    try {
        const plans = await Plan.find();
        res.json(plans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getTrainers = async (req, res) => {
    try {
        const trainers = await Trainer.find();
        res.json(trainers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.submitContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const newContact = new Contact({
            name,
            email,
            message
        });
        await newContact.save();
        res.json({ msg: 'Message sent successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
