const asyncHandler = require('express-async-handler');
const { GoogleGenAI } = require('@google/genai');
const User = require('../models/User');

// ─── GEMINI SETUP ─────────────────────────────────────────────────────────────
// Model priority order — tries each in sequence on quota/404 errors
// Based on available models from: GET /v1beta/models?key=...
const MODEL_PRIORITY = [
    'gemini-2.5-flash-lite',   // fastest + cheapest, try first
    'gemini-2.5-flash',        // better quality fallback
    'gemini-2.0-flash-lite',   // older lite
    'gemini-2.0-flash',        // older full
    'gemini-flash-lite-latest',// latest alias
    'gemini-flash-latest',     // latest alias
];

const getAI = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set in server/.env');
    }
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

/**
 * Tries models in priority order — falls back automatically on quota/404 errors
 */
const generateWithFallback = async (prompt) => {
    const ai = getAI();
    let lastError;
    for (const model of MODEL_PRIORITY) {
        try {
            const response = await ai.models.generateContent({ model, contents: prompt });
            const text = response.text;
            if (text) return text;
        } catch (err) {
            const msg = err.message || '';
            // Skip to next model on quota or not-found
            if (msg.includes('429') || msg.includes('404') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('not found')) {
                lastError = err;
                continue;
            }
            // Real error — throw immediately
            throw err;
        }
    }
    throw new Error('All Gemini models quota exceeded. Please try again in a few minutes. Error: ' + (lastError?.message || 'unknown'));
};

// ─── EXTRACT JSON HELPER ──────────────────────────────────────────────────────
const extractJSON = (text, arrayMode = false) => {
    // Remove markdown code fences if present
    const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    const pattern = arrayMode ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
    const match = cleaned.match(pattern);
    if (!match) throw new Error('AI returned unexpected format. Please try again.');
    return JSON.parse(match[0]);
};

// ─── FITNESS ASSESSMENT ────────────────────────────────────────────────────────
exports.generateFitnessAssessment = asyncHandler(async (req, res) => {
    const { gender, age, weight, height, bodyFat, goals, medicalConditions, fitnessLevel } = req.body;

    if (!gender || !age || !weight || !height) {
        res.status(400);
        throw new Error('Please provide gender, age, weight, and height');
    }

    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

    const prompt = `You are a certified fitness expert. Create a personalized 4-week fitness plan.
Member: ${gender}, age ${age}, weight ${weight}kg, height ${height}cm, BMI ${bmi}, body fat ${bodyFat || 'unknown'}%
Fitness level: ${fitnessLevel || 'beginner'}
Goals: ${(goals || []).join(', ') || 'general fitness'}
Medical conditions: ${(medicalConditions || []).join(', ') || 'none'}

Respond ONLY with this JSON (no extra text, no markdown):
{"fitnessLevel":"beginner|intermediate|advanced","calorieTarget":1800,"proteinTarget":120,"trainingFrequency":"4 days per week","weeklySchedule":[{"day":"Monday","focus":"Upper Body","exercises":["Push-ups","Dumbbell rows"],"duration":"45 min"}],"keyRecommendations":["Tip 1","Tip 2","Tip 3"],"warningsAndNotes":"Any warnings here"}`;

    const text = await generateWithFallback(prompt);
    const plan = extractJSON(text);
    plan.bmi = parseFloat(bmi);
    plan.generatedAt = new Date();

    res.json({ success: true, assessment: plan });
});

// ─── AI DIET PLAN ──────────────────────────────────────────────────────────────
exports.generateAIDiet = asyncHandler(async (req, res) => {
    const { planType, preferences = {}, userProfile = {} } = req.body;

    const planDescriptions = {
        women_weight_loss: "women's weight loss — high protein, 1400-1600 kcal calorie deficit, Indian meals",
        pcos_friendly: 'PCOS-friendly — low GI, anti-inflammatory, Indian vegetarian',
        muscle_gain: 'muscle gain — high protein, 2500-3000 kcal surplus, Indian foods',
        postpartum: 'postpartum recovery — iron and calcium rich, 1800-2000 kcal moderate calories',
        vegetarian_indian: 'vegetarian Indian — dal, paneer, legume-based balanced macros',
        general_fat_loss: 'general fat loss — standard calorie deficit with balanced macros',
    };

    const desc = planDescriptions[planType] || planDescriptions.general_fat_loss;
    const veg = preferences.vegetarian ? 'vegetarian only, no meat' : 'can include chicken, eggs, fish';

    const prompt = `You are a certified Indian dietician. Create a 7-day ${desc} meal plan.
Diet: ${veg}, cuisine: ${preferences.cuisine || 'Indian'}, allergies: ${(preferences.allergies || []).join(', ') || 'none'}.
User: age ${userProfile.age || 'unknown'}, weight ${userProfile.weight || 'unknown'}kg, goals: ${(userProfile.goals || []).join(', ') || 'general health'}.

Respond ONLY with this JSON (no extra text):
{"planName":"Name","dailyCalories":1600,"macros":{"protein":"120g","carbs":"150g","fat":"50g"},"days":[{"day":"Day 1","meals":{"breakfast":{"name":"Oats Upma","ingredients":["oats","vegetables"],"calories":350},"lunch":{"name":"Dal Rice","ingredients":["dal","rice"],"calories":450},"dinner":{"name":"Paneer Sabzi","ingredients":["paneer","veggies"],"calories":400},"snacks":{"name":"Fruits","ingredients":["apple"],"calories":150}}}],"tips":["Tip 1","Tip 2"],"supplements":["Supplement 1"]}`;

    const text = await generateWithFallback(prompt);
    const plan = extractJSON(text);
    plan.planType = planType;
    plan.generatedAt = new Date();

    res.json({ success: true, dietPlan: plan });
});

// ─── AI CHAT COACH ─────────────────────────────────────────────────────────────
const chatSessions = new Map();

exports.chatWithCoach = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const userId = req.user._id.toString();

    if (!message) { res.status(400); throw new Error('Message is required'); }

    const history = chatSessions.get(userId) || [];

    // Build conversation context
    const context = history.slice(-8).map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`).join('\n');
    const prompt = `You are CoreX Coach, an expert gym fitness and nutrition assistant. Be concise, practical, and encouraging. Keep responses under 200 words. Recommend consulting a doctor for medical issues.

${context ? `Conversation so far:\n${context}\n\n` : ''}User: ${message}
Coach:`;

    const responseText = await generateWithFallback(prompt);
    const reply = responseText.replace(/^Coach:\s*/i, '').trim();

    // Save to session
    history.push({ role: 'user', content: message });
    history.push({ role: 'ai', content: reply });
    if (history.length > 20) history.splice(0, history.length - 20);
    chatSessions.set(userId, history);

    res.json({ success: true, response: reply });
});

exports.clearChatSession = asyncHandler(async (req, res) => {
    chatSessions.delete(req.user._id.toString());
    res.json({ success: true, message: 'Chat session cleared' });
});

// ─── AT-RISK MEMBER DETECTION ──────────────────────────────────────────────────
exports.detectAtRiskMembers = asyncHandler(async (req, res) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const atRiskMembers = await User.find({
        role: 'member',
        status: 'active',
        membershipExpiry: { $gte: new Date() },
        $or: [
            { lastVisit: { $lt: sevenDaysAgo } },
            { lastVisit: { $exists: false } },
        ],
    }).select('username email phoneNumber lastVisit membershipExpiry memberId').limit(50);

    if (atRiskMembers.length === 0) {
        return res.json({ success: true, atRiskCount: 0, members: [] });
    }

    const memberSummary = atRiskMembers.map(m => ({
        name: m.username,
        daysSinceVisit: m.lastVisit
            ? Math.floor((Date.now() - m.lastVisit) / (24 * 60 * 60 * 1000))
            : 999,
    }));

    let aiScores = {};
    try {
        const prompt = `Gym member churn risk analysis. Assign risk score 1-10 and one action per member.
Members: ${JSON.stringify(memberSummary)}
Respond ONLY with JSON array (no extra text): [{"name":"...","riskScore":8,"suggestion":"Send re-engagement WhatsApp"}]`;

        const text = await generateWithFallback(prompt);
        const scores = extractJSON(text, true);
        scores.forEach(s => { aiScores[s.name] = s; });
    } catch (err) {
        console.warn('[AI Risk] AI scoring skipped, using rule-based:', err.message);
    }

    const enriched = atRiskMembers.map(m => {
        const days = m.lastVisit ? Math.floor((Date.now() - m.lastVisit) / (24 * 60 * 60 * 1000)) : 999;
        return {
            _id: m._id,
            name: m.username,
            email: m.email,
            phone: m.phoneNumber,
            memberId: m.memberId,
            lastVisit: m.lastVisit,
            membershipExpiry: m.membershipExpiry,
            daysSinceVisit: days,
            riskScore: aiScores[m.username]?.riskScore || Math.min(10, Math.floor(days / 3)),
            suggestion: aiScores[m.username]?.suggestion || 'Send a re-engagement message',
        };
    }).sort((a, b) => b.riskScore - a.riskScore);

    res.json({ success: true, atRiskCount: enriched.length, members: enriched });
});

// ─── PERSONALIZED RECOMMENDATIONS ─────────────────────────────────────────────
exports.getPersonalizedRecommendations = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user._id;
    const user = await User.findById(userId).select('-password -refreshToken');

    if (!user) { res.status(404); throw new Error('User not found'); }

    const prompt = `Gym business advisor. Suggest 4 personalized recommendations for this member.
Profile: age ${user.profile?.age || 'unknown'}, gender ${user.gender || 'unknown'}, goals: ${(user.profile?.goals || []).join(', ') || 'general'}, level: ${user.fitnessLevel || 'beginner'}, plan: ${user.membershipType || 'none'}, last visit: ${user.lastVisit?.toISOString().split('T')[0] || 'never'}.

Respond ONLY with JSON array: [{"title":"...","reason":"...","category":"supplement|plan|class|personal_training","cta":"..."}]`;

    try {
        const text = await generateWithFallback(prompt);
        const recommendations = extractJSON(text, true);
        res.json({ success: true, recommendations, generatedFor: userId });
    } catch (err) {
        res.json({ success: true, recommendations: [], error: 'Could not generate recommendations right now' });
    }
});
