const asyncHandler = require('express-async-handler');
const Lead = require('../models/Lead');

exports.getLeads = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const leads = await Lead.find(filter).populate('assignedTo', 'username').sort({ createdAt: -1 });
    res.json({ success: true, leads });
});

exports.createLead = asyncHandler(async (req, res) => {
    const lead = await Lead.create({ ...req.body, assignedTo: req.user._id });
    res.status(201).json({ success: true, lead });
});

exports.updateLead = asyncHandler(async (req, res) => {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) { res.status(404); throw new Error('Lead not found'); }
    res.json({ success: true, lead });
});

exports.deleteLead = asyncHandler(async (req, res) => {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lead deleted' });
});

exports.getLeadStats = asyncHandler(async (req, res) => {
    const [total, converted, lost, contacted, newLeads] = await Promise.all([
        Lead.countDocuments(),
        Lead.countDocuments({ status: 'converted' }),
        Lead.countDocuments({ status: 'lost' }),
        Lead.countDocuments({ status: 'contacted' }),
        Lead.countDocuments({ status: 'new' }),
    ]);
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : 0;
    res.json({ success: true, stats: { total, converted, lost, contacted, new: newLeads, conversionRate } });
});
