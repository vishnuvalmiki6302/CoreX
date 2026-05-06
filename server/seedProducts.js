const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
    // Supplements
    {
        name: 'CoreX Iso-Whey Protein',
        description: 'Premium isolate whey protein for rapid recovery and muscle growth. 25g protein per scoop.',
        price: 2499,
        category: 'Supplements',
        image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80', // Perfect protein tub
        stock: 50,
        featured: true
    },
    {
        name: 'CoreX Pre-Workout Blast',
        description: 'High-energy pre-workout formula with caffeine, beta-alanine, and citrulline for explosive workouts.',
        price: 1899,
        category: 'Supplements',
        image: 'https://images.unsplash.com/photo-1605296830714-7cabaad42352?w=600&auto=format&fit=crop&q=80', // Shaker bottle/pre-workout
        stock: 30,
        featured: true
    },
    {
        name: 'BCAA + Glutamine Matrix',
        description: 'Intra-workout recovery drink to prevent muscle breakdown and reduce fatigue.',
        price: 1499,
        category: 'Supplements',
        image: 'https://images.unsplash.com/photo-1622484211148-7104cb1a5e11?w=600&auto=format&fit=crop&q=80', // BCAA drink setup
        stock: 45,
        featured: false
    },
    {
        name: 'CoreX Creatine Monohydrate',
        description: 'Pure micronized creatine to boost strength, power, and muscle volume.',
        price: 999,
        category: 'Supplements',
        image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600&auto=format&fit=crop&q=80', // Supplement pills/creatine
        stock: 100,
        featured: true
    },

    // Gear
    {
        name: 'Pro Leather Weightlifting Belt',
        description: 'Heavy-duty 4-inch leather belt for maximum back and core support during heavy lifts.',
        price: 1299,
        category: 'Gear',
        image: 'https://images.unsplash.com/photo-1610486891007-8e6f1f4560ea?w=600&auto=format&fit=crop&q=80', // Belt
        stock: 20,
        featured: true
    },
    {
        name: 'CoreX Knee Sleeves (Pair)',
        description: '7mm neoprene knee sleeves for joint support, warmth, and compression during squats.',
        price: 899,
        category: 'Gear',
        image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80', // Gear close up
        stock: 40,
        featured: false
    },
    {
        name: 'Heavy Duty Wrist Wraps',
        description: '18-inch elastic wrist wraps providing stability for heavy pressing movements.',
        price: 499,
        category: 'Gear',
        image: 'https://plus.unsplash.com/premium_photo-1664109999537-088e7d964da2?w=600&auto=format&fit=crop&q=80', // Wraps/tape
        stock: 60,
        featured: false
    },
    {
        name: 'Premium Lifting Straps',
        description: 'Cotton lifting straps with neoprene padding for grip support on pulls and deadlifts.',
        price: 399,
        category: 'Gear',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80', // Grips/Kettlebell gear
        stock: 80,
        featured: false
    },

    // Apparel
    {
        name: 'CoreX Tactical Training Tee',
        description: 'Moisture-wicking athletic fit t-shirt built for high-intensity training.',
        price: 899,
        category: 'Apparel',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80', // Tee
        stock: 120,
        featured: false
    },
    {
        name: 'Compression Training Tights',
        description: 'High-performance compression tights designed to support muscles and regulate temperature.',
        price: 1199,
        category: 'Apparel',
        image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80', // Tights
        stock: 65,
        featured: true
    },
    {
        name: 'CoreX Oversized Pump Cover',
        description: 'Heavyweight cotton oversized hoodie perfect for warmups.',
        price: 1499,
        category: 'Apparel',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80', // Hoodie
        stock: 45,
        featured: false
    },

    // Equipment
    {
        name: 'Adjustable Dumbbell Set (up to 24kg)',
        description: 'Space-saving adjustable dumbbells with quick-select weight mechanism.',
        price: 8999,
        category: 'Equipment',
        image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80', // Dumbbells
        stock: 10,
        featured: true
    },
    {
        name: 'Pro Jump Rope',
        description: 'Speed jump rope with ball bearings and aluminum handles for double unders.',
        price: 699,
        category: 'Equipment',
        image: 'https://images.unsplash.com/photo-1517343985841-f8b2d66e010b?w=600&auto=format&fit=crop&q=80', // Jump rope
        stock: 35,
        featured: false
    },
    {
        name: 'Resistance Band Set',
        description: 'Set of 5 varying resistance bands for mobility and accessory work.',
        price: 999,
        category: 'Equipment',
        image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&auto=format&fit=crop&q=80', // Bands
        stock: 55,
        featured: false
    }
];

const seedProducts = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to:', mongoose.connection.host);

        console.log('Clearing old products...');
        await Product.deleteMany();

        console.log(`Seeding ${products.length} products...`);
        await Product.insertMany(products);

        console.log('Products seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedProducts();
