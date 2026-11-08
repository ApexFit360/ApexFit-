/* ApexFit data: dishes, exercises, programs, yoga, tips */

// [name, category, serving, kcal, protein g, carbs g, fat g]
var DISHES = [
["Idli","Breakfast","2 pcs",120,4,24,1],
["Plain Dosa","Breakfast","1 piece",130,3,22,3],
["Masala Dosa","Breakfast","1 piece",250,5,38,8],
["Poha","Breakfast","1 plate",250,5,42,7],
["Upma","Breakfast","1 plate",230,5,34,8],
["Plain Paratha","Breakfast","1 piece",260,5,34,11],
["Aloo Paratha","Breakfast","1 piece",300,6,40,13],
["Besan Chilla","Breakfast","1 piece",130,6,14,5],
["Moong Dal Chilla","Breakfast","1 piece",120,7,16,3],
["Dhokla","Breakfast","2 pcs",120,4,18,3],
["Egg Bhurji","Breakfast","2 eggs",200,12,3,15],
["Roti","Main","1 medium",100,3,18,2],
["Rice (Chawal)","Main","1 bowl",195,4,43,1],
["Dal Tadka","Main","1 bowl",150,7,18,5],
["Rajma","Main","1 bowl",190,9,28,4],
["Chole","Main","1 bowl",210,9,30,6],
["Paneer Butter Masala","Main","1 bowl",300,12,10,24],
["Palak Paneer","Main","1 bowl",230,11,8,17],
["Chicken Curry","Main","1 bowl",250,22,8,14],
["Butter Chicken","Main","1 bowl",300,20,10,20],
["Fish Curry","Main","1 bowl",220,22,6,12],
["Chicken Biryani","Main","1 plate",450,20,55,17],
["Veg Biryani","Main","1 plate",350,8,55,11],
["Khichdi","Main","1 bowl",180,6,30,4],
["Kadhi","Main","1 bowl",150,5,14,8],
["Aloo Gobi","Main","1 bowl",150,3,18,7],
["Bhindi Masala","Main","1 bowl",120,3,10,8],
["Sambar","Main","1 bowl",90,4,14,2],
["Curd (Dahi)","Main","1 bowl",90,4,6,5],
["Samosa","Snacks","1 piece",260,4,28,14],
["Vada Pav","Snacks","1 piece",290,6,40,12],
["Pav Bhaji","Snacks","1 plate",400,9,55,16],
["Chole Bhature","Snacks","1 plate",450,12,60,18],
["Pani Puri","Snacks","6 pcs",180,3,30,6],
["Bhel Puri","Snacks","1 plate",200,4,34,5],
["Roasted Chana","Snacks","30 g",110,6,18,2],
["Sprouts Salad","Snacks","1 bowl",120,8,20,1],
["Paneer Tikka","Snacks","6 pcs",260,18,6,18],
["Gulab Jamun","Sweets","1 piece",150,2,22,6],
["Jalebi","Sweets","50 g",220,1,34,9],
["Rasgulla","Sweets","1 piece",120,3,25,1],
["Kheer","Sweets","1 bowl",220,5,32,8],
["Gajar Halwa","Sweets","1 bowl",300,5,40,14],
["Besan Laddu","Sweets","1 piece",190,3,26,9],
["Sugar Tea (Chai)","Drinks","1 cup",80,2,12,2],
["Sweet Lassi","Drinks","1 glass",200,6,32,5],
["Chaas (Buttermilk)","Drinks","1 glass",40,2,3,2],
["Coconut Water","Drinks","1 glass",45,0,10,0],
["Nimbu Pani","Drinks","1 glass",60,0,15,0]
];

// Exercises: n = name, m = muscle group, h = how to
var EX = {
squat:{n:"Squats",m:"Legs",h:"Stand with feet shoulder-width apart. Push your hips back and bend your knees as if sitting on a chair. Keep chest up and heels down, then stand back up."},
pushup:{n:"Push-ups",m:"Chest",h:"Hands slightly wider than shoulders, body in a straight line. Lower your chest toward the floor with elbows at about 45°, then push back up. Use your knees if needed."},
lunge:{n:"Lunges",m:"Legs",h:"Step forward and lower until both knees are at about 90°. Push through the front heel to return. Alternate legs."},
plank:{n:"Plank",m:"Core",h:"Forearms on the floor, elbows under shoulders. Keep the body in one straight line, tighten abs and glutes, and don't let the hips sag."},
bridge:{n:"Glute Bridge",m:"Glutes",h:"Lie on your back with knees bent and feet flat. Lift your hips until shoulders, hips and knees form a line. Squeeze your glutes, then lower slowly."},
burpee:{n:"Burpees",m:"Full body",h:"Squat down, jump your feet back to a plank, do a push-up, jump your feet forward and explode upward into a jump."},
climber:{n:"Mountain Climbers",m:"Core",h:"Start in a high plank. Drive one knee toward your chest, then switch quickly, as if running in place on your hands."},
jack:{n:"Jumping Jacks",m:"Cardio",h:"Jump your feet apart while raising your arms overhead, then jump back to start. Keep a steady rhythm."},
crunch:{n:"Crunches",m:"Core",h:"Lie on your back, knees bent, hands by your ears. Lift your shoulders using your abs, then lower slowly. Don't pull on your neck."},
superman:{n:"Superman",m:"Back",h:"Lie face down with arms extended. Lift arms, chest and legs a few inches off the floor, hold for 2 seconds, then lower."},
dips:{n:"Chair Dips",m:"Triceps",h:"Place your hands on the edge of a sturdy chair with legs forward. Bend your elbows to lower your hips, then press back up."},
pike:{n:"Pike Push-ups",m:"Shoulders",h:"From a downward-dog shape with hips high, bend your elbows to bring your head toward the floor, then press back up."},
bicycle:{n:"Bicycle Crunch",m:"Core",h:"Lie on your back with hands by your ears. Bring the opposite elbow to the knee while extending the other leg. Alternate sides slowly."},
highknee:{n:"High Knees",m:"Cardio",h:"Run in place, driving your knees up to hip height. Pump your arms and stay light on the balls of your feet."},
wallsit:{n:"Wall Sit",m:"Legs",h:"Put your back against a wall and slide down until your knees are at 90°. Hold with your back flat on the wall."},
row:{n:"Dumbbell Row",m:"Back",h:"Hinge forward with a flat back and a dumbbell in hand. Pull your elbow toward your hip, squeeze the back, then lower slowly."},
press:{n:"Shoulder Press",m:"Shoulders",h:"Hold dumbbells at shoulder height. Press overhead until your arms are straight, then lower with control."},
curl:{n:"Bicep Curl",m:"Biceps",h:"Stand with dumbbells at your sides, palms forward. Curl up without swinging, then lower slowly."},
deadlift:{n:"Dumbbell Deadlift",m:"Legs & back",h:"Hold dumbbells in front of your thighs. Push your hips back with a flat back, lower to mid-shin, then drive your hips forward to stand tall."}
};

// Programs: days = [day, title, [[exercise, sets x reps], ...]]
var PROGRAMS = [
{n:"Beginner Home",d:"3 days a week · no equipment",days:[
 ["Mon","Full Body A",[["squat","3×12"],["pushup","3×8"],["bridge","3×12"],["plank","3×20s"]]],
 ["Tue","Rest day",[]],
 ["Wed","Full Body B",[["lunge","3×10"],["pike","3×6"],["superman","3×12"],["crunch","3×15"]]],
 ["Thu","Rest day",[]],
 ["Fri","Cardio + Core",[["jack","3×30s"],["climber","3×20"],["squat","3×15"],["plank","3×30s"]]],
 ["Sat","Active recovery",[]],
 ["Sun","Rest day",[]]]},
{n:"Fat Loss",d:"5 days a week · no equipment",days:[
 ["Mon","HIIT Burn",[["burpee","4×10"],["highknee","4×30s"],["squat","4×15"],["climber","4×30s"],["plank","3×30s"]]],
 ["Tue","Lower Body",[["squat","4×15"],["lunge","3×12"],["bridge","3×15"],["wallsit","3×30s"],["jack","3×40s"]]],
 ["Wed","Cardio + Core",[["jack","4×40s"],["bicycle","3×20"],["climber","3×30s"],["crunch","3×20"],["plank","3×40s"]]],
 ["Thu","Upper Body",[["pushup","4×10"],["dips","3×12"],["pike","3×8"],["superman","3×12"],["plank","3×30s"]]],
 ["Fri","Full Body Circuit",[["burpee","3×10"],["squat","3×15"],["pushup","3×10"],["climber","3×30s"],["highknee","3×30s"]]],
 ["Sat","Active recovery",[]],
 ["Sun","Rest day",[]]]},
{n:"Muscle Build",d:"5 days a week · dumbbells",days:[
 ["Mon","Push",[["pushup","4×12"],["press","4×10"],["pike","3×8"],["dips","3×12"]]],
 ["Tue","Pull",[["row","4×10"],["curl","3×12"],["superman","3×12"],["deadlift","3×10"]]],
 ["Wed","Legs",[["squat","4×12"],["lunge","3×10"],["deadlift","4×10"],["wallsit","3×40s"],["bridge","3×15"]]],
 ["Thu","Rest day",[]],
 ["Fri","Upper Body",[["pushup","3×12"],["row","3×12"],["press","3×10"],["curl","3×12"],["dips","3×10"]]],
 ["Sat","Lower + Core",[["squat","4×15"],["lunge","3×12"],["plank","3×45s"],["crunch","3×20"],["bicycle","3×20"]]],
 ["Sun","Rest day",[]]]}
];

// Yoga poses: n = Sanskrit name, e = English, t = time, b = benefits, s = steps
var POSES = {
catcow:{n:"Marjaryasana–Bitilasana",e:"Cat-Cow",t:"1 min",b:"Spine mobility, relieves back stiffness",s:["Come onto hands and knees, wrists under shoulders and knees under hips.","Inhale: drop your belly and lift your chest and tailbone (Cow).","Exhale: round your spine toward the ceiling and tuck your chin (Cat).","Flow with your breath for 8–10 rounds."]},
tadasana:{n:"Tadasana",e:"Mountain Pose",t:"1 min",b:"Posture, balance, body awareness",s:["Stand with feet together and arms by your sides.","Spread your weight evenly across both feet.","Lengthen your spine and lift your chest.","Breathe deeply and hold."]},
surya:{n:"Surya Namaskar",e:"Sun Salutation",t:"5 min (4–6 rounds)",b:"Full-body warm-up, flexibility, stamina",s:["Pranamasana: stand with palms joined at the chest.","Hasta Uttanasana: inhale, raise your arms and arch back slightly.","Padahastasana: exhale, fold forward, hands to the floor.","Ashwa Sanchalanasana: step the right leg back, knee down, look up.","Plank: step the other leg back, body in a straight line.","Ashtanga Namaskara: lower knees, chest and chin to the floor.","Bhujangasana: slide forward and lift into Cobra.","Adho Mukha Svanasana: lift hips into an inverted V.","Ashwa Sanchalanasana: step the right foot forward between your hands.","Padahastasana: bring the other foot forward and fold.","Hasta Uttanasana: inhale, rise up with arms overhead.","Pranamasana: exhale and return to the prayer pose. Repeat, switching the leg."]},
trikonasana:{n:"Trikonasana",e:"Triangle Pose",t:"30 sec each side",b:"Stretches legs and sides, improves balance",s:["Stand with feet wide apart, right foot turned out.","Raise both arms to shoulder height.","Reach to the right and lower your right hand to your shin, ankle or floor.","Extend the left arm up, look at the hand and hold. Switch sides."]},
bhujangasana:{n:"Bhujangasana",e:"Cobra Pose",t:"20–30 sec",b:"Strengthens the back, opens the chest",s:["Lie face down with hands under your shoulders.","Keep legs together and the tops of the feet on the floor.","Inhale and lift your chest, keeping elbows slightly bent.","Look forward, breathe steadily, then lower slowly."]},
adho:{n:"Adho Mukha Svanasana",e:"Downward Dog",t:"1 min",b:"Stretches hamstrings and shoulders, calms the mind",s:["Start on hands and knees.","Tuck your toes and lift your hips up and back.","Press your hands down and straighten your arms and legs as comfortable.","Relax your head between your arms and breathe."]},
balasana:{n:"Balasana",e:"Child’s Pose",t:"1 min",b:"Relaxes the back, relieves stress",s:["Kneel and sit back on your heels.","Spread your knees slightly apart.","Fold forward and rest your forehead on the floor.","Stretch your arms ahead and breathe slowly."]},
virabhadra:{n:"Virabhadrasana II",e:"Warrior II",t:"30 sec each side",b:"Strengthens legs, builds stamina and focus",s:["Stand with feet wide apart, right foot turned out.","Bend the right knee over the ankle.","Extend both arms at shoulder height.","Gaze over your right hand, hold, then switch sides."]},
paschimottanasana:{n:"Paschimottanasana",e:"Seated Forward Bend",t:"1 min",b:"Stretches the back and hamstrings, calms the mind",s:["Sit with both legs stretched in front.","Inhale and lift your arms overhead.","Exhale and fold forward from the hips.","Hold your shins or feet without forcing and breathe."]},
setu:{n:"Setu Bandhasana",e:"Bridge Pose",t:"30 sec",b:"Strengthens glutes and back, opens the chest",s:["Lie on your back with knees bent and feet hip-width apart.","Keep your arms by your sides, palms down.","Press into your feet and lift your hips.","Hold with glutes engaged, then lower slowly."]},
naukasana:{n:"Naukasana",e:"Boat Pose",t:"20 sec",b:"Strengthens the core",s:["Sit with knees bent and feet on the floor.","Lean back slightly with a straight spine.","Lift your feet until your shins are parallel to the floor.","Reach your arms forward and hold, breathing steadily."]},
vrikshasana:{n:"Vrikshasana",e:"Tree Pose",t:"30 sec each side",b:"Balance, focus, leg strength",s:["Stand tall and shift your weight onto the left foot.","Place the right foot on your inner left thigh (avoid the knee).","Bring your palms together at the chest, then overhead.","Hold, breathing steadily, then switch sides."]},
shavasana:{n:"Shavasana",e:"Corpse Pose",t:"3–5 min",b:"Deep relaxation, lowers stress",s:["Lie flat on your back with legs relaxed and apart.","Let your arms rest by your sides, palms up.","Close your eyes and release all tension.","Breathe naturally and stay still."]}
};

var ROUTINES = [
{n:"Morning Energy",t:"10 min",d:"Wake up your body and mind.",p:["catcow","tadasana","surya","trikonasana","bhujangasana","balasana"]},
{n:"Strength & Balance",t:"15 min",d:"Build stability and focus.",p:["tadasana","vrikshasana","virabhadra","adho","naukasana","setu","shavasana"]},
{n:"Evening Calm",t:"12 min",d:"Unwind and prepare for sleep.",p:["catcow","balasana","paschimottanasana","setu","shavasana"]}
];

var TIPS = [
"Drink a glass of water first thing in the morning.",
"Consistency beats intensity: 20 minutes daily is better than 2 hours once a week.",
"Add a source of protein to every meal.",
"Walk for 10 minutes after meals to support digestion.",
"Aim for 7–9 hours of sleep; muscles recover while you rest.",
"Warm up for 5 minutes before every workout.",
"Eat slowly and stop when you feel about 80% full.",
"Stretch gently for 5 minutes before bed."
];
