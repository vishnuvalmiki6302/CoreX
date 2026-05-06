const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const PlanProgram = require('./models/PlanProgram');

// Helper to build a meal entry
const m = (type, time, items) => ({ type, time, items, notes: '' });
const f = (name, portion, calories) => ({ name, portion, calories });

const starterMeals = {
  Monday: [
    m('Breakfast','07:30', [f('Oats with banana','1 bowl',320), f('Boiled eggs','2',140)]),
    m('Lunch','13:00', [f('Rice & dal','1 plate',400), f('Cucumber raita','1 cup',80)]),
    m('Dinner','20:00', [f('Chapati & paneer sabzi','2 roti',450), f('Buttermilk','1 glass',60)])
  ],
  Tuesday: [
    m('Breakfast','07:30', [f('Poha with peanuts','1 bowl',280), f('Curd','1 cup',100)]),
    m('Lunch','13:00', [f('Jeera rice & rajma','1 plate',420), f('Green salad','1 bowl',50)]),
    m('Dinner','20:00', [f('Egg bhurji & roti','2 roti',400), f('Warm milk','1 glass',120)])
  ],
  Wednesday: [
    m('Breakfast','07:30', [f('Idli & sambar','3 idlis',300), f('Coconut chutney','2 tbsp',60)]),
    m('Lunch','13:00', [f('Brown rice & chicken curry','1 plate',480), f('Papad','1',40)]),
    m('Dinner','20:00', [f('Moong dal khichdi','1 bowl',350), f('Pickle','1 tbsp',10)])
  ],
  Thursday: [
    m('Breakfast','07:30', [f('Besan chilla','2',260), f('Mint chutney','2 tbsp',20)]),
    m('Lunch','13:00', [f('Roti & aloo gobi','2 roti',400), f('Curd rice','small bowl',180)]),
    m('Dinner','20:00', [f('Grilled fish & salad','150g',320), f('Lemon rice','1 cup',200)])
  ],
  Friday: [
    m('Breakfast','07:30', [f('Cornflakes with milk','1 bowl',280), f('Apple','1',80)]),
    m('Lunch','13:00', [f('Veg biryani','1 plate',450), f('Raita','1 cup',80)]),
    m('Dinner','20:00', [f('Soup & bread','1 bowl + 2 slices',300), f('Banana','1',90)])
  ],
  Saturday: [
    m('Breakfast','08:00', [f('Paratha with curd','1',350), f('Fruit juice','1 glass',120)]),
    m('Lunch','13:00', [f('Dal rice & papad','1 plate',380), f('Salad','1 bowl',50)]),
    m('Dinner','20:00', [f('Light upma','1 bowl',280), f('Warm turmeric milk','1 glass',100)])
  ],
};

const proMeals = {
  Monday: [
    m('Breakfast','07:00', [f('Egg white omelette','4 whites',200), f('Multigrain toast','2 slices',180), f('Black coffee','1 cup',5)]),
    m('Pre-Workout','16:00', [f('Banana & peanut butter','1+1tbsp',180)]),
    m('Lunch','13:00', [f('Grilled chicken breast','200g',330), f('Brown rice','1 cup',220), f('Steamed broccoli','1 cup',55)]),
    m('Dinner','20:30', [f('Paneer tikka','150g',300), f('Roti','2',200), f('Mixed veg','1 bowl',80)])
  ],
  Tuesday: [
    m('Breakfast','07:00', [f('Protein smoothie','1 glass',320), f('Almonds','10',70)]),
    m('Pre-Workout','16:00', [f('Sweet potato','1 medium',110), f('Green tea','1 cup',5)]),
    m('Lunch','13:00', [f('Fish curry','200g',280), f('Quinoa','1 cup',220), f('Spinach salad','1 bowl',45)]),
    m('Dinner','20:30', [f('Chicken soup','1 bowl',200), f('Garlic bread','2 slices',180)])
  ],
  Wednesday: [
    m('Breakfast','07:00', [f('Masala oats','1 bowl',300), f('Boiled eggs','3',210)]),
    m('Pre-Workout','16:00', [f('Dates & walnuts','5+5',200)]),
    m('Lunch','13:00', [f('Tandoori chicken','200g',350), f('Jeera rice','1 cup',210), f('Cucumber salad','1 bowl',30)]),
    m('Dinner','20:30', [f('Egg curry','2 eggs',280), f('Chapati','2',200)])
  ],
  Thursday: [
    m('Breakfast','07:00', [f('Greek yogurt parfait','1 bowl',280), f('Honey granola','2 tbsp',120)]),
    m('Pre-Workout','16:00', [f('Apple & almond butter','1+1tbsp',170)]),
    m('Lunch','13:00', [f('Mutton keema','150g',320), f('Brown rice','1 cup',220), f('Raita','1 cup',80)]),
    m('Dinner','20:30', [f('Tofu stir-fry','200g',250), f('Multigrain roti','2',200)])
  ],
  Friday: [
    m('Breakfast','07:00', [f('Moong dal dosa','2',280), f('Coconut chutney','2 tbsp',60), f('Boiled egg','1',70)]),
    m('Pre-Workout','16:00', [f('Protein bar','1',200)]),
    m('Lunch','13:00', [f('Grilled salmon','200g',370), f('Mashed sweet potato','1 cup',180), f('Green beans','1 cup',40)]),
    m('Dinner','20:30', [f('Dal makhani','1 bowl',280), f('Naan','1',260)])
  ],
  Saturday: [
    m('Breakfast','08:00', [f('Avocado toast','2 slices',340), f('Orange juice','1 glass',110)]),
    m('Lunch','13:00', [f('Chole & rice','1 plate',420), f('Onion salad','1 bowl',30)]),
    m('Dinner','20:00', [f('Vegetable soup','1 bowl',150), f('Grilled cottage cheese','100g',200)])
  ],
};

const eliteMeals = {
  Monday: [
    m('Breakfast','06:30', [f('Egg white omelette + cheese','6 whites',320), f('Oats pancake','2',250), f('Black coffee','1 cup',5)]),
    m('Pre-Workout','15:30', [f('Rice cakes & honey','3+1tbsp',200), f('BCAA drink','1 scoop',30)]),
    m('Lunch','12:30', [f('Chicken breast','250g',410), f('Basmati rice','1.5 cup',330), f('Avocado','half',120), f('Steamed veggies','1 cup',55)]),
    m('Post-Workout','18:00', [f('Whey protein shake','2 scoops',240), f('Banana','1',90)]),
    m('Dinner','21:00', [f('Grilled steak / paneer','200g',380), f('Sweet potato mash','1 cup',180), f('Mixed greens','1 bowl',40)])
  ],
  Tuesday: [
    m('Breakfast','06:30', [f('Protein french toast','3 slices',350), f('Mixed berries','1 cup',80), f('Peanut butter','1 tbsp',90)]),
    m('Pre-Workout','15:30', [f('Banana & oats bar','1',220)]),
    m('Lunch','12:30', [f('Grilled fish','250g',350), f('Brown rice','1.5 cup',330), f('Broccoli & beans','1 cup',60)]),
    m('Post-Workout','18:00', [f('Whey isolate','2 scoops',230), f('Dextrose','30g',120)]),
    m('Dinner','21:00', [f('Egg curry','4 eggs',420), f('Multigrain roti','3',300)])
  ],
  Wednesday: [
    m('Breakfast','06:30', [f('Chicken sausage','3',300), f('Scrambled eggs','3',210), f('Whole wheat toast','2',160)]),
    m('Pre-Workout','15:30', [f('Sweet potato','1 large',160), f('Honey','1 tbsp',60)]),
    m('Lunch','12:30', [f('Mutton curry','200g',400), f('Jeera rice','1.5 cup',310), f('Salad','1 bowl',40)]),
    m('Post-Workout','18:00', [f('Mass gainer shake','1 serve',420)]),
    m('Dinner','21:00', [f('Tandoori prawns','200g',280), f('Garlic naan','2',360), f('Dal tadka','1 bowl',180)])
  ],
  Thursday: [
    m('Breakfast','06:30', [f('Overnight oats','1 jar',380), f('Protein powder','1 scoop',120), f('Chia seeds','1 tbsp',60)]),
    m('Pre-Workout','15:30', [f('Rice cakes','3',150), f('Jam','1 tbsp',50)]),
    m('Lunch','12:30', [f('Turkey breast / soya chunks','200g',340), f('Pasta (whole wheat)','1.5 cup',330), f('Olive oil dressing','1 tbsp',120)]),
    m('Post-Workout','18:00', [f('Whey protein','2 scoops',240), f('Dates','3',70)]),
    m('Dinner','21:00', [f('Butter chicken','200g',430), f('Basmati rice','1 cup',220), f('Raita','1 cup',80)])
  ],
  Friday: [
    m('Breakfast','06:30', [f('Egg bhurji','4 eggs',340), f('Paratha','2',360), f('Green tea','1 cup',5)]),
    m('Pre-Workout','15:30', [f('Peanut butter sandwich','1',280)]),
    m('Lunch','12:30', [f('Grilled chicken thighs','250g',420), f('Sweet potato','2 medium',260), f('Coleslaw','1 cup',60)]),
    m('Post-Workout','18:00', [f('Whey + creatine','1 serve',250)]),
    m('Dinner','21:00', [f('Fish tikka','200g',300), f('Naan','2',340), f('Palak paneer','1 bowl',250)])
  ],
  Saturday: [
    m('Breakfast','07:30', [f('Smoothie bowl','1 large',400), f('Granola topping','3 tbsp',150)]),
    m('Lunch','13:00', [f('Biryani (chicken)','1 plate',550), f('Mint raita','1 cup',80)]),
    m('Snack','16:00', [f('Protein shake','1 scoop',120), f('Mixed nuts','30g',170)]),
    m('Dinner','20:30', [f('Grilled paneer / tofu','200g',320), f('Vegetable soup','1 bowl',120)])
  ],
};

const buildSchedule = (exercises, mealsMap, cals) =>
  exercises.map(e => ({ ...e, meals: mealsMap[e.day] || [], totalCalories: cals[e.day] || 2000 }));

const starterExercises = [
  { day:'Monday', focus:'Full Body Basics', exercises:[{name:'Bodyweight Squats',sets:3,reps:'15',rest:'60s'},{name:'Push-Ups',sets:3,reps:'10',rest:'60s'},{name:'Plank Hold',sets:3,reps:'30s',rest:'45s'}]},
  { day:'Tuesday', focus:'Cardio + Core', exercises:[{name:'Jumping Jacks',sets:3,reps:'30',rest:'45s'},{name:'Mountain Climbers',sets:3,reps:'20',rest:'45s'},{name:'Crunches',sets:3,reps:'15',rest:'45s'}]},
  { day:'Wednesday', focus:'Upper Body', exercises:[{name:'Dumbbell Shoulder Press',sets:3,reps:'12',rest:'60s'},{name:'Bicep Curls',sets:3,reps:'12',rest:'60s'},{name:'Tricep Dips',sets:3,reps:'10',rest:'60s'}]},
  { day:'Thursday', focus:'Lower Body', exercises:[{name:'Lunges',sets:3,reps:'12 each',rest:'60s'},{name:'Calf Raises',sets:3,reps:'20',rest:'45s'},{name:'Glute Bridges',sets:3,reps:'15',rest:'60s'}]},
  { day:'Friday', focus:'Cardio Blast', exercises:[{name:'Brisk Walk / Jog',sets:1,reps:'30 min',rest:'-'},{name:'Jump Rope',sets:3,reps:'2 min',rest:'60s'}]},
  { day:'Saturday', focus:'Active Recovery', isRestDay:true, exercises:[]},
];
const starterCals = {Monday:1800,Tuesday:1750,Wednesday:1800,Thursday:1800,Friday:1700,Saturday:1600};

const proExercises = [
  { day:'Monday', focus:'Chest & Triceps', exercises:[{name:'Bench Press',sets:4,reps:'10-12',rest:'90s'},{name:'Incline DB Press',sets:3,reps:'12',rest:'75s'},{name:'Cable Fly',sets:3,reps:'15',rest:'60s'},{name:'Tricep Pushdown',sets:4,reps:'12',rest:'60s'},{name:'Overhead Extension',sets:3,reps:'12',rest:'60s'}]},
  { day:'Tuesday', focus:'Back & Biceps', exercises:[{name:'Deadlift',sets:4,reps:'8',rest:'2min'},{name:'Pull-Ups',sets:4,reps:'8-10',rest:'90s'},{name:'Seated Row',sets:3,reps:'12',rest:'75s'},{name:'Barbell Curl',sets:4,reps:'10',rest:'60s'},{name:'Hammer Curl',sets:3,reps:'12',rest:'60s'}]},
  { day:'Wednesday', focus:'Legs', exercises:[{name:'Squat',sets:4,reps:'10',rest:'2min'},{name:'Leg Press',sets:4,reps:'12',rest:'90s'},{name:'Romanian Deadlift',sets:3,reps:'12',rest:'90s'},{name:'Leg Curl',sets:3,reps:'15',rest:'60s'},{name:'Calf Raise',sets:4,reps:'20',rest:'60s'}]},
  { day:'Thursday', focus:'Shoulders & Abs', exercises:[{name:'Overhead Press',sets:4,reps:'10',rest:'90s'},{name:'Lateral Raises',sets:4,reps:'15',rest:'60s'},{name:'Front Raises',sets:3,reps:'12',rest:'60s'},{name:'Hanging Leg Raise',sets:3,reps:'15',rest:'60s'},{name:'Cable Crunch',sets:3,reps:'20',rest:'45s'}]},
  { day:'Friday', focus:'Full Body Power', exercises:[{name:'Power Clean',sets:4,reps:'6',rest:'2min'},{name:'Dips (Weighted)',sets:3,reps:'10',rest:'90s'},{name:'Chin-Ups',sets:3,reps:'10',rest:'90s'},{name:'Bulgarian Split Squat',sets:3,reps:'10 each',rest:'90s'}]},
  { day:'Saturday', focus:'Active Recovery', isRestDay:true, exercises:[]},
];
const proCals = {Monday:2200,Tuesday:2300,Wednesday:2400,Thursday:2200,Friday:2300,Saturday:2000};

const eliteExercises = [
  { day:'Monday', focus:'Chest (Hypertrophy)', exercises:[{name:'Flat Bench Press',sets:5,reps:'6-8',rest:'2min',notes:'Progressive overload'},{name:'Incline DB Press',sets:4,reps:'10-12',rest:'90s'},{name:'Pec Deck Fly',sets:4,reps:'15',rest:'60s'},{name:'Close-Grip Bench',sets:3,reps:'10',rest:'90s'},{name:'Skull Crushers',sets:4,reps:'12',rest:'75s'},{name:'Rope Pushdown',sets:3,reps:'15',rest:'60s'}]},
  { day:'Tuesday', focus:'Back (Width & Thickness)', exercises:[{name:'Weighted Pull-Ups',sets:5,reps:'6-8',rest:'2min'},{name:'Barbell Row',sets:4,reps:'8',rest:'2min',notes:'Keep back straight'},{name:'T-Bar Row',sets:4,reps:'10',rest:'90s'},{name:'Lat Pulldown',sets:3,reps:'12',rest:'75s'},{name:'Straight-Arm Pulldown',sets:3,reps:'15',rest:'60s'},{name:'Concentration Curl',sets:4,reps:'12',rest:'60s'}]},
  { day:'Wednesday', focus:'Legs (Strength)', exercises:[{name:'Back Squat',sets:5,reps:'5',rest:'3min',notes:'Max effort'},{name:'Front Squat',sets:4,reps:'8',rest:'2min'},{name:'Leg Press',sets:4,reps:'15',rest:'90s'},{name:'Nordic Curl',sets:3,reps:'8',rest:'2min'},{name:'Hack Squat',sets:3,reps:'12',rest:'90s'},{name:'Seated Calf Raise',sets:5,reps:'20',rest:'60s'}]},
  { day:'Thursday', focus:'Shoulders (3D Development)', exercises:[{name:'Seated DB Press',sets:5,reps:'8',rest:'2min'},{name:'Cable Lateral Raise',sets:4,reps:'15',rest:'60s'},{name:'Reverse Pec Deck',sets:4,reps:'15',rest:'60s'},{name:'Face Pull',sets:3,reps:'20',rest:'60s'},{name:'Arnold Press',sets:3,reps:'10',rest:'90s'},{name:'Shrugs',sets:4,reps:'15',rest:'60s'}]},
  { day:'Friday', focus:'Arms + Core (Isolation)', exercises:[{name:'EZ Bar Curl',sets:4,reps:'10',rest:'75s'},{name:'Preacher Curl',sets:4,reps:'12',rest:'60s'},{name:'Overhead Extension',sets:4,reps:'12',rest:'75s'},{name:'Dips',sets:4,reps:'15',rest:'60s'},{name:'Dragon Flag',sets:3,reps:'8',rest:'90s'},{name:'Ab Wheel Rollout',sets:3,reps:'12',rest:'75s'}]},
  { day:'Saturday', focus:'Recovery + Mobility', isRestDay:true, exercises:[]},
];
const eliteCals = {Monday:2800,Tuesday:2900,Wednesday:3000,Thursday:2800,Friday:2700,Saturday:2400};

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  await PlanProgram.deleteMany({ planType: { $in: ['starter','pro','elite'] } });
  await PlanProgram.insertMany([
    { planType: 'starter', weeklySchedule: buildSchedule(starterExercises, starterMeals, starterCals) },
    { planType: 'pro', weeklySchedule: buildSchedule(proExercises, proMeals, proCals) },
    { planType: 'elite', weeklySchedule: buildSchedule(eliteExercises, eliteMeals, eliteCals) },
  ]);
  console.log('✅ Plan programs seeded with unique daily meals!');
  process.exit(0);
};
seed().catch(err => { console.error(err); process.exit(1); });
