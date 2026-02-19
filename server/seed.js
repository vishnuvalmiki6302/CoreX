const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exercise = require('./models/Exercise');
const Diet = require('./models/Diet');

dotenv.config({ override: true });

// Local images from /client/public/images
const images = {
    chest: '/images/chest.jpg',
    back: '/images/back.jpg',
    legs: '/images/legs.jpg',
    arms: '/images/arms.jpg',
    shoulders: '/images/shoulders.jpg',
    cardio: '/images/cardio.jpg',
    abs: '/images/abs.jpg',
    general: '/images/general.jpg'
};

const exercises = [
    // --- CHEST ---
    {
        name: 'Barbell Bench Press',
        targetBodyPart: 'Chest',
        equipment: 'Barbell',
        gifUrl: images.chest,
        instructions: ['Lie on a flat bench.', 'Grip the bar slightly wider than shoulder-width.', 'Lower the bar to your mid-chest.', 'Press back up explosively.']
    },
    {
        name: 'Incline Dumbbell Press',
        targetBodyPart: 'Chest',
        equipment: 'Dumbbell',
        gifUrl: images.chest,
        instructions: ['Set bench to 30-45 degrees.', 'Press dumbbells up from shoulder level.', 'Squeeze chest at the top.']
    },
    {
        name: 'Cable Fly',
        targetBodyPart: 'Chest',
        equipment: 'Cable',
        gifUrl: images.chest,
        instructions: ['Set pulleys to shoulder height.', 'Bring handles together in front of chest.', 'Keep a slight bend in elbows.']
    },
    {
        name: 'Push-up',
        targetBodyPart: 'Chest',
        equipment: 'Body Weight',
        gifUrl: images.chest,
        instructions: ['Keep body in a straight line.', 'Lower chest to floor.', 'Push back up full range.']
    },
    {
        name: 'Decline Barbell Press',
        targetBodyPart: 'Chest',
        equipment: 'Barbell',
        gifUrl: images.chest,
        instructions: ['Lie on decline bench.', 'Lower bar to lower chest.', 'Press up securely.']
    },
    {
        name: 'Pec Deck Machine',
        targetBodyPart: 'Chest',
        equipment: 'Machine',
        gifUrl: images.chest,
        instructions: ['Sit with back flat.', 'Bring handles together.', 'Squeeze chest hard.']
    },
    {
        name: 'Dips (Chest Version)',
        targetBodyPart: 'Chest',
        equipment: 'Body Weight',
        gifUrl: images.chest,
        instructions: ['Lean forward slightly.', 'Lower body until elbows are at 90 degrees.', 'Push up focusing on chest.']
    },

    // --- BACK ---
    {
        name: 'Deadlift',
        targetBodyPart: 'Back',
        equipment: 'Barbell',
        gifUrl: images.back,
        instructions: ['Stand with feet hip-width.', 'Grip bar outside legs.', 'Lift with legs and back straight.', 'Lock out at top.']
    },
    {
        name: 'Pull-up',
        targetBodyPart: 'Back',
        equipment: 'Body Weight',
        gifUrl: images.back,
        instructions: ['Hang from bar.', 'Pull chest to bar.', 'Lower slowly.']
    },
    {
        name: 'Bent Over Row',
        targetBodyPart: 'Back',
        equipment: 'Barbell',
        gifUrl: images.back,
        instructions: ['Bend at hips, back flat.', 'Pull bar to lower chest/upper abs.', 'Squeeze shoulder blades.']
    },
    {
        name: 'Lat Pulldown',
        targetBodyPart: 'Back',
        equipment: 'Cable',
        gifUrl: images.back,
        instructions: ['Sit securely.', 'Pull bar down to upper chest.', 'Control the eccentric phase.']
    },
    {
        name: 'Seated Cable Row',
        targetBodyPart: 'Back',
        equipment: 'Cable',
        gifUrl: images.back,
        instructions: ['Sit with knees slightly bent.', 'Pull handle to waist.', 'Avoid swinging.']
    },
    {
        name: 'Single Arm Dumbbell Row',
        targetBodyPart: 'Back',
        equipment: 'Dumbbell',
        gifUrl: images.back,
        instructions: ['Support on bench.', 'Pull dumbbell to hip.', 'Keep back neutral.']
    },
    {
        name: 'T-Bar Row',
        targetBodyPart: 'Back',
        equipment: 'Machine',
        gifUrl: images.back,
        instructions: ['Straddle the bar.', 'Pull up squeezing the back.', 'Keep core tight.']
    },

    // --- LEGS ---
    {
        name: 'Barbell Squat',
        targetBodyPart: 'Legs',
        equipment: 'Barbell',
        gifUrl: images.legs,
        instructions: ['Bar on upper back.', 'Squat till thighs parallel.', 'Drive up through heels.']
    },
    {
        name: 'Leg Press',
        targetBodyPart: 'Legs',
        equipment: 'Machine',
        gifUrl: images.legs,
        instructions: ['Place feet shoulder width.', 'Lower weight deep.', 'Push back up without locking knees.']
    },
    {
        name: 'Lunges',
        targetBodyPart: 'Legs',
        equipment: 'Dumbbell',
        gifUrl: images.legs,
        instructions: ['Step forward.', 'Lower back knee to ground.', 'Push back to start.']
    },
    {
        name: 'Leg Extension',
        targetBodyPart: 'Legs',
        equipment: 'Machine',
        gifUrl: images.legs,
        instructions: ['Sit and hook feet.', 'Extend legs fully.', 'Squeeze quads.']
    },
    {
        name: 'Lying Leg Curl',
        targetBodyPart: 'Legs',
        equipment: 'Machine',
        gifUrl: images.legs,
        instructions: ['Lie face down.', 'Curl weight to glutes.', 'Control the lowering.']
    },
    {
        name: 'Romanian Deadlift',
        targetBodyPart: 'Legs',
        equipment: 'Barbell',
        gifUrl: images.legs,
        instructions: ['Hinge at hips.', 'Lower bar keeping legs slightly bent.', 'Feel stretch in hamstrings.', 'Pull back up.']
    },
    {
        name: 'Calf Raise',
        targetBodyPart: 'Legs',
        equipment: 'Machine',
        gifUrl: images.legs,
        instructions: ['Stand on edge of step.', 'Lower heels down.', 'Raise up on toes.']
    },

    // --- SHOULDERS ---
    {
        name: 'Overhead Press',
        targetBodyPart: 'Shoulders',
        equipment: 'Barbell',
        gifUrl: images.shoulders,
        instructions: ['Stand with core tight.', 'Press bar from shoulders to overhead.', 'Lock out at top.']
    },
    {
        name: 'Dumbbell Shoulder Press',
        targetBodyPart: 'Shoulders',
        equipment: 'Dumbbell',
        gifUrl: images.shoulders,
        instructions: ['Sit on bench support.', 'Press dumbbells overhead.', 'Lower to ear level.']
    },
    {
        name: 'Lateral Raise',
        targetBodyPart: 'Shoulders',
        equipment: 'Dumbbell',
        gifUrl: images.shoulders,
        instructions: ['Stand with slight lean.', 'Raise arms to side.', 'Pour imaginary water jug at top.']
    },
    {
        name: 'Front Raise',
        targetBodyPart: 'Shoulders',
        equipment: 'Dumbbell',
        gifUrl: images.shoulders,
        instructions: ['Raise dumbbell in front to shoulder height.', 'Control the descent.']
    },
    {
        name: 'Face Pull',
        targetBodyPart: 'Shoulders',
        equipment: 'Cable',
        gifUrl: images.shoulders,
        instructions: ['Pull rope to face.', 'External rotation at end.', 'Squeeze rear delts.']
    },
    {
        name: 'Arnold Press',
        targetBodyPart: 'Shoulders',
        equipment: 'Dumbbell',
        gifUrl: images.shoulders,
        instructions: ['Start palms facing you.', 'Rotate as you press up.', 'End palms facing away.']
    },

    // --- ARMS (BICEPS/TRICEPS) ---
    {
        name: 'Barbell Curl',
        targetBodyPart: 'Arms',
        equipment: 'Barbell',
        gifUrl: images.arms,
        instructions: ['Stand straight.', 'Curl bar to chest.', 'Squeeze biceps.', 'Lower slowly.']
    },
    {
        name: 'Hammer Curl',
        targetBodyPart: 'Arms',
        equipment: 'Dumbbell',
        gifUrl: images.arms,
        instructions: ['Palms facing each other.', 'Curl dumbbell up.', 'Works brachialis.']
    },
    {
        name: 'Preacher Curl',
        targetBodyPart: 'Arms',
        equipment: 'Machine',
        gifUrl: images.arms,
        instructions: ['Arm over pad.', 'Curl without moving shoulder.', 'Full extension efficiently.']
    },
    {
        name: 'Tricep Pushdown',
        targetBodyPart: 'Arms',
        equipment: 'Cable',
        gifUrl: images.arms,
        instructions: ['Keep elbows tucked.', 'Push bar/rope down.', 'Squeeze triceps at bottom.']
    },
    {
        name: 'Skull Crusher',
        targetBodyPart: 'Arms',
        equipment: 'Barbell',
        gifUrl: images.arms,
        instructions: ['Lie on bench.', 'Lower bar to forehead.', 'Extend arms back up.']
    },
    {
        name: 'Dips (Tricep Version)',
        targetBodyPart: 'Arms',
        equipment: 'Body Weight',
        gifUrl: images.arms,
        instructions: ['Keep body upright.', 'Lower until elbows 90 deg.', 'Push up using triceps.']
    },

    // --- ABS/CORE ---
    {
        name: 'Plank',
        targetBodyPart: 'Abs',
        equipment: 'Body Weight',
        gifUrl: images.abs,
        instructions: ['Hold pushup position on elbows.', 'Keep core tight.', 'Don\'t let hips sag.']
    },
    {
        name: 'Crunch',
        targetBodyPart: 'Abs',
        equipment: 'Body Weight',
        gifUrl: images.abs,
        instructions: ['Lie on back.', 'Lift shoulders off ground.', 'Squeeze abs.', 'Lower slowly.']
    },
    {
        name: 'Leg Raise',
        targetBodyPart: 'Abs',
        equipment: 'Body Weight',
        gifUrl: images.abs,
        instructions: ['Lie flat.', 'Raise legs to vertical.', 'Lower slowly without touching floor.']
    },
    {
        name: 'Russian Twist',
        targetBodyPart: 'Abs',
        equipment: 'Body Weight',
        gifUrl: images.abs,
        instructions: ['Sit with feet off ground.', 'Rotate torso side to side.', 'Touch floor with hands.']
    },

    // --- CARDIO ---
    {
        name: 'Treadmill Run',
        targetBodyPart: 'Cardio',
        equipment: 'Machine',
        gifUrl: images.cardio,
        instructions: ['Start slow walk.', 'Increase speed to run.', 'Maintain steady pace.']
    },
    {
        name: 'Cycling',
        targetBodyPart: 'Cardio',
        equipment: 'Machine',
        gifUrl: images.cardio,
        instructions: ['Adjust seat height.', 'Pedal at consistent RPM.', 'Adjust resistance as needed.']
    },
    {
        name: 'Jump Rope',
        targetBodyPart: 'Cardio',
        equipment: 'Body Weight',
        gifUrl: images.cardio,
        instructions: ['Swing rope over head.', 'Jump over it.', 'Stay on toes.']
    },
    {
        name: 'Burpees',
        targetBodyPart: 'Cardio',
        equipment: 'Body Weight',
        gifUrl: images.cardio,
        instructions: ['Drop to pushup.', 'Jump feet in.', 'Jump up explosively.', 'Repeat.']
    }
];

// --- Detailed Diet Plans ---
const diets = [
    {
        title: 'Lean Muscle Bulking',
        goal: 'Hypertrophy',
        calories: 3200,
        macros: {
            protein: '220g',
            carbs: '380g',
            fats: '90g'
        },
        meals: {
            breakfast: ['6 Egg Whites, 2 Whole Eggs', '1.5 cups Oatmeal', '1 Banana', '1 tbsp Peanut Butter'],
            lunch: ['8oz Grilled Chicken Breast', '2 cups Jasmine Rice', '1 cup Broccoli'],
            dinner: ['8oz Lean Steak or Salmon', '1 Large Sweet Potato', 'Mixed Green Salad'],
            snacks: ['Protein Shake (2 scoops)', 'Greek Yogurt with Berries', 'Handful of Almonds']
        }
    },
    {
        title: 'Aggressive Fat Loss',
        goal: 'Weight Loss',
        calories: 1800,
        macros: {
            protein: '200g',
            carbs: '100g',
            fats: '65g'
        },
        meals: {
            breakfast: ['3 Egg Whites, Spinach Omelet', '1 slice Whole Wheat Toast', 'Black Coffee'],
            lunch: ['6oz Turkey Breast', 'Large Mixed Salad (Spinach, Cucumber)', '1 tbsp Olive Oil Dressing'],
            dinner: ['6oz White Fish (Cod/Tilapia)', '2 cups Steamed Asparagus', 'Cauliflower Rice'],
            snacks: ['Celery sticks with Hummus', '1 Scoop Whey Protein with Water']
        }
    },
    {
        title: 'Keto Cyclical',
        goal: 'Fat Loss / Endurance',
        calories: 2400,
        macros: {
            protein: '180g',
            carbs: '30g',
            fats: '170g'
        },
        meals: {
            breakfast: ['3 Whole Eggs cooked in Butter', '3 slices Bacon', 'Half Avocado'],
            lunch: ['Fatty Steak (Ribeye)', 'Spinach sautéed in Olive Oil', 'Cheese garnish'],
            dinner: ['Salmon Fillet with skin', 'Asparagus with Hollandaise Sauce'],
            snacks: ['Macadamia Nuts', 'String Cheese', 'Pork Rinds']
        }
    },
    {
        title: 'High Performance Athlete',
        goal: 'Maintenance / Performance',
        calories: 2800,
        macros: {
            protein: '180g',
            carbs: '350g',
            fats: '80g'
        },
        meals: {
            breakfast: ['Overnight Oats with Chia Seeds', 'Scoop of Protein Powder', 'Blueberries'],
            lunch: ['Tuna Pasta Salad', 'Whole Grain Pasta', 'Veggies'],
            dinner: ['Grilled Chicken Thighs', 'Quinoa', 'Roasted Root Vegetables'],
            snacks: ['Apple with Almond Butter', 'Energy Bar', 'Pre-workout Fruit']
        }
    },
    {
        title: 'Vegetarian Muscle',
        goal: 'Build Muscle (Veg)',
        calories: 2600,
        macros: {
            protein: '160g',
            carbs: '320g',
            fats: '90g'
        },
        meals: {
            breakfast: ['Greek Yogurt Parfait', 'Granola', 'Honey', 'Hemp Seeds'],
            lunch: ['Lentil Curry', 'Brown Rice', 'Naan Bread'],
            dinner: ['Tofu Stir-fry', 'Rice Noodles', 'Wait', 'Peanut Sauce'],
            snacks: ['Hard Boiled Eggs', 'Protein Shake (Pea Protein)', 'Fruit Salad']
        }
    }
];

const seedDB = async () => {
    try {
        console.log('Connecting to DB for seeding...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to:', mongoose.connection.host);

        console.log('Clearing old data...');
        await Exercise.deleteMany();
        await Diet.deleteMany();

        console.log(`Seeding ${exercises.length} exercises...`);
        await Exercise.insertMany(exercises);

        console.log(`Seeding ${diets.length} diet plans...`);
        await Diet.insertMany(diets);

        console.log('Database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedDB();
