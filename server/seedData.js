const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const DietPlan = require('./models/DietPlan');
const User = require('./models/User');

dotenv.config();

const products = [
    {
        name: "Whey Protein Isolate",
        description: "High-quality whey protein isolate for muscle recovery.",
        price: 49.99,
        category: "Supplements",
        image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&q=80&w=1000",
        stock: 50,
        featured: true
    },
    {
        name: "Pre-Workout Energy",
        description: "Explosive energy and focus for your workouts.",
        price: 34.99,
        category: "Supplements",
        image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=1000",
        stock: 30,
        featured: true
    },
    {
        name: "Pro Lifting Belt",
        description: "Genuine leather lifting belt for back support.",
        price: 59.99,
        category: "Gear",
        image: "https://m.media-amazon.com/images/I/71+Z+J+R+L._AC_SL1500_.jpg",
        stock: 20,
        featured: false
    },
    {
        name: "Gym Shark T-Shirt",
        description: "Breathable athletic performance t-shirt.",
        price: 24.99,
        category: "Apparel",
        image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=1000",
        stock: 100,
        featured: false
    },
    {
        name: "Resistance Bands Set",
        description: "Set of 5 resistance bands for home workouts.",
        price: 19.99,
        category: "Equipment",
        image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&q=80&w=1000",
        stock: 40,
        featured: false
    },
    {
        name: "Creatine Monohydrate",
        description: "Pure micronized creatine for strength and power.",
        price: 29.99,
        category: "Supplements",
        image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=1000",
        stock: 60,
        featured: true
    }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        // --- SEED PRODUCTS ---
        await Product.deleteMany({});
        console.log('Cleared existing Products');

        await Product.insertMany(products);
        console.log('Products Seeded Successfully');

        // --- SEED DIET PLANS ---
        // We need a user to assign these to. Let's find an admin or create a dummy user.
        let user = await User.findOne({ role: 'admin' });
        if (!user) {
            user = await User.findOne(); // Any user
        }

        if (user) {
            await DietPlan.deleteMany({});
            console.log('Cleared existing Diet Plans');

            const sampleDietPlans = [
                {
                    member: user._id,
                    trainer: user._id, // Assigning to self for demo
                    name: "Weight Loss Protocol",
                    description: "A balanced plan focused on caloric deficit.",
                    startDate: new Date(),
                    status: "active",
                    totalCalories: 1800,
                    isCustom: false,
                    dailyMeals: [
                        {
                            type: "Breakfast",
                            time: "08:00 AM",
                            notes: "Drink water before eating",
                            items: [
                                { name: "Oatmeal", portion: "1 cup", calories: 150, protein: 5, carbs: 27, fats: 3 },
                                { name: "Eggs", portion: "2 large", calories: 140, protein: 12, carbs: 1, fats: 10 }
                            ]
                        },
                        {
                            type: "Lunch",
                            time: "01:00 PM",
                            notes: "Eat slowly",
                            items: [
                                { name: "Grilled Chicken", portion: "200g", calories: 330, protein: 60, carbs: 0, fats: 7 },
                                { name: "Brown Rice", portion: "100g", calories: 110, protein: 2, carbs: 23, fats: 1 }
                            ]
                        }
                    ]
                },
                {
                    member: user._id,
                    trainer: user._id,
                    name: "Muscle Gain Bulking",
                    description: "High protein and carb intake for hypertrophy.",
                    startDate: new Date(),
                    status: "active",
                    totalCalories: 3200,
                    isCustom: true,
                    dailyMeals: [
                        {
                            type: "Breakfast",
                            time: "07:30 AM",
                            items: [
                                { name: "Whole Eggs", portion: "4", calories: 280, protein: 24, carbs: 2, fats: 20 },
                                { name: "Toast", portion: "2 slices", calories: 160, protein: 6, carbs: 30, fats: 2 }
                            ]
                        },
                        {
                            type: "Snack",
                            time: "10:30 AM",
                            items: [
                                { name: "Protein Shake", portion: "1 scoop", calories: 120, protein: 25, carbs: 3, fats: 1 },
                                { name: "Banana", portion: "1", calories: 105, protein: 1, carbs: 27, fats: 0 }
                            ]
                        },
                        {
                            type: "Dinner",
                            time: "08:00 PM",
                            items: [
                                { name: "Steak", portion: "250g", calories: 670, protein: 62, carbs: 0, fats: 48 },
                                { name: "Sweet Potato", portion: "1 large", calories: 112, protein: 2, carbs: 26, fats: 0 }
                            ]
                        }
                    ]
                }
            ];

            await DietPlan.insertMany(sampleDietPlans);
            console.log('Diet Plans Seeded Successfully');
        } else {
            console.warn('No user found to assign Diet Plans. Skipping Diet Plan seeding.');
        }

        console.log('Data Seeding Completed!');
        process.exit();
    } catch (error) {
        console.error('Seeding Failed:', error);
        process.exit(1);
    }
};

seedData();
