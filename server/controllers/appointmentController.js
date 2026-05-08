const asyncHandler = require('express-async-handler');
const TrainerAppointment = require('../models/TrainerAppointment');
const User = require('../models/User');

exports.createAppointment = asyncHandler(async (req, res) => {
    const { trainer, member, date, startTime, endTime, type, notes } = req.body;
    const appointment = await TrainerAppointment.create({ trainer, member, date, startTime, endTime, type, notes });
    res.status(201).json({ success: true, appointment });
});

exports.getAppointments = asyncHandler(async (req, res) => {
    const { role, _id } = req.user;
    let filter = {};
    if (role === 'member') filter.member = _id;
    else if (role === 'male_trainer' || role === 'female_trainer') filter.trainer = _id;
    if (req.query.date) filter.date = { $gte: new Date(req.query.date) };

    const appointments = await TrainerAppointment.find(filter)
        .populate('trainer', 'username email profilePhoto')
        .populate('member', 'username email memberId profilePhoto')
        .sort({ date: 1, startTime: 1 });
    res.json({ success: true, appointments });
});

exports.updateAppointment = asyncHandler(async (req, res) => {
    const appt = await TrainerAppointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appt) { res.status(404); throw new Error('Appointment not found'); }
    res.json({ success: true, appointment: appt });
});

exports.deleteAppointment = asyncHandler(async (req, res) => {
    await TrainerAppointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Appointment cancelled' });
});
