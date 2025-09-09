// AUTO-GENERATED FROM Backend/Workouts.SQL
// Do not edit directly. Edit Workouts.SQL and regenerate.

export const STATIC_MUSCLE_GROUPS = [
  { id: 1, name: "Chest" },
  { id: 2, name: "Biceps" },
  { id: 3, name: "Triceps" },
  { id: 4, name: "Back" },
  { id: 5, name: "Shoulders" },
  { id: 6, name: "Quadriceps" },
  { id: 7, name: "Hamstrings" },
  { id: 8, name: "Core" }
];

export const STATIC_EXERCISES = [
  // Chest (1)
  {
    id: 1,
    name: "Dips",
    muscle_group_id: 1,
    description: "Bodyweight exercise targeting lower chest and triceps"
  },
  {
    id: 2,
    name: "Pushups",
    muscle_group_id: 1,
    description: "Fundamental bodyweight exercise for chest development"
  },
  {
    id: 3,
    name: "Bench Press",
    muscle_group_id: 1,
    description: "Classic barbell exercise for overall chest development"
  },
  {
    id: 4,
    name: "Cable Fly: High to Low",
    muscle_group_id: 1,
    description: "Cable exercise targeting lower chest"
  },
  {
    id: 5,
    name: "Cable Fly: Low to High",
    muscle_group_id: 1,
    description: "Cable exercise targeting upper chest"
  },
  {
    id: 6,
    name: "Chest Press",
    muscle_group_id: 1,
    description: "Machine-based pressing movement for chest"
  },
  {
    id: 7,
    name: "Dumbbell Bench Press",
    muscle_group_id: 1,
    description: "Free weight variation of bench press using dumbbells"
  },
  {
    id: 8,
    name: "Incline Bench Press",
    muscle_group_id: 1,
    description: "Barbell press targeting upper chest"
  },
  {
    id: 9,
    name: "Decline Bench Press",
    muscle_group_id: 1,
    description: "Barbell press targeting lower chest"
  },
  {
    id: 10,
    name: "Dumbbell Fly",
    muscle_group_id: 1,
    description: "Isolation exercise for chest with dumbbells"
  },
  {
    id: 11,
    name: "Dumbbell Incline Press",
    muscle_group_id: 1,
    description: "Upper chest focused dumbbell press"
  },
  {
    id: 12,
    name: "Incline Dumbbell Fly",
    muscle_group_id: 1,
    description: "Upper chest focused fly movement"
  },
  {
    id: 13,
    name: "Smith Machine Bench Press",
    muscle_group_id: 1,
    description: "Guided barbell press for chest"
  },
  {
    id: 14,
    name: "Landmine Press",
    muscle_group_id: 1,
    description: "Single-arm press using barbell and landmine"
  },
  {
    id: 15,
    name: "Floor Press",
    muscle_group_id: 1,
    description: "Bench press variation performed on floor"
  },
  {
    id: 16,
    name: "Resistance Band Press",
    muscle_group_id: 1,
    description: "Chest press using resistance bands"
  },
  {
    id: 17,
    name: "Machine Fly",
    muscle_group_id: 1,
    description: "Pec deck machine for isolation"
  },
  {
    id: 18,
    name: "Incline Dumbbell Pullover",
    muscle_group_id: 1,
    description: "Upper chest and lat exercise"
  },
  {
    id: 19,
    name: "Svend Press",
    muscle_group_id: 1,
    description: "Plate squeeze press for inner chest"
  },
  {
    id: 20,
    name: "Decline Push-Up",
    muscle_group_id: 1,
    description: "Feet elevated push-up variation"
  },
  {
    id: 21,
    name: "Incline Push-Up",
    muscle_group_id: 1,
    description: "Hands elevated push-up variation"
  },
  {
    id: 22,
    name: "Around The World",
    muscle_group_id: 1,
    description: "Dynamic dumbbell movement for chest"
  },
  {
    id: 23,
    name: "Single-Arm Cable Press",
    muscle_group_id: 1,
    description: "Unilateral chest press with cable"
  },
  {
    id: 24,
    name: "Hammer Strength Press",
    muscle_group_id: 1,
    description: "Machine press for chest development"
  },
  {
    id: 25,
    name: "Alternating Dumbbell Press",
    muscle_group_id: 1,
    description: "Alternating chest press with dumbbells"
  },
  {
    id: 26,
    name: "Spoto Press",
    muscle_group_id: 1,
    description: "Bench press with pause above chest"
  },

  // Biceps (2)
  {
    id: 28,
    name: "Barbell Curl",
    muscle_group_id: 2,
    description: "Classic bicep exercise using a straight barbell"
  },
  {
    id: 29,
    name: "Dumbbell Curl",
    muscle_group_id: 2,
    description: "Basic bicep curl performed with dumbbells"
  },
  {
    id: 30,
    name: "Hammer Curl",
    muscle_group_id: 2,
    description: "Neutral grip curl targeting the brachialis"
  },
  {
    id: 31,
    name: "Preacher Curl",
    muscle_group_id: 2,
    description: "Isolation exercise performed on preacher bench"
  },
  {
    id: 32,
    name: "Incline Dumbbell Curl",
    muscle_group_id: 2,
    description: "Curl variation with extended range of motion"
  },
  {
    id: 33,
    name: "Cable Curl",
    muscle_group_id: 2,
    description: "Constant tension curl using cable machine"
  },
  {
    id: 34,
    name: "Concentration Curl",
    muscle_group_id: 2,
    description: "Seated isolation curl for peak contraction"
  },
  {
    id: 35,
    name: "EZ Bar Curl",
    muscle_group_id: 2,
    description: "Curl using curved bar for comfort"
  },
  {
    id: 36,
    name: "Spider Curl",
    muscle_group_id: 2,
    description: "Prone curl performed on incline bench"
  },
  {
    id: 37,
    name: "Reverse Curl",
    muscle_group_id: 2,
    description: "Curl with pronated grip targeting brachialis"
  },
  {
    id: 38,
    name: "Zottman Curl",
    muscle_group_id: 2,
    description: "Combination of regular and reverse curl"
  },
  {
    id: 39,
    name: "21s",
    muscle_group_id: 2,
    description: "Partial range of motion curl sequence"
  },

  // Triceps (3)
  {
    id: 40,
    name: "Tricep Pushdown",
    muscle_group_id: 3,
    description: "Cable exercise targeting all three heads of triceps"
  },
  {
    id: 41,
    name: "Skull Crushers",
    muscle_group_id: 3,
    description: "Lying tricep extension with barbell or EZ bar"
  },
  {
    id: 42,
    name: "Overhead Tricep Extension",
    muscle_group_id: 3,
    description: "Single or double-handed extension above head"
  },
  {
    id: 43,
    name: "Close Grip Bench Press",
    muscle_group_id: 3,
    description: "Compound movement emphasizing triceps"
  },
  {
    id: 44,
    name: "Diamond Push-Ups",
    muscle_group_id: 3,
    description: "Bodyweight exercise with close hand placement"
  },
  {
    id: 45,
    name: "Rope Pushdown",
    muscle_group_id: 3,
    description: "Cable exercise with rope attachment for better contraction"
  },
  {
    id: 46,
    name: "Dumbbell Tricep Extension",
    muscle_group_id: 3,
    description: "Single-arm overhead extension with dumbbell"
  },
  {
    id: 47,
    name: "Tricep Kickback",
    muscle_group_id: 3,
    description: "Isolation exercise performed bent over"
  },
  {
    id: 48,
    name: "Bench Dips",
    muscle_group_id: 3,
    description: "Bodyweight exercise using bench for support"
  },
  {
    id: 49,
    name: "JM Press",
    muscle_group_id: 3,
    description: "Hybrid of close grip bench and skull crusher"
  },
  {
    id: 50,
    name: "Cable Overhead Extension",
    muscle_group_id: 3,
    description: "Cable variation of overhead extension"
  },
  {
    id: 51,
    name: "Reverse Grip Pushdown",
    muscle_group_id: 3,
    description: "Underhand grip variation of tricep pushdown"
  },

  // Back (4)
  {
    id: 52,
    name: "Deadlift",
    muscle_group_id: 4,
    description: "Compound movement targeting entire posterior chain"
  },
  {
    id: 53,
    name: "Pull-Ups",
    muscle_group_id: 4,
    description: "Bodyweight exercise for upper back and lats"
  },
  {
    id: 54,
    name: "Bent Over Row",
    muscle_group_id: 4,
    description: "Barbell row targeting middle back"
  },
  {
    id: 55,
    name: "Lat Pulldown",
    muscle_group_id: 4,
    description: "Cable exercise mimicking pull-up movement"
  },
  {
    id: 56,
    name: "T-Bar Row",
    muscle_group_id: 4,
    description: "Supported row variation for middle back"
  },
  {
    id: 57,
    name: "Face Pull",
    muscle_group_id: 4,
    description: "Cable exercise for rear deltoids and upper back"
  },
  {
    id: 58,
    name: "Seated Cable Row",
    muscle_group_id: 4,
    description: "Cable row targeting middle back"
  },
  {
    id: 59,
    name: "Single-Arm Dumbbell Row",
    muscle_group_id: 4,
    description: "Unilateral row with dumbbell"
  },
  {
    id: 60,
    name: "Meadows Row",
    muscle_group_id: 4,
    description: "Landmine variation of single-arm row"
  },
  {
    id: 61,
    name: "Straight Arm Pulldown",
    muscle_group_id: 4,
    description: "Lat isolation exercise"
  },
  {
    id: 62,
    name: "Pendlay Row",
    muscle_group_id: 4,
    description: "Explosive barbell row from floor"
  },
  {
    id: 63,
    name: "Good Morning",
    muscle_group_id: 4,
    description: "Hip-hinge movement for lower back"
  },
  {
    id: 64,
    name: "Hyperextension",
    muscle_group_id: 4,
    description: "Lower back isolation exercise"
  },
  {
    id: 65,
    name: "Rack Pull",
    muscle_group_id: 4,
    description: "Partial deadlift from elevated position"
  },
  {
    id: 66,
    name: "Chest Supported Row",
    muscle_group_id: 4,
    description: "Row variation with torso supported"
  },
  {
    id: 67,
    name: "Chin-Ups",
    muscle_group_id: 4,
    description: "Underhand grip pull-up variation"
  },
  {
    id: 68,
    name: "Neutral Grip Pull-Ups",
    muscle_group_id: 4,
    description: "Pull-ups with palms facing each other"
  },
  {
    id: 69,
    name: "Machine Row",
    muscle_group_id: 4,
    description: "Machine-based rowing movement"
  },
  {
    id: 70,
    name: "Reverse Grip Lat Pulldown",
    muscle_group_id: 4,
    description: "Underhand grip lat pulldown"
  },
  {
    id: 71,
    name: "Close Grip Lat Pulldown",
    muscle_group_id: 4,
    description: "Narrow grip variation targeting inner lats"
  },
  {
    id: 72,
    name: "Rower Machine",
    muscle_group_id: 4,
    description: "Cardio-focused back exercise"
  },
  {
    id: 73,
    name: "Smith Machine Row",
    muscle_group_id: 4,
    description: "Guided barbell row variation"
  },
  {
    id: 74,
    name: "Cable Face Pull",
    muscle_group_id: 4,
    description: "Rear delt and upper back isolation"
  },
  {
    id: 75,
    name: "Inverted Row",
    muscle_group_id: 4,
    description: "Bodyweight horizontal pulling exercise"
  },
  {
    id: 76,
    name: "Dumbbell Pullover",
    muscle_group_id: 4,
    description: "Upper body exercise targeting lats and serratus"
  },
  {
    id: 77,
    name: "Barbell Shrug",
    muscle_group_id: 4,
    description: "Trapezius isolation exercise"
  },
  {
    id: 78,
    name: "Dumbbell Shrug",
    muscle_group_id: 4,
    description: "Unilateral trap exercise with dumbbells"
  },

  // Shoulders (5)
  {
    id: 79,
    name: "Overhead Press",
    muscle_group_id: 5,
    description: "Standing barbell press for overall shoulder development"
  },
  {
    id: 80,
    name: "Military Press",
    muscle_group_id: 5,
    description: "Strict overhead press with feet together"
  },
  {
    id: 81,
    name: "Dumbbell Shoulder Press",
    muscle_group_id: 5,
    description: "Overhead press using dumbbells"
  },
  {
    id: 82,
    name: "Arnold Press",
    muscle_group_id: 5,
    description: "Rotational dumbbell press for all three deltoid heads"
  },
  {
    id: 83,
    name: "Lateral Raise",
    muscle_group_id: 5,
    description: "Dumbbell raise targeting lateral deltoids"
  },
  {
    id: 84,
    name: "Front Raise",
    muscle_group_id: 5,
    description: "Anterior deltoid isolation exercise"
  },
  {
    id: 85,
    name: "Bent Over Reverse Fly",
    muscle_group_id: 5,
    description: "Posterior deltoid isolation with dumbbells"
  },
  {
    id: 86,
    name: "Cable Lateral Raise",
    muscle_group_id: 5,
    description: "Machine variation of lateral raise"
  },
  {
    id: 87,
    name: "Upright Row",
    muscle_group_id: 5,
    description: "Compound movement for shoulders and traps"
  },
  {
    id: 88,
    name: "Push Press",
    muscle_group_id: 5,
    description: "Explosive overhead press with leg drive"
  },
  {
    id: 89,
    name: "Machine Shoulder Press",
    muscle_group_id: 5,
    description: "Guided overhead pressing movement"
  },
  {
    id: 90,
    name: "Smith Machine Shoulder Press",
    muscle_group_id: 5,
    description: "Guided barbell press"
  },
  {
    id: 91,
    name: "Face Pull",
    muscle_group_id: 5,
    description: "Cable exercise for rear deltoids"
  },
  {
    id: 92,
    name: "Plate Front Raise",
    muscle_group_id: 5,
    description: "Front raise variation using weight plate"
  },
  {
    id: 93,
    name: "Cable Front Raise",
    muscle_group_id: 5,
    description: "Cable variation of front raise"
  },
  {
    id: 94,
    name: "Cable Reverse Fly",
    muscle_group_id: 5,
    description: "Cable variation for rear deltoids"
  },
  {
    id: 95,
    name: "Landmine Press",
    muscle_group_id: 5,
    description: "Single-arm pressing using barbell and landmine"
  },
  {
    id: 97,
    name: "Seated Dumbbell Press",
    muscle_group_id: 5,
    description: "Shoulder press performed seated for stability"
  },
  {
    id: 98,
    name: "Single-Arm Lateral Raise",
    muscle_group_id: 5,
    description: "Unilateral lateral deltoid exercise"
  },
  {
    id: 99,
    name: "Incline Reverse Fly",
    muscle_group_id: 5,
    description: "Rear delt exercise on incline bench"
  },
  {
    id: 100,
    name: "Bradford Press",
    muscle_group_id: 5,
    description: "Alternating front and back press"
  },
  {
    id: 101,
    name: "Z Press",
    muscle_group_id: 5,
    description: "Seated floor press for strict form"
  },
  {
    id: 102,
    name: "Cuban Press",
    muscle_group_id: 5,
    description: "Compound movement combining upright row and press"
  },
  {
    id: 103,
    name: "Lateral Raise Machine",
    muscle_group_id: 5,
    description: "Machine-based lateral deltoid isolation"
  },
  {
    id: 104,
    name: "Reverse Pec Deck",
    muscle_group_id: 5,
    description: "Machine for posterior deltoid development"
  },
  {
    id: 105,
    name: "3-Way Raises",
    muscle_group_id: 5,
    description: "Front, lateral, and rear raise combination"
  },
  {
    id: 106,
    name: "Kettlebell Press",
    muscle_group_id: 5,
    description: "Overhead press using kettlebell"
  },
  {
    id: 107,
    name: "Bottoms-Up Press",
    muscle_group_id: 5,
    description: "Stability-focused kettlebell press"
  },
  {
    id: 108,
    name: "Handstand Push-Up",
    muscle_group_id: 5,
    description: "Advanced bodyweight shoulder exercise"
  },

  // Quadriceps (6)
  {
    id: 109,
    name: "Back Squat",
    muscle_group_id: 6,
    description: "Fundamental compound movement for lower body"
  },
  {
    id: 110,
    name: "Front Squat",
    muscle_group_id: 6,
    description: "Quad-focused squat variation"
  },
  {
    id: 111,
    name: "Leg Press",
    muscle_group_id: 6,
    description: "Machine-based compound leg exercise"
  },
  {
    id: 112,
    name: "Leg Extension",
    muscle_group_id: 6,
    description: "Isolation exercise for quadriceps"
  },
  {
    id: 113,
    name: "Bulgarian Split Squat",
    muscle_group_id: 6,
    description: "Unilateral squat variation"
  },
  {
    id: 114,
    name: "Walking Lunges",
    muscle_group_id: 6,
    description: "Dynamic lunge variation"
  },
  {
    id: 115,
    name: "Step-Ups",
    muscle_group_id: 6,
    description: "Unilateral exercise using platform"
  },
  {
    id: 116,
    name: "Goblet Squat",
    muscle_group_id: 6,
    description: "Squat variation using dumbbell or kettlebell"
  },
  {
    id: 117,
    name: "Hack Squat",
    muscle_group_id: 6,
    description: "Machine-based squat variation"
  },
  {
    id: 118,
    name: "Smith Machine Squat",
    muscle_group_id: 6,
    description: "Guided barbell squat"
  },
  {
    id: 119,
    name: "Zercher Squat",
    muscle_group_id: 6,
    description: "Front-loaded elbow squat"
  },
  {
    id: 120,
    name: "Belt Squat",
    muscle_group_id: 6,
    description: "Hip-loaded squat variation"
  },
  {
    id: 121,
    name: "Pistol Squat",
    muscle_group_id: 6,
    description: "Single-leg bodyweight squat"
  },
  {
    id: 122,
    name: "Jefferson Deadlift",
    muscle_group_id: 6,
    description: "Staggered stance deadlift variation"
  },
  {
    id: 123,
    name: "Sissy Squat",
    muscle_group_id: 6,
    description: "Advanced quad-focused movement"
  },
  {
    id: 124,
    name: "Single-Leg Leg Press",
    muscle_group_id: 6,
    description: "Unilateral leg press"
  },
  {
    id: 125,
    name: "Standing Leg Curl",
    muscle_group_id: 6,
    description: "Single-leg hamstring isolation"
  },
  {
    id: 126,
    name: "Adductor Machine",
    muscle_group_id: 6,
    description: "Inner thigh isolation exercise"
  },
  {
    id: 127,
    name: "Abductor Machine",
    muscle_group_id: 6,
    description: "Outer thigh isolation exercise"
  },
  {
    id: 128,
    name: "Sumo Deadlift",
    muscle_group_id: 6,
    description: "Wide-stance deadlift variation"
  },
  {
    id: 129,
    name: "Deficit Deadlift",
    muscle_group_id: 6,
    description: "Deadlift from elevated platform"
  },
  {
    id: 130,
    name: "Box Jumps",
    muscle_group_id: 6,
    description: "Explosive lower body movement"
  },
  {
    id: 131,
    name: "Jump Squat",
    muscle_group_id: 6,
    description: "Plyometric squat variation"
  },
  {
    id: 132,
    name: "Kettlebell Swing",
    muscle_group_id: 6,
    description: "Dynamic hip-hinge movement"
  },
  {
    id: 133,
    name: "Banded Hip Thrust",
    muscle_group_id: 6,
    description: "Band-resisted glute exercise"
  },
  {
    id: 134,
    name: "Glute Bridge",
    muscle_group_id: 6,
    description: "Basic glute activation exercise"
  },
  {
    id: 135,
    name: "Standing Hip Abduction",
    muscle_group_id: 6,
    description: "Cable exercise for outer thighs"
  },
  {
    id: 136,
    name: "Nordic Hamstring Curl",
    muscle_group_id: 6,
    description: "Bodyweight hamstring exercise"
  },
  {
    id: 137,
    name: "Curtsy Lunge",
    muscle_group_id: 6,
    description: "Cross-body lunge variation"
  },
  {
    id: 138,
    name: "Side Lunge",
    muscle_group_id: 6,
    description: "Lateral lunge movement"
  },
  {
    id: 139,
    name: "Reverse Lunge",
    muscle_group_id: 6,
    description: "Stationary lunge stepping backward"
  },
  {
    id: 140,
    name: "Donkey Calf Raise",
    muscle_group_id: 6,
    description: "Bent-over calf raise variation"
  },
  {
    id: 141,
    name: "Leg Press Calf Raise",
    muscle_group_id: 6,
    description: "Calf raise on leg press machine"
  },
  {
    id: 142,
    name: "Calf Raise",
    muscle_group_id: 6,
    description: "Standing calf exercise"
  },
  {
    id: 143,
    name: "Seated Calf Raise",
    muscle_group_id: 6,
    description: "Isolation for soleus muscle"
  },

  // Hamstrings (7)
  {
    id: 144,
    name: "Romanian Deadlift",
    muscle_group_id: 7,
    description: "Hip-hinge movement targeting hamstrings"
  },
  {
    id: 145,
    name: "Leg Curl",
    muscle_group_id: 7,
    description: "Isolation exercise for hamstrings"
  },
  {
    id: 146,
    name: "Single-Leg Romanian Deadlift",
    muscle_group_id: 7,
    description: "Unilateral hamstring exercise"
  },
  {
    id: 147,
    name: "Good Morning",
    muscle_group_id: 7,
    description: "Hip-hinge movement for posterior chain"
  },
  {
    id: 148,
    name: "Hip Thrust",
    muscle_group_id: 7,
    description: "Glute-focused hip extension exercise"
  },
  {
    id: 149,
    name: "Glute-Ham Raise",
    muscle_group_id: 7,
    description: "Hamstring and glute exercise"
  },
  {
    id: 150,
    name: "Lying Leg Curl",
    muscle_group_id: 7,
    description: "Hamstring isolation exercise"
  },
  {
    id: 151,
    name: "Seated Leg Curl",
    muscle_group_id: 7,
    description: "Hamstring isolation exercise"
  },
  {
    id: 152,
    name: "Stiff-Legged Deadlift",
    muscle_group_id: 7,
    description: "Deadlift variation targeting hamstrings"
  },
  {
    id: 153,
    name: "Deficit Romanian Deadlift",
    muscle_group_id: 7,
    description: "Deadlift from elevated platform targeting hamstrings"
  },
  {
    id: 154,
    name: "Snatch-Grip Deadlift",
    muscle_group_id: 7,
    description: "Wide-grip deadlift variation targeting hamstrings"
  },
  {
    id: 155,
    name: "Trap Bar Deadlift",
    muscle_group_id: 7,
    description: "Deadlift variation using trap bar"
  },
  {
    id: 156,
    name: "Block Pull",
    muscle_group_id: 7,
    description: "Partial deadlift from elevated position targeting hamstrings"
  },
  {
    id: 157,
    name: "Kettlebell Swing",
    muscle_group_id: 7,
    description: "Dynamic hip-hinge movement"
  },
  {
    id: 158,
    name: "Banded Hip Thrust",
    muscle_group_id: 7,
    description: "Band-resisted glute exercise"
  },
  {
    id: 159,
    name: "Glute Bridge",
    muscle_group_id: 7,
    description: "Basic glute activation exercise"
  },
  {
    id: 160,
    name: "Standing Hip Abduction",
    muscle_group_id: 7,
    description: "Cable exercise for outer thighs"
  },
  {
    id: 161,
    name: "Nordic Hamstring Curl",
    muscle_group_id: 7,
    description: "Bodyweight hamstring exercise"
  },
  {
    id: 162,
    name: "Curtsy Lunge",
    muscle_group_id: 7,
    description: "Cross-body lunge variation"
  },
  {
    id: 163,
    name: "Side Lunge",
    muscle_group_id: 7,
    description: "Lateral lunge movement"
  },
  {
    id: 164,
    name: "Reverse Lunge",
    muscle_group_id: 7,
    description: "Stationary lunge stepping backward"
  },
  {
    id: 165,
    name: "Donkey Calf Raise",
    muscle_group_id: 7,
    description: "Bent-over calf raise variation"
  },
  {
    id: 166,
    name: "Leg Press Calf Raise",
    muscle_group_id: 7,
    description: "Calf raise on leg press machine"
  },
  {
    id: 167,
    name: "Calf Raise",
    muscle_group_id: 7,
    description: "Standing calf exercise"
  },
  {
    id: 168,
    name: "Seated Calf Raise",
    muscle_group_id: 7,
    description: "Isolation for soleus muscle"
  },

  // Core (8)
  {
    id: 169,
    name: "Plank",
    muscle_group_id: 8,
    description: "Fundamental core stability exercise"
  },
  {
    id: 170,
    name: "Crunch",
    muscle_group_id: 8,
    description: "Basic abdominal flexion movement"
  },
  {
    id: 171,
    name: "Russian Twist",
    muscle_group_id: 8,
    description: "Rotational core exercise"
  },
  {
    id: 172,
    name: "Dead Bug",
    muscle_group_id: 8,
    description: "Anti-extension core stability exercise"
  },
  {
    id: 173,
    name: "Bird Dog",
    muscle_group_id: 8,
    description: "Contralateral limb stability exercise"
  },
  {
    id: 174,
    name: "Ab Wheel Rollout",
    muscle_group_id: 8,
    description: "Dynamic core stability movement"
  },
  {
    id: 175,
    name: "Hanging Leg Raise",
    muscle_group_id: 8,
    description: "Advanced lower ab exercise"
  },
  {
    id: 176,
    name: "Cable Wood Chop",
    muscle_group_id: 8,
    description: "Diagonal rotational movement"
  },
  {
    id: 177,
    name: "Pallof Press",
    muscle_group_id: 8,
    description: "Anti-rotation core exercise"
  },
  {
    id: 178,
    name: "Side Plank",
    muscle_group_id: 8,
    description: "Lateral core stability exercise"
  },
  {
    id: 179,
    name: "Mountain Climber",
    muscle_group_id: 8,
    description: "Dynamic core and cardio movement"
  },
  {
    id: 180,
    name: "Reverse Crunch",
    muscle_group_id: 8,
    description: "Lower abdominal focused exercise"
  },
  {
    id: 181,
    name: "Dragon Flag",
    muscle_group_id: 8,
    description: "Advanced full-body core exercise"
  },
  {
    id: 182,
    name: "Farmers Walk",
    muscle_group_id: 8,
    description: "Loaded carry for core stability"
  },
  {
    id: 183,
    name: "Turkish Get-Up",
    muscle_group_id: 8,
    description: "Complex core and shoulder stability"
  },
  {
    id: 184,
    name: "Windshield Wiper",
    muscle_group_id: 8,
    description: "Advanced oblique exercise"
  },
  {
    id: 185,
    name: "Copenhagen Plank",
    muscle_group_id: 8,
    description: "Advanced side plank variation"
  },
  {
    id: 186,
    name: "Suitcase Carry",
    muscle_group_id: 8,
    description: "Unilateral loaded carry"
  },
  {
    id: 187,
    name: "Cable Core Press",
    muscle_group_id: 8,
    description: "Standing anti-extension exercise"
  },
  {
    id: 188,
    name: "Hollow Body Hold",
    muscle_group_id: 8,
    description: "Gymnastics-based core exercise"
  },
  {
    id: 189,
    name: "V-Up",
    muscle_group_id: 8,
    description: "Upper and lower ab coordination"
  },
  {
    id: 190,
    name: "L-Sit",
    muscle_group_id: 8,
    description: "Static gymnastics hold"
  },
  {
    id: 191,
    name: "Decline Bench Crunch",
    muscle_group_id: 8,
    description: "Weighted ab flexion exercise"
  },
  {
    id: 192,
    name: "Toes to Bar",
    muscle_group_id: 8,
    description: "Advanced hanging core movement"
  },
  {
    id: 193,
    name: "Renegade Row",
    muscle_group_id: 8,
    description: "Plank with rowing motion"
  },
  {
    id: 194,
    name: "Cable Rotation",
    muscle_group_id: 8,
    description: "Standing rotational core exercise"
  },
  {
    id: 195,
    name: "Plank to Downward Dog",
    muscle_group_id: 8,
    description: "Dynamic plank variation"
  },
  {
    id: 196,
    name: "Side Bend",
    muscle_group_id: 8,
    description: "Lateral flexion for obliques"
  },
  {
    id: 197,
    name: "Landmine Rotation",
    muscle_group_id: 8,
    description: "Standing anti-rotation with barbell"
  },
  {
    id: 198,
    name: "Plank Shoulder Taps",
    muscle_group_id: 8,
    description: "Anti-rotation plank variation"
  },
  {
    id: 199,
    name: "Ab Crunch Machine",
    muscle_group_id: 8,
    description: "Machine-based spinal flexion"
  },
  {
    id: 200,
    name: "Stability Ball Pike",
    muscle_group_id: 8,
    description: "Advanced core stability exercise"
  },
  {
    id: 201,
    name: "Stability Ball Rollout",
    muscle_group_id: 8,
    description: "Alternative to ab wheel"
  },
  {
    id: 202,
    name: "Medicine Ball Slam",
    muscle_group_id: 8,
    description: "Explosive core movement"
  },
  {
    id: 203,
    name: "Kneeling Cable Crunch",
    muscle_group_id: 8,
    description: "Weighted spinal flexion"
  },
  {
    id: 204,
    name: "Plank Hip Dips",
    muscle_group_id: 8,
    description: "Oblique-focused plank variation"
  }
];
