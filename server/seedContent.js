const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('./models/Plan');
const Trainer = require('./models/Trainer');

dotenv.config({ override: true });

// Data from Plans.jsx
const plans = [
    {
        name: "Starter",
        price: "₹599",
        features: ["Access to Gym Floor", "Locker Room Access", "1 Free Trainer Session", "Water Fountain Access"],
        highlight: false,
        iconType: "Dumbbell"
    },
    {
        name: "Pro Athlete",
        price: "₹999",
        features: ["All Starter Features", "Group Classes Included", "Sauna & Steam Room", "Nutritional Guide"],
        highlight: true,
        iconType: "Zap"
    },
    {
        name: "Elite",
        price: "₹1999",
        features: ["All Pro Features", "Unlimited Personal Training", "Massage Therapy", "Private Locker"],
        highlight: false,
        iconType: "Crown"
    }
];

// Data from Trainers.jsx (Note: Images are imported in frontend, here we use placeholders or consistent paths if we had them)
// For now, I'll use placeholders that the frontend will need to handle or map back to imports if they are local files.
// Ideally, images should be served from 'uploads' or a CDN. Since they were local imports, I will store a string identifier so frontend can map it, 
// OR I will just use the same image logic. 
// UPDATE: The user has images like "NGB.jpg". I will assume for now we store the filename and frontend handles it, 
// OR simpler: I will skip seeding images for a second and check if I can just use the filenames and serve them statically?
// Actually, to make it fully dynamic, images should be URLs.
// Let's use the filenames used in imports for now.
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

        // Clear existing data? Maybe check if empty first?
        // Let's check count first to avoid overwriting edits
        const planCount = await Plan.countDocuments();
        const trainerCount = await Trainer.countDocuments();

        if (planCount === 0) {
            await Plan.insertMany(plans);
            console.log('Plans seeded');
        } else {
            console.log('Plans already exist, skipping');
        }

        if (trainerCount === 0) {
            await Trainer.insertMany(trainers);
            console.log('Trainers seeded');
        } else {
            console.log('Trainers already exist, skipping');
        }

        console.log('Seeding complete');
        process.exit();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
