const PlanProgram = require('../models/PlanProgram');

// GET /api/plan-programs/:planType  (public - for logged-in users)
const getPlanProgram = async (req, res) => {
    try {
        const { planType } = req.params;
        const program = await PlanProgram.findOne({ planType: planType.toLowerCase() });
        if (!program) return res.status(404).json({ message: 'No program found for this plan type' });
        res.json(program);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/plan-programs  (admin - list all)
const getAllPlanPrograms = async (req, res) => {
    try {
        const programs = await PlanProgram.find({});
        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/plan-programs  (admin)
const createOrUpdatePlanProgram = async (req, res) => {
    try {
        const { planType, weeklySchedule } = req.body;
        if (!planType) return res.status(400).json({ message: 'planType is required' });

        const program = await PlanProgram.findOneAndUpdate(
            { planType: planType.toLowerCase() },
            { planType: planType.toLowerCase(), weeklySchedule },
            { upsert: true, new: true, runValidators: true }
        );
        res.status(200).json(program);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/plan-programs/:planType  (admin)
const deletePlanProgram = async (req, res) => {
    try {
        await PlanProgram.findOneAndDelete({ planType: req.params.planType.toLowerCase() });
        res.json({ message: 'Program deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPlanProgram, getAllPlanPrograms, createOrUpdatePlanProgram, deletePlanProgram };
