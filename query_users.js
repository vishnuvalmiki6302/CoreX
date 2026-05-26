const mongoose = require('mongoose');
const User = require('./server/models/User.js');

mongoose.connect('mongodb+srv://vishnu123:vishnu1234@gym.fsb74hs.mongodb.net/gym-genix')
  .then(async () => {
    const admin = await User.findOne({ role: 'super_admin' }, 'email password');
    const receptionist = await User.findOne({ role: 'receptionist' }, 'email password');
    const trainer = await User.findOne({ role: { $in: ['male_trainer', 'female_trainer', 'trainer'] } }, 'email password');
    const member = await User.findOne({ role: 'member' }, 'email password');
    
    console.log('--- CREDENTIALS ---');
    console.log('Admin:', admin?.email);
    console.log('Receptionist:', receptionist?.email);
    console.log('Trainer:', trainer?.email);
    console.log('Member:', member?.email);
    
    process.exit();
  })
  .catch(console.error);
