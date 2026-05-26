const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/.env' });
const User = require('./server/models/User.js');

const createDevUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const testUsers = [
            { username: 'Dev Admin', email: 'admin@gmail.com', password: '123456', role: 'super_admin' },
            { username: 'Dev Reception', email: 'receptionist@gmail.com', password: '123456', role: 'receptionist' },
            { username: 'Dev Trainer', email: 'trainer@gmail.com', password: '123456', role: 'trainer' },
            { username: 'Dev Member', email: 'user@gmail.com', password: '123456', role: 'member' }
        ];

        for (let u of testUsers) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(u.password, salt);
                
                await User.create({
                    username: u.username,
                    email: u.email,
                    password: hashedPassword,
                    role: u.role,
                    phone: '1234567890'
                });
                console.log(`Created: ${u.email}`);
            } else {
                console.log(`Already exists: ${u.email}`);
            }
        }

        console.log('Finished creating test users!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createDevUsers();
