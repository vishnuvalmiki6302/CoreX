const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { logAudit } = require('../middleware/auditLogger');

// ─── REGISTER ───────────────────────────────────────────────────────────────
exports.registerUser = async (req, res, next) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) {
            res.status(400);
            throw new Error(error.details[0].message);
        }

        const { username, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        if (user) {
            generateToken(res, user._id);
            await logAudit(req, 'USER_REGISTERED', user._id, 'User', { username, email });
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                memberId: user.memberId,
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// ─── LOGIN ───────────────────────────────────────────────────────────────────
exports.loginUser = async (req, res, next) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            res.status(400);
            throw new Error(error.details[0].message);
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        const isValidPassword = user && (await bcrypt.compare(password, user.password));

        if (user && isValidPassword) {
            // Generate access token (short-lived, stored in cookie)
            generateToken(res, user._id);

            // Generate refresh token (long-lived, stored in DB + httpOnly cookie)
            const refreshToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
                { expiresIn: '30d' }
            );
            user.refreshToken = refreshToken;
            await user.save({ validateModifiedOnly: true });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });

            await logAudit(req, 'USER_LOGIN', user._id, 'User', { email });

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                memberId: user.memberId,
                profilePhoto: user.profilePhoto,
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
exports.logoutUser = async (req, res) => {
    // Invalidate refresh token in DB
    if (req.user) {
        await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
        await logAudit(req, 'USER_LOGOUT', req.user._id, 'User');
    }

    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: 'Logged out successfully' });
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
exports.refreshAccessToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            res.status(401);
            throw new Error('No refresh token');
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
        );

        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== token) {
            res.status(401);
            throw new Error('Invalid refresh token');
        }

        // Issue new access token
        generateToken(res, user._id);
        res.json({ message: 'Token refreshed', role: user.role });
    } catch (error) {
        next(error);
    }
};

// ─── GOOGLE LOGIN ─────────────────────────────────────────────────────────────
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res, next) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                username: name,
                email,
                password: hashedPassword,
            });
        }

        generateToken(res, user._id);
        await logAudit(req, 'USER_GOOGLE_LOGIN', user._id, 'User', { email });

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            memberId: user.memberId,
            profilePhoto: user.profilePhoto,
        });
    } catch (error) {
        res.status(401);
        next(new Error('Google Auth Failed: ' + error.message));
    }
};
