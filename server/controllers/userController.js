const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Update basic info if provided
            user.username = req.body.username || user.username;
            // user.email = req.body.email || user.email; // Email usually shouldn't be changed easily

            // Handle profile photo
            if (req.file) {
                user.profilePhoto = `/${req.file.path.replace(/\\/g, '/')}`; // Normalize path
            }

            // Update profile data
            let profileUpdates = {};
            if (req.body.profile) {
                try {
                    // Start by assuming it's an object if it came via JSON
                    profileUpdates = req.body.profile;

                    // If it came via Multipart/FormData, it might be a JSON string
                    if (typeof req.body.profile === 'string') {
                        profileUpdates = JSON.parse(req.body.profile);
                    }
                } catch (e) {
                    console.error("Error parsing profile JSON", e);
                }
            }

            if (Object.keys(profileUpdates).length > 0) {
                user.profile = {
                    ...user.profile,
                    ...profileUpdates
                };
            }

            // Update new member fields
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.address = req.body.address || user.address;
            user.medicalNotes = req.body.medicalNotes || user.medicalNotes;

            if (req.body.emergencyContact) {
                try {
                    let contact = req.body.emergencyContact;
                    if (typeof contact === 'string') {
                        contact = JSON.parse(contact);
                    }
                    user.emergencyContact = contact;
                } catch (e) {
                    console.error("Error parsing emergencyContact JSON", e);
                }
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                profile: updatedUser.profile,
                profilePhoto: updatedUser.profilePhoto,
                memberId: updatedUser.memberId,
                phoneNumber: updatedUser.phoneNumber,
                // ... other fields as needed
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all members
// @route   GET /api/users
// @access  Private/Admin
exports.getMembers = async (req, res, next) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all trainers
// @route   GET /api/users/trainers
// @access  Public
exports.getTrainers = async (req, res, next) => {
    try {
        const trainers = await User.find({ role: 'trainer' }).select('username _id profilePhoto');
        res.json(trainers);
    } catch (error) {
        next(error);
    }
};

// @desc    Get clients assigned to trainer
// @route   GET /api/users/my-clients
// @access  Private/Trainer
exports.getMyClients = async (req, res, next) => {
    try {
        const clients = await User.find({ assignedTrainer: req.user._id });
        res.json(clients);
    } catch (error) {
        next(error);
    }
};

// @desc    Get member by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getMemberById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update member
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateMember = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.status = req.body.status || user.status;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.address = req.body.address || user.address;
            user.medicalNotes = req.body.medicalNotes || user.medicalNotes;
            user.membershipType = req.body.membershipType || user.membershipType;
            user.planStartDate = req.body.planStartDate || user.planStartDate;
            user.membershipExpiry = req.body.membershipExpiry || user.membershipExpiry;

            if (req.body.assignedTrainer) {
                user.assignedTrainer = req.body.assignedTrainer;
            }

            if (req.body.emergencyContact) {
                user.emergencyContact = req.body.emergencyContact;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete member
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteMember = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new member (Admin)
// @route   POST /api/users
// @access  Private/Admin
exports.createMember = async (req, res, next) => {
    try {
        const { username, email, password, phoneNumber, address, membershipType, planStartDate, membershipExpiry } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            phoneNumber,
            address,
            membershipType: membershipType || 'none',
            role: 'user',
            planStartDate,
            membershipExpiry
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                memberId: user.memberId
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};
