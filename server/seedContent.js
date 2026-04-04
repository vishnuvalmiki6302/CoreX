const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('./models/Plan');
const Trainer = require('./models/Trainer');

dotenv.config({ override: true });

// Data from Plans.jsx
const plans = [
    {
        name: "Starter",
        price: 599,
        features: ["Access to Gym Floor", "Locker Room Access", "1 Free Trainer Session", "Water Fountain Access"],
        highlight: false,
        iconType: "Dumbbell",
        type: "starter",
        durationMonths: 1
    },
    {
        name: "Pro Athlete",
        price: 999,
        features: ["All Starter Features", "Group Classes Included", "Sauna & Steam Room", "Nutritional Guide"],
        highlight: true,
        iconType: "Zap",
        type: "pro",
        durationMonths: 1
    },
    {
        name: "Elite",
        price: 1999,
        features: ["All Pro Features", "Unlimited Personal Training", "Massage Therapy", "Private Locker"],
        highlight: false,
        iconType: "Crown",
        type: "elite",
        durationMonths: 1
    }
];

// Data from Trainers.jsx
const trainers = [
    {
        name: "Naveen Golden Boy",
        role: "Strength & Conditioning",
        imageUrl: "/assets/Images/NGB.jpg",
        socials: { instagram: "#", twitter: "#", linkedin: "#" }
    },
    {
        name: "Fit Vastav",
        role: "HIIT & Cardio Specialist",
        imageUrl: "/assets/Images/Vastav.jpg",
        socials: { instagram: "#", twitter: "#", linkedin: "#" }
    },
    {
        name: "Mike Chen",
        role: "Yoga & Mobility",
        imageUrl: "/assets/Images/M2.avif",
        socials: { instagram: "#", twitter: "#", linkedin: "#" }
    },
    {
        name: "Sana",
        role: "Nutrition Expert",
        imageUrl: "/assets/Images/M1.avif",
        socials: { instagram: "#", twitter: "#", linkedin: "#" }
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Overwrite existing data to fix bugs
        console.log('Clearing existing plans and trainers...');
        await Plan.deleteMany();
        await Trainer.deleteMany();

        await Plan.insertMany(plans);
        console.log('Plans seeded successfully');

        await Trainer.insertMany(trainers);
        console.log('Trainers seeded successfully');

        console.log('Seeding complete');
        process.exit();

    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
