// supabase/functions/_shared/ai-logic.ts

// Type definitions for our data structures
interface Exercise {
  id: number;
  name: string;
  muscle_group: string; // This is kept for client-side compatibility
  exercise_type: "compound" | "isolation";
  equipment: string;
  sets?: string;
  rest?: string;
  muscle_groups?: { name: string }; // Add this to match the new query
  difficulty_level: string; // Add this to match the new query
}

interface UserGoals {
  level: "beginner" | "intermediate" | "advanced";
  equipment: "full_gym" | "home_gym" | "bodyweight";
  frequency: number;
  goal: string;
}

interface MuscleRecovery {
  [key: string]: {
    percentage: number;
    lastWorkout: string | null;
    recoveryHours: number;
  };
}

// --- Constants migrated from aiService.js ---

const WORKOUT_SPLITS = {
  2: {
    name: "Upper/Lower Split",
    days: [
      {
        focus: "Upper Body",
        muscles: ["Chest", "Back", "Shoulders", "Biceps", "Triceps"]
      },
      {
        focus: "Lower Body",
        muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves"]
      }
    ]
  },
  3: {
    name: "Push/Pull/Legs",
    days: [
      {
        focus: "Push (Chest, Shoulders, Triceps)",
        muscles: ["Chest", "Shoulders", "Triceps"]
      },
      { focus: "Pull (Back, Biceps)", muscles: ["Back", "Biceps", "Forearms"] },
      {
        focus: "Legs (Quads, Hamstrings, Glutes)",
        muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves"]
      }
    ]
  },
  4: {
    name: "Upper/Lower Split (2x)",
    days: [
      {
        focus: "Upper Body (Heavy)",
        muscles: ["Chest", "Back", "Shoulders", "Biceps", "Triceps"]
      },
      {
        focus: "Lower Body (Heavy)",
        muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves"]
      },
      {
        focus: "Upper Body (Volume)",
        muscles: ["Chest", "Back", "Shoulders", "Biceps", "Triceps"]
      },
      {
        focus: "Lower Body (Volume)",
        muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves"]
      }
    ]
  },
  5: {
    name: "Push/Pull/Legs + Upper/Lower",
    days: [
      {
        focus: "Push (Chest, Shoulders, Triceps)",
        muscles: ["Chest", "Shoulders", "Triceps"]
      },
      { focus: "Pull (Back, Biceps)", muscles: ["Back", "Biceps", "Forearms"] },
      {
        focus: "Legs (Quads, Hamstrings, Glutes)",
        muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves"]
      },
      {
        focus: "Upper Body (Arms Focus)",
        muscles: ["Biceps", "Triceps", "Shoulders", "Forearms"]
      },
      {
        focus: "Lower Body (Glutes Focus)",
        muscles: ["Glutes", "Hamstrings", "Quadriceps", "Calves", "Core"]
      }
    ]
  },
  6: {
    name: "Push/Pull/Legs (2x)",
    days: [
      { focus: "Push (Heavy)", muscles: ["Chest", "Shoulders", "Triceps"] },
      { focus: "Pull (Heavy)", muscles: ["Back", "Biceps", "Forearms"] },
      {
        focus: "Legs (Heavy)",
        muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves"]
      },
      { focus: "Push (Volume)", muscles: ["Chest", "Shoulders", "Triceps"] },
      { focus: "Pull (Volume)", muscles: ["Back", "Biceps", "Forearms"] },
      {
        focus: "Legs (Volume)",
        muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves"]
      }
    ]
  }
};

const EXPERIENCE_CONFIGS = {
  beginner: {
    sets: { compound: "3x8-12", isolation: "2x10-12" },
    restTimes: { compound: "90-120s", isolation: "60-90s" },
    totalExercises: { min: 4, max: 6 }
  },
  intermediate: {
    sets: { compound: "4x6-10", isolation: "3x8-12" },
    restTimes: { compound: "120-180s", isolation: "90-120s" },
    totalExercises: { min: 5, max: 8 }
  },
  advanced: {
    sets: { compound: "4x4-8", isolation: "3x8-12" },
    restTimes: { compound: "180-240s", isolation: "90-120s" },
    totalExercises: { min: 6, max: 10 }
  }
};

// Whitelist of bodyweight exercises allowed in all equipment settings
const UNIVERSAL_BODYWEIGHT_EXERCISES = [
  "plank",
  "russian twist",
  "mountain climbers",
  "side plank",
  "sit-up",
  "v-up",
  "bicycle crunch",
  "crunch",
  "flutter kicks",
  "leg raise",
  "scissor kicks",
  "burpee",
  "free running",
  "jumping jacks"
];

// Specific bodyweight exercises to EXCLUDE from any gym setting
const GYM_BODYWEIGHT_EXCLUSIONS = ["air squat"];

// Helper function to check if a bodyweight exercise is universally allowed
const isUniversalBodyweightExercise = (exercise: Exercise): boolean => {
  const universalExerciseName = exercise.name.toLowerCase();
  return UNIVERSAL_BODYWEIGHT_EXERCISES.some((allowed) =>
    universalExerciseName.includes(allowed)
  );
};

const EQUIPMENT_FILTERS = {
  full_gym: (exercise: Exercise) => {
    const fullGymExerciseName = exercise.name.toLowerCase();
    // Exclude specific bodyweight exercises from gym settings
    if (
      GYM_BODYWEIGHT_EXCLUSIONS.some((ex) => fullGymExerciseName.includes(ex))
    ) {
      return false;
    }

    // Allow bodyweight exercises only if they are in the universal whitelist
    if (exercise.equipment === "bodyweight") {
      return isUniversalBodyweightExercise(exercise);
    }
    return true; // Allow all other equipment types
  },
  home_gym: (exercise: Exercise) => {
    const homeGymExerciseName = exercise.name.toLowerCase();
    // Exclude specific bodyweight exercises from gym settings
    if (
      GYM_BODYWEIGHT_EXCLUSIONS.some((ex) => homeGymExerciseName.includes(ex))
    ) {
      return false;
    }

    // Allow bodyweight exercises only if they are in the universal whitelist
    if (exercise.equipment === "bodyweight") {
      return isUniversalBodyweightExercise(exercise);
    }

    const homeEquipment = [
      "dumbbell",
      "resistance band",
      "bodyweight",
      "barbell",
      "kettlebell",
      "medicine ball",
      "stability ball",
      "pull-up bar",
      "bench",
      "mat",
      "free weight",
      "weight plate",
      "ez bar",
      "curl bar",
      "adjustable",
      "home"
    ];

    const machineKeywords = [
      "machine",
      "smith machine",
      "leg press machine",
      "leg curl machine",
      "leg extension",
      "seated leg curl",
      "hammer strength",
      "lat pulldown machine",
      "cable machine",
      "cable",
      "pec deck",
      "leg press",
      "calf raise machine",
      "preacher curl machine",
      "tricep dip machine",
      "chest press machine",
      "shoulder press machine",
      "cable fly",
      "cable crossover",
      "cable row",
      "cable curl",
      "cable press",
      "cable pulldown",
      "cable lateral",
      "cable reverse",
      "cable tricep",
      "cable bicep",
      "cable chest",
      "cable shoulder",
      "pulley",
      "lat pulldown",
      "seated cable",
      "standing cable"
    ];

    // Debug logging
    console.log(`🏠 HOME GYM FILTER - Exercise: "${exercise.name}"`);
    console.log(`   Equipment: "${exercise.equipment || "NONE"}"`);

    const equipmentLower = (exercise.equipment || "").toLowerCase();
    const bodyweightExerciseName = exercise.name.toLowerCase();

    console.log(`   Checking equipment: "${equipmentLower}"`);
    console.log(`   Checking name: "${bodyweightExerciseName}"`);

    // ALWAYS check exercise name for machine/cable keywords FIRST, regardless of equipment field
    const isMachine = machineKeywords.some((keyword) => {
      const equipmentMatch = equipmentLower.includes(keyword);
      const nameMatch = bodyweightExerciseName.includes(keyword);
      if (equipmentMatch || nameMatch) {
        console.log(
          `   🚫 BLOCKED by keyword: "${keyword}" (equipment: ${equipmentMatch}, name: ${nameMatch})`
        );
      }
      return equipmentMatch || nameMatch;
    });

    if (isMachine) {
      console.log(`   ❌ REJECTED - Machine/Cable exercise`);
      return false;
    }

    // If no equipment specified AND name doesn't contain machine keywords, allow it for home gym
    if (!exercise.equipment || exercise.equipment.trim() === "") {
      console.log(`   ✅ ALLOWED - No equipment specified and name is safe`);
      return true;
    }

    const isHomeEquipment = homeEquipment.some((eq) => {
      const match = equipmentLower.includes(eq);
      if (match) {
        console.log(`   ✅ ALLOWED - Matches home equipment: "${eq}"`);
      }
      return match;
    });

    if (!isHomeEquipment) {
      console.log(`   ❌ REJECTED - Equipment not suitable for home gym`);
    }

    return isHomeEquipment;
  },
  bodyweight: (exercise: Exercise) => {
    // With the database now having accurate equipment fields, this check is much simpler.
    return exercise.equipment === "bodyweight";
  }
};

// Helper function to detect cardio exercises
const isCardioExercise = (exercise: Exercise): boolean => {
  const cardioExerciseName = exercise.name.toLowerCase();

  // Explicitly exclude Inchworm from cardio classification
  if (cardioExerciseName.includes("inchworm")) {
    return false;
  }

  const cardioKeywords = [
    "cardio",
    "running",
    "jogging",
    "cycling",
    "rowing",
    "elliptical",
    "treadmill",
    "bike",
    "jump rope",
    "jumping jacks",
    "burpees",
    "mountain climbers",
    "high knees",
    "butt kicks",
    "step ups",
    "tuck jumps",
    "skaters",
    "lateral shuffles"
  ];

  const muscleGroup = exercise.muscle_groups?.name?.toLowerCase() || "";

  return cardioKeywords.some(
    (keyword) =>
      cardioExerciseName.includes(keyword) || muscleGroup.includes("cardio")
  );
};

// Helper function to detect core exercises
const isCoreExercise = (exercise: Exercise): boolean => {
  const coreExerciseName = exercise.name.toLowerCase();
  const muscleGroup = exercise.muscle_groups?.name?.toLowerCase() || "";

  if (muscleGroup.includes("core") || muscleGroup.includes("abs")) {
    return true;
  }

  const coreKeywords = [
    "plank",
    "crunch",
    "sit-up",
    "russian twist",
    "leg raise",
    "v-up",
    "dead bug",
    "mountain climber",
    "bicycle crunch",
    "knee raise",
    "flutter kick",
    "scissor kick",
    "toe touch",
    "bird dog",
    "hollow hold",
    "superman",
    "bear crawl",
    "crab walk",
    "ab roller",
    "cable crunch",
    "hanging leg raise",
    "wood chop"
  ];

  return coreKeywords.some((keyword) => coreExerciseName.includes(keyword));
};

// Helper function to check if cardio exercise is appropriate for experience level
const isAppropriateCardioForLevel = (
  exercise: Exercise,
  level: string
): boolean => {
  const cardioLevelExerciseName = exercise.name.toLowerCase();

  // High-intensity exercises that beginners should avoid
  const highIntensityKeywords = [
    "hiit",
    "sprint",
    "burpee",
    "tabata",
    "interval",
    "explosive",
    "plyometric",
    "battle rope",
    "kettlebell swing",
    "box jump"
  ];

  // Medium-intensity exercises that intermediates can handle
  const mediumIntensityKeywords = [
    "mountain climber",
    "high knee",
    "butt kick"
  ];

  const isHighIntensity = highIntensityKeywords.some((keyword) =>
    cardioLevelExerciseName.includes(keyword)
  );

  const isMediumIntensity = mediumIntensityKeywords.some((keyword) =>
    cardioLevelExerciseName.includes(keyword)
  );

  // Filter based on experience level
  if (level === "beginner") {
    // Beginners should avoid high and medium intensity cardio
    return !isHighIntensity && !isMediumIntensity;
  } else if (level === "intermediate") {
    // Intermediates can do medium intensity but not high intensity
    return !isHighIntensity;
  } else {
    // Advanced users can do any cardio
    return true;
  }
};

// Helper function to determine sets/reps or duration for cardio
const getCardioFormat = (
  exercise: Exercise,
  level: string
): { sets: string; rest: string } => {
  const dynamicCardioKeywords = [
    "high knees",
    "butt kicks",
    "butt kickers",
    "star jumps",
    "jumping jacks",
    "burpees",
    "mountain climbers",
    "box jump",
    "step ups",
    "tuck jumps",
    "skaters",
    "lateral shuffles"
  ];

  const dynamicExerciseName = exercise.name.toLowerCase();
  const isDynamic = dynamicCardioKeywords.some((keyword) =>
    dynamicExerciseName.includes(keyword)
  );

  if (isDynamic) {
    // Rep-based format for dynamic exercises
    if (level === "beginner") {
      return { sets: "3x15-20", rest: "30-45s" };
    } else if (level === "intermediate") {
      return { sets: "4x20-25", rest: "30s" };
    } else {
      // advanced
      return { sets: "4x25-30", rest: "15-30s" };
    }
  } else {
    // Duration-based format for endurance exercises
    const duration = level === "beginner" ? "15-20 minutes" : "20-30 minutes";
    return { sets: duration, rest: "As needed" };
  }
};

// Helper function to identify static stretches
const isStretchExercise = (exercise: Exercise): boolean => {
  const stretchExerciseName = exercise.name.toLowerCase();
  const stretchKeywords = [
    "stretch",
    "pose",
    "hold",
    "mobilization",
    "mobility",
    "cat-cow",
    "downward dog",
    "pigeon pose",
    "child's pose",
    "cobra"
  ];
  return stretchKeywords.some((keyword) =>
    stretchExerciseName.includes(keyword)
  );
};

// Helper function to format sets for stretches
const getStretchFormat = (level: string): { sets: string; rest: string } => {
  if (level === "beginner") {
    return { sets: "2x30s per side", rest: "15s" };
  } else if (level === "intermediate") {
    return { sets: "3x45s per side", rest: "15s" };
  } else {
    // advanced
    return { sets: "3x60s per side", rest: "10s" };
  }
};

// Helper function to check if goal includes fat loss
const isFatLossGoal = (goal: string): boolean => {
  return (
    goal.toLowerCase().includes("fat loss") ||
    goal.toLowerCase().includes("fat_loss") ||
    goal.toLowerCase().includes("weight loss") ||
    goal.toLowerCase().includes("weight_loss") ||
    goal.toLowerCase().includes("lose weight") ||
    goal.toLowerCase().includes("lose_weight") ||
    goal.toLowerCase().includes("cut") ||
    goal.toLowerCase().includes("cutting")
  );
};

// Helper function to calculate recovery percentage
const calculateRecoveryPercentage = (
  lastWorkoutDate: string | null,
  recoveryHours = 72
): number => {
  if (!lastWorkoutDate) return 100;
  const now = new Date(new Date().toISOString());
  const lastWorkout = new Date(
    lastWorkoutDate.endsWith("Z") ? lastWorkoutDate : lastWorkoutDate + "Z"
  );
  const hoursSinceWorkout =
    (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);
  const percentage = Math.min(100, (hoursSinceWorkout / recoveryHours) * 100);
  return Math.floor(Math.max(0, percentage));
};

const getMovementPattern = (name: string): string => {
  const lowerName = name.toLowerCase();
  // List of words to remove to find the core movement
  const removableWords = [
    "barbell",
    "dumbbell",
    "smith machine",
    "cable",
    "machine",
    "band",
    "incline",
    "decline",
    "seated",
    "standing",
    "alternating",
    "single arm",
    "single leg",
    "one arm",
    "one leg",
    "lying",
    "reverse",
    "ez-bar"
  ];
  let pattern = ` ${lowerName} `;
  removableWords.forEach((word) => {
    pattern = pattern.replace(` ${word} `, " ");
  });
  // Remove plural 's' to group exercises like 'row' and 'rows'
  if (pattern.trim().endsWith("s")) {
    pattern = pattern.trim().slice(0, -1);
  }
  return pattern.trim();
};

const getAvailableExercises = (
  allExercises: Exercise[],
  level: string,
  hardExerciseCount: number,
  hardExerciseMuscleGroups: Set<string>,
  muscleToFilter?: string
): Exercise[] => {
  if (level === "beginner") {
    const beginnerExercises = allExercises.filter(
      (ex) => ex.difficulty_level === "beginner"
    );
    if (beginnerExercises.length > 0) {
      return beginnerExercises;
    }
    // Fallback for beginners if no specific beginner exercises are found
    return allExercises.filter((ex) => ex.difficulty_level !== "advanced");
  }

  if (level === "intermediate") {
    const canAddHardExercise = hardExerciseCount < 2;

    // Filter out advanced exercises for muscles that already have one
    if (muscleToFilter && hardExerciseMuscleGroups.has(muscleToFilter)) {
      return allExercises.filter((ex) => ex.difficulty_level !== "advanced");
    }

    // If we can't add any more hard exercises, filter them all out
    if (!canAddHardExercise) {
      return allExercises.filter((ex) => ex.difficulty_level !== "advanced");
    }
  }

  // For advanced users, or intermediates who can still add hard exercises
  return allExercises;
};

const selectExercisesForMuscle = (
  muscle: string,
  availableExercises: Exercise[],
  count: number,
  experienceLevel: string,
  equipment: string,
  selectedPatterns: Set<string>
): Exercise[] => {
  console.log(
    `🔍 Working with ${availableExercises.length} pre-filtered exercises for muscle "${muscle}"...`
  );

  const legMuscles = ["quadriceps", "hamstrings", "glutes", "calves"];

  const muscleExercises = availableExercises.filter((ex) => {
    const exNameLower = ex.name.toLowerCase();
    if (legMuscles.includes(muscle.toLowerCase())) {
      // PREVENT CORE EXERCISES ON LEG DAY
      if (exNameLower.includes("v-up") || exNameLower.includes("sit-up")) {
        return false;
      }
    }

    return (
      ex.muscle_groups &&
      ex.muscle_groups.name?.toLowerCase() === muscle.toLowerCase() &&
      // SAFGUARD: Explicitly prevent bicycle crunches from being a leg exercise
      !(
        legMuscles.includes(muscle.toLowerCase()) &&
        exNameLower.includes("bicycle crunch")
      ) &&
      EQUIPMENT_FILTERS[equipment](ex) &&
      !selectedPatterns.has(getMovementPattern(ex.name))
    );
  });
  console.log(
    `🔍 Found ${muscleExercises.length} matching exercises for muscle "${muscle}" after filtering.`
  );
  if (muscleExercises.length === 0) return [];

  const compound = muscleExercises.filter(
    (ex) =>
      ex.exercise_type === "compound" ||
      ex.name.toLowerCase().includes("press") ||
      ex.name.toLowerCase().includes("row") ||
      ex.name.toLowerCase().includes("squat")
  );
  const isolation = muscleExercises.filter((ex) => !compound.includes(ex));

  compound.sort(() => Math.random() - 0.5);
  isolation.sort(() => Math.random() - 0.5);

  const config = EXPERIENCE_CONFIGS[experienceLevel];
  let selected = [];

  let compoundCount = 0;
  let isolationCount = 0;

  if (experienceLevel === "beginner") {
    compoundCount = Math.ceil(count * 0.5);
    isolationCount = Math.floor(count * 0.5);
  } else if (experienceLevel === "intermediate") {
    compoundCount = Math.ceil(count * 0.6);
    isolationCount = Math.floor(count * 0.4);
  } else {
    // advanced
    compoundCount = Math.ceil(count * 0.7);
    isolationCount = Math.floor(count * 0.3);
  }

  const selectedCompound = compound.slice(0, compoundCount);
  const selectedIsolation = isolation.slice(0, isolationCount);
  selected = [...selectedCompound, ...selectedIsolation];

  if (selected.length < count) {
    const allAvailable = [...compound, ...isolation];
    for (let i = 0; selected.length < count && i < allAvailable.length; i++) {
      const exerciseToAdd = allAvailable[i];
      if (!selected.find((ex) => ex.id === exerciseToAdd.id)) {
        selected.push(exerciseToAdd);
      }
    }
  }

  return selected.map((ex) => {
    if (isStretchExercise(ex)) {
      const stretchFormat = getStretchFormat(experienceLevel);
      return {
        ...ex,
        sets: stretchFormat.sets,
        rest: stretchFormat.rest
      };
    }

    const isCompound = selectedCompound.some((ce) => ce.id === ex.id);
    return {
      ...ex,
      sets: isCompound ? config.sets.compound : config.sets.isolation,
      rest: isCompound ? config.restTimes.compound : config.restTimes.isolation
    };
  });
};

export const generateSingleDayWorkout = (
  dayTemplate,
  userGoals,
  allExercises,
  muscleRecovery,
  dayIndex,
  seenFocuses
): { exercises: Exercise[]; recoveryWarnings: any[] } => {
  let dayExercises = [];
  const recoveryWarnings = [];
  const config = EXPERIENCE_CONFIGS[userGoals.level];

  // Make a mutable copy and remove 'Core' to prevent it from being selected twice.
  const mutableMuscles = [...dayTemplate.muscles].filter(
    (m) => m.toLowerCase() !== "core"
  );

  mutableMuscles.forEach((muscle) => {
    const recoveryInfo = muscleRecovery[muscle];
    if (recoveryInfo && recoveryInfo.percentage < 100) {
      recoveryWarnings.push({ muscle, percentage: recoveryInfo.percentage });
    }
  });

  if (mutableMuscles.length === 0) {
    dayExercises.push({
      id: -1, // Use a unique negative ID for non-DB exercises
      name: "Active Recovery - Light Cardio",
      sets: "20-30 minutes",
      rest: "As needed",
      muscle_group: "Cardio",
      muscle_groups: { name: "Cardio" },
      exercise_type: "compound" as const,
      equipment: "bodyweight",
      difficulty_level: "beginner" as const
    });
    return { exercises: dayExercises, recoveryWarnings };
  }

  // SPECIAL LOGIC FOR BODYWEIGHT: Generate full-body workouts instead of splits
  if (userGoals.equipment === "bodyweight") {
    console.log("🏋️ BODYWEIGHT MODE: Generating full-body workout");
    console.log(`🎯 User level: ${userGoals.level}`);
    console.log(`📊 Total exercises available: ${allExercises.length}`);

    const allBodyweightExercises = allExercises.filter((ex) =>
      EQUIPMENT_FILTERS.bodyweight(ex)
    );
    console.log(
      `🏋️ Total bodyweight exercises found: ${allBodyweightExercises.length}`
    );

    // DEBUG: Show beginner bodyweight exercises specifically
    const beginnerBodyweight = allBodyweightExercises.filter(
      (ex) => ex.difficulty_level === "beginner"
    );
    console.log(
      `👶 Beginner bodyweight exercises found: ${beginnerBodyweight.length}`
    );
    console.log(
      `👶 Beginner exercises (ID | Name): ${beginnerBodyweight
        .map((ex) => `${ex.id} | ${ex.name}`)
        .join(", ")}`
    );

    const selectedIds = new Set();
    const selectedPatterns = new Set();

    // Helper to add an exercise and its pattern
    const addExercise = (exercise: Exercise) => {
      if (!exercise) return;
      dayExercises.push(exercise);
      selectedIds.add(exercise.id);
      selectedPatterns.add(getMovementPattern(exercise.name));
    };

    // GUARANTEED EXERCISES FOR BODYWEIGHT WORKOUTS

    // 1. CORE EXERCISE (ALWAYS INCLUDED)
    const coreExercises = allBodyweightExercises.filter(
      (ex) =>
        (ex.name.toLowerCase().includes("plank") ||
          ex.name.toLowerCase().includes("crunch") ||
          ex.name.toLowerCase().includes("sit-up") ||
          ex.name.toLowerCase().includes("russian twist") ||
          ex.name.toLowerCase().includes("leg raise") ||
          ex.name.toLowerCase().includes("v-up") ||
          ex.name.toLowerCase().includes("dead bug") ||
          ex.name.toLowerCase().includes("mountain climber") ||
          ex.name.toLowerCase().includes("bicycle crunch") ||
          ex.name.toLowerCase().includes("knee raise") ||
          ex.name.toLowerCase().includes("flutter kick") ||
          ex.name.toLowerCase().includes("scissor kick") ||
          ex.name.toLowerCase().includes("toe touch") ||
          ex.name.toLowerCase().includes("bird dog") ||
          ex.name.toLowerCase().includes("hollow hold") ||
          ex.name.toLowerCase().includes("superman") ||
          ex.name.toLowerCase().includes("bear crawl") ||
          ex.name.toLowerCase().includes("crab walk")) &&
        !selectedIds.has(ex.id) &&
        // Filter by difficulty level
        (userGoals.level === "beginner"
          ? ex.difficulty_level === "beginner"
          : userGoals.level === "intermediate"
          ? ex.difficulty_level !== "advanced"
          : true)
    );
    if (coreExercises.length > 0) {
      const coreEx =
        coreExercises[Math.floor(Math.random() * coreExercises.length)];
      addExercise({
        ...coreEx,
        sets: config.sets.isolation,
        rest: config.restTimes.isolation
      });
      console.log(`✅ Added GUARANTEED core exercise: ${coreEx.name}`);
    }

    // 2. CARDIO/CALISTHENICS (ALWAYS INCLUDED)
    const cardioExercises = allBodyweightExercises.filter(
      (ex) =>
        (ex.name.toLowerCase().includes("jumping jack") ||
          ex.name.toLowerCase().includes("burpee") ||
          ex.name.toLowerCase().includes("high knee") ||
          ex.name.toLowerCase().includes("butt kick") ||
          ex.name.toLowerCase().includes("star jump") ||
          ex.name.toLowerCase().includes("running in place") ||
          ex.name.toLowerCase().includes("marching")) &&
        !selectedIds.has(ex.id) &&
        // Filter by difficulty level
        (userGoals.level === "beginner"
          ? ex.difficulty_level === "beginner"
          : userGoals.level === "intermediate"
          ? ex.difficulty_level !== "advanced"
          : true)
    );
    if (cardioExercises.length > 0) {
      const cardioEx =
        cardioExercises[Math.floor(Math.random() * cardioExercises.length)];
      const cardioFormat = getCardioFormat(cardioEx, userGoals.level);
      addExercise({
        ...cardioEx,
        sets: cardioFormat.sets,
        rest: cardioFormat.rest
      });
      console.log(`✅ Added GUARANTEED cardio exercise: ${cardioEx.name}`);
    }

    // 3. PUSH-UPS (Upper body push)
    const pushExercises = allBodyweightExercises.filter(
      (ex) =>
        (ex.name.toLowerCase().includes("push-up") ||
          ex.name.toLowerCase().includes("pushup") ||
          ex.name.toLowerCase().includes("push up")) &&
        !selectedIds.has(ex.id) &&
        // Filter by difficulty level, allowing only basic push-up for beginners
        (userGoals.level === "beginner"
          ? ex.difficulty_level === "beginner" ||
            ex.name.toLowerCase() === "push-up"
          : userGoals.level === "intermediate"
          ? ex.difficulty_level !== "advanced"
          : true)
    );
    if (pushExercises.length > 0) {
      const pushUp =
        pushExercises[Math.floor(Math.random() * pushExercises.length)];
      addExercise({
        ...pushUp,
        sets: config.sets.compound,
        rest: config.restTimes.compound
      });
      console.log(`✅ Added push exercise: ${pushUp.name}`);
    }

    // 4. SQUATS/LUNGES (Lower body)
    const legExercises = allBodyweightExercises.filter(
      (ex) =>
        (ex.name.toLowerCase().includes("squat") ||
          ex.name.toLowerCase().includes("lunge")) &&
        !selectedIds.has(ex.id) &&
        // Filter by difficulty level
        (userGoals.level === "beginner"
          ? ex.difficulty_level === "beginner"
          : userGoals.level === "intermediate"
          ? ex.difficulty_level !== "advanced"
          : true)
    );
    if (legExercises.length > 0) {
      const legEx =
        legExercises[Math.floor(Math.random() * legExercises.length)];
      addExercise({
        ...legEx,
        sets: config.sets.compound,
        rest: config.restTimes.compound
      });
      console.log(`✅ Added leg exercise: ${legEx.name}`);
    }

    // 5. FILL REMAINING SLOTS with any appropriate bodyweight exercises
    const targetExercises =
      userGoals.level === "beginner"
        ? 4
        : userGoals.level === "intermediate"
        ? 5
        : 6;

    while (dayExercises.length < targetExercises) {
      // Get ALL bodyweight exercises that match difficulty level
      const remainingExercises = allBodyweightExercises.filter(
        (ex) =>
          !selectedIds.has(ex.id) &&
          !selectedPatterns.has(getMovementPattern(ex.name)) &&
          // Filter by difficulty level
          (userGoals.level === "beginner"
            ? ex.difficulty_level === "beginner"
            : userGoals.level === "intermediate"
            ? ex.difficulty_level !== "advanced"
            : true)
      );

      if (remainingExercises.length === 0) {
        console.log(
          "⚠️ No more appropriate bodyweight exercises found, breaking"
        );
        break;
      }

      const randomEx =
        remainingExercises[
          Math.floor(Math.random() * remainingExercises.length)
        ];
      const isCompound =
        randomEx.exercise_type === "compound" ||
        randomEx.name.toLowerCase().includes("squat") ||
        randomEx.name.toLowerCase().includes("push") ||
        randomEx.name.toLowerCase().includes("lunge");

      addExercise({
        ...randomEx,
        sets: isCompound ? config.sets.compound : config.sets.isolation,
        rest: isCompound
          ? config.restTimes.compound
          : config.restTimes.isolation
      });
      console.log(`✅ Added additional exercise: ${randomEx.name}`);
    }

    console.log(
      `🎯 Generated ${dayExercises.length} bodyweight exercises for full-body workout`
    );
    console.log(
      `📋 Final workout: ${dayExercises.map((ex) => ex.name).join(", ")}`
    );
    return { exercises: dayExercises, recoveryWarnings };
  }

  // ORIGINAL LOGIC FOR NON-BODYWEIGHT EQUIPMENT
  let totalExercises = Math.min(
    config.totalExercises.max,
    Math.max(config.totalExercises.min, mutableMuscles.length * 2)
  );

  // Adjust for beginner fat loss goal to shorten the strength portion
  if (userGoals.level === "beginner" && isFatLossGoal(userGoals.goal)) {
    totalExercises = Math.floor(Math.random() * 2) + 3; // Randomly 3 or 4 exercises
  } else {
    // For all other cases, ensure at least 4 exercises are always generated
    if (totalExercises < 4) {
      totalExercises = 4;
    }
  }

  // --- New Balanced Selection Logic (Ported from Backend) ---
  const focusType = dayTemplate.focus.toLowerCase();
  const selectedIds = new Set<string>(); // Keep track of selected exercise IDs
  const selectedPatterns = new Set();
  let hardExercisesCount = 0;
  const hardExerciseMuscleGroups = new Set();

  // Helper to add an exercise and its pattern
  const addExercise = (exercise: Exercise) => {
    if (!exercise) return;
    dayExercises.push(exercise);
    selectedIds.add(exercise.id);
    selectedPatterns.add(getMovementPattern(exercise.name));
    if (exercise.difficulty_level === "advanced") {
      hardExercisesCount++;
      hardExerciseMuscleGroups.add(exercise.muscle_groups.name.toLowerCase());
    }
  };

  // 1. Select Primary Lifts based on focus
  const isFirstTimeFocus = !seenFocuses.has(focusType);

  if (focusType.includes("push")) {
    if (isFirstTimeFocus) {
      // Prioritize a heavy bench press variation first
      let available = getAvailableExercises(
        allExercises,
        userGoals.level,
        hardExercisesCount,
        hardExerciseMuscleGroups,
        "chest"
      );
      const benchPressExercises = available.filter(
        (ex) =>
          ex.exercise_type === "compound" &&
          getMovementPattern(ex.name).includes("bench press")
      );
      const mainPress = selectExercisesForMuscle(
        "chest",
        benchPressExercises,
        1,
        userGoals.level,
        userGoals.equipment,
        selectedPatterns
      );
      addExercise(mainPress[0]);
      seenFocuses.add(focusType);
    }

    // Main Press for Chest (if not already selected)
    let available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "chest"
    );
    const pressExercises = available.filter(
      (ex) =>
        ex.exercise_type === "compound" &&
        ex.name.toLowerCase().includes("press") &&
        !selectedIds.has(ex.id)
    );
    const mainPress = selectExercisesForMuscle(
      "chest",
      pressExercises,
      1,
      userGoals.level,
      userGoals.equipment,
      selectedPatterns
    );
    addExercise(mainPress[0]);

    // Add a fly variation for chest
    available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "Chest"
    );
    const flyExercises = available.filter(
      (ex) =>
        ex.name.toLowerCase().includes("fly") &&
        !selectedIds.has(ex.id) &&
        !selectedPatterns.has(getMovementPattern(ex.name))
    );
    const chestFly = selectExercisesForMuscle(
      "Chest",
      flyExercises,
      1,
      userGoals.level,
      userGoals.equipment,
      selectedPatterns
    );
    addExercise(chestFly[0]);

    // Main Overhead Press for Shoulders
    available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "shoulders"
    );
    const overheadPressExercises = available.filter(
      (ex) =>
        ex.exercise_type === "compound" &&
        ex.name.toLowerCase().includes("press") &&
        !selectedIds.has(ex.id) &&
        !selectedPatterns.has(getMovementPattern(ex.name))
    );
    const overheadPress = selectExercisesForMuscle(
      "shoulders",
      overheadPressExercises,
      1,
      userGoals.level,
      userGoals.equipment,
      selectedPatterns
    );
    addExercise(overheadPress[0]);
  } else if (focusType.includes("pull")) {
    // SAFEGUARD: Explicitly prevent squats/presses from appearing on pull days
    const PULL_DAY_EXCLUSIONS = [
      "squat",
      "press",
      "sumo squat",
      "cossack squat"
    ];
    if (
      PULL_DAY_EXCLUSIONS.some((keyword) =>
        dayTemplate.focus.toLowerCase().includes(keyword)
      )
    ) {
      console.error(
        "Configuration Error: Pull day should not contain push/leg keywords."
      );
      // This could be handled more gracefully, e.g., by returning an error
    }

    if (isFirstTimeFocus) {
      // Prioritize a heavy row variation first
      let available = getAvailableExercises(
        allExercises,
        userGoals.level,
        hardExercisesCount,
        hardExerciseMuscleGroups,
        "Back"
      );
      const horizontalPull = selectExercisesForMuscle(
        "Back",
        available,
        1,
        userGoals.level,
        userGoals.equipment,
        selectedPatterns
      ).filter(
        (ex) =>
          ex.exercise_type === "compound" &&
          getMovementPattern(ex.name).includes("row")
      );
      addExercise(horizontalPull[0]);
      seenFocuses.add(focusType);
    }

    let available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "Back"
    );
    const verticalPull = selectExercisesForMuscle(
      "Back",
      available,
      1,
      userGoals.level,
      userGoals.equipment,
      selectedPatterns
    ).filter(
      (ex) =>
        (ex.name.toLowerCase().includes("pull-up") ||
          ex.name.toLowerCase().includes("lat pulldown")) &&
        !selectedIds.has(ex.id)
    );
    addExercise(verticalPull[0]);

    available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "Back"
    );
    const horizontalPull = selectExercisesForMuscle(
      "Back",
      available,
      1,
      userGoals.level,
      userGoals.equipment,
      selectedPatterns
    ).filter(
      (ex) =>
        ex.name.toLowerCase().includes("row") &&
        !selectedIds.has(ex.id) &&
        !selectedPatterns.has(getMovementPattern(ex.name))
    );
    addExercise(horizontalPull[0]);
  } else if (focusType.includes("legs")) {
    // --- New Leg Day Logic ---

    // 1. Secure one primary quad exercise (squat/press)
    let quadFocus = selectExercisesForMuscle(
      "Quadriceps",
      getAvailableExercises(
        allExercises,
        userGoals.level,
        hardExercisesCount,
        hardExerciseMuscleGroups
      ),
      1,
      userGoals.level,
      userGoals.equipment,
      selectedPatterns
    ).filter(
      (ex) =>
        ex.exercise_type === "compound" ||
        ex.name.toLowerCase().includes("press") ||
        ex.name.toLowerCase().includes("squat")
    );
    if (quadFocus.length === 0) {
      // Fallback to intermediate if no beginner version is found
      quadFocus = selectExercisesForMuscle(
        "Quadriceps",
        allExercises.filter((ex) => ex.difficulty_level !== "advanced"),
        1,
        userGoals.level,
        userGoals.equipment,
        selectedPatterns
      ).filter(
        (ex) =>
          ex.exercise_type === "compound" ||
          ex.name.toLowerCase().includes("press") ||
          ex.name.toLowerCase().includes("squat")
      );
    }
    addExercise(quadFocus[0]);

    // 2. Secure one primary hamstring exercise (hinge/curl)
    let hamstringFocus = selectExercisesForMuscle(
      "Hamstrings",
      getAvailableExercises(
        allExercises,
        userGoals.level,
        hardExercisesCount,
        hardExerciseMuscleGroups
      ).filter((ex) => !selectedIds.has(ex.id)),
      1,
      userGoals.level,
      userGoals.equipment,
      selectedPatterns
    ).filter(
      (ex) =>
        ex.name.toLowerCase().includes("deadlift") ||
        ex.name.toLowerCase().includes("leg curl")
    );
    if (hamstringFocus.length === 0) {
      // Fallback to intermediate
      hamstringFocus = selectExercisesForMuscle(
        "Hamstrings",
        allExercises.filter(
          (ex) => ex.difficulty_level !== "advanced" && !selectedIds.has(ex.id)
        ),
        1,
        userGoals.level,
        userGoals.equipment,
        selectedPatterns
      ).filter(
        (ex) =>
          ex.name.toLowerCase().includes("deadlift") ||
          ex.name.toLowerCase().includes("leg curl")
      );
    }
    addExercise(hamstringFocus[0]);

    // 3. Fill remaining slots with other leg exercises
    const remainingLegSlots = totalExercises - dayExercises.length;
    if (remainingLegSlots > 0) {
      const accessoryMuscles = ["glutes", "Quadriceps", "Hamstrings", "calves"];
      let muscleIndex = 0;
      for (let i = 0; i < remainingLegSlots; i++) {
        const muscleToTrain =
          accessoryMuscles[muscleIndex % accessoryMuscles.length];
        const exercises = selectExercisesForMuscle(
          muscleToTrain,
          allExercises.filter(
            (ex) =>
              ex.difficulty_level !== "advanced" && !selectedIds.has(ex.id)
          ),
          1,
          userGoals.level,
          userGoals.equipment,
          selectedPatterns
        );
        if (exercises.length > 0) {
          addExercise(exercises[0]);
        }
        muscleIndex++;
      }
    }
  }

  // 2. Fill remaining slots with accessory exercises
  const remainingSlots = totalExercises - dayExercises.length;
  if (remainingSlots > 0) {
    // Ensure one slot is reserved for a core exercise
    const hasCoreExercise = dayExercises.some(isCoreExercise);

    // Accessory muscles should ONLY be from the day's template
    const daySpecificMuscles = [...mutableMuscles].filter(
      (m) => m.toLowerCase() !== "core"
    );

    let accessoryMuscles = [...daySpecificMuscles].sort(
      () => Math.random() - 0.5
    );

    // If no core exercise is present yet, inject 'Core' into the muscle rotation
    if (!hasCoreExercise) {
      accessoryMuscles.unshift("Core");
    }

    let currentMuscleIndex = 0;

    for (let i = 0; i < remainingSlots; i++) {
      // Prevent adding another core exercise if one was already added
      if (
        dayExercises.some(isCoreExercise) &&
        accessoryMuscles[currentMuscleIndex] === "Core"
      ) {
        currentMuscleIndex++;
        continue; // Skip to the next muscle
      }

      const muscleToTrain = accessoryMuscles[currentMuscleIndex];

      let available = getAvailableExercises(
        allExercises,
        userGoals.level,
        hardExercisesCount,
        hardExerciseMuscleGroups,
        muscleToTrain
      );
      const accessoryExercises = available.filter(
        (ex) =>
          !selectedIds.has(ex.id) &&
          !selectedPatterns.has(getMovementPattern(ex.name))
      );
      const selectedAccessory = selectExercisesForMuscle(
        muscleToTrain,
        accessoryExercises,
        1,
        userGoals.level,
        userGoals.equipment,
        selectedPatterns
      );

      if (selectedAccessory.length > 0) {
        addExercise(selectedAccessory[0]);
      }
      currentMuscleIndex = (currentMuscleIndex + 1) % accessoryMuscles.length;
    }
  }

  // Final Ordering: Key lifts > Compound > Isolation > Core > Cardio > Stretch
  dayExercises.sort((a, b) => {
    const aIsStretch = isStretchExercise(a);
    const bIsStretch = isStretchExercise(b);
    if (aIsStretch && !bIsStretch) return 1;
    if (!aIsStretch && bIsStretch) return -1;

    const aIsCardio = isCardioExercise(a);
    const bIsCardio = isCardioExercise(b);
    const aIsCore = isCoreExercise(a);
    const bIsCore = isCoreExercise(b);

    if (aIsCardio && !bIsCardio) return 1;
    if (!aIsCardio && bIsCardio) return -1;

    if (aIsCore && !bIsCore) return aIsCardio ? -1 : 1;
    if (!aIsCore && bIsCore) return bIsCardio ? 1 : -1;

    const keyLiftSubstrings = ["bench press", "squat", "deadlift", "row"];
    const aIsKeyLift = keyLiftSubstrings.some((substring) =>
      a.name.toLowerCase().includes(substring)
    );
    const bIsKeyLift = keyLiftSubstrings.some((substring) =>
      b.name.toLowerCase().includes(substring)
    );

    if (aIsKeyLift && !bIsKeyLift) return -1;
    if (!aIsKeyLift && bIsKeyLift) return 1;

    const aIsCompound = a.exercise_type === "compound";
    const bIsCompound = b.exercise_type === "compound";

    if (aIsCompound && !bIsCompound) return -1;
    if (!aIsCompound && bIsCompound) return 1;

    return 0;
  });

  // Add cardio exercises for fat loss goals
  if (isFatLossGoal(userGoals.goal)) {
    console.log("🔥 Fat loss goal detected, adding cardio exercises...");
    console.log("🔍 User goal:", userGoals.goal);

    // Determine the correct list of exercises to filter from
    const sourceExercises =
      userGoals.equipment === "bodyweight"
        ? allBodyweightExercises // Use the pre-filtered bodyweight list
        : allExercises; // Use the full list for other modes

    const cardioExercises = sourceExercises.filter(
      (ex) =>
        isCardioExercise(ex) &&
        isAppropriateCardioForLevel(ex, userGoals.level) &&
        EQUIPMENT_FILTERS[userGoals.equipment](ex) &&
        !selectedIds.has(ex.id) &&
        !ex.name.toLowerCase().includes("cardio circuit")
    );

    console.log(
      `🏃 Found ${cardioExercises.length} cardio exercises in database`
    );
    if (cardioExercises.length > 0) {
      console.log(
        "📋 Available cardio exercises:",
        cardioExercises.map((ex) => ex.name)
      );
    }

    if (cardioExercises.length > 0) {
      // Add 1 cardio exercise
      const cardioCount = 1;
      const shuffledCardio = cardioExercises.sort(() => Math.random() - 0.5);

      for (let i = 0; i < Math.min(cardioCount, shuffledCardio.length); i++) {
        const cardioEx = shuffledCardio[i];
        const cardioFormat = getCardioFormat(cardioEx, userGoals.level);
        dayExercises.push({
          ...cardioEx,
          sets: cardioFormat.sets,
          rest: cardioFormat.rest
        });
        selectedIds.add(cardioEx.id);
        console.log(`✅ Added cardio exercise: ${cardioEx.name}`);
      }
    } else {
      // Fallback: Create a generic cardio exercise if none found in database
      console.log(
        "⚠️ No cardio exercises found in database, creating fallback"
      );
      const fallbackCardio = {
        id: -1000 - dayIndex, // Unique negative ID for fallback
        name:
          userGoals.equipment === "bodyweight"
            ? "Jumping Jacks"
            : userGoals.equipment === "home_gym"
            ? "Stationary Bike"
            : "Treadmill",
        sets:
          userGoals.level === "beginner" ? "15-20 minutes" : "20-30 minutes",
        rest: "As needed",
        muscle_group: "Cardio",
        muscle_groups: { name: "Cardio" },
        exercise_type: "compound",
        equipment:
          userGoals.equipment === "bodyweight" ? "bodyweight" : "machine",
        difficulty_level: "beginner"
      };

      dayExercises.push(fallbackCardio);
      selectedIds.add(fallbackCardio.id);
      console.log(`✅ Added fallback cardio exercise: ${fallbackCardio.name}`);
    }

    console.log(
      `🎯 Total exercises after cardio addition: ${dayExercises.length}`
    );
  } else {
    console.log("💪 Non-fat loss goal detected:", userGoals.goal);
  }

  return {
    exercises: dayExercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      sets: ex.sets,
      rest: ex.rest,
      muscle_group: ex.muscle_group, // Keep this for display consistency
      muscle_groups: ex.muscle_groups // Pass the new structure along
    })),
    recoveryWarnings
  };
};

export const generateWorkoutPlan = async (
  userGoals: UserGoals,
  allExercises: Exercise[],
  recoveryData: any
): Promise<{
  success: boolean;
  plan: { days: { day: number; focus: string; exercises: Exercise[] }[] };
  context: {
    userGoals: UserGoals;
    allExercises: Exercise[];
    muscleRecovery: MuscleRecovery;
  };
}> => {
  console.log("🏋️ Starting BACKEND AI workout plan generation...");
  console.log(`Received ${allExercises.length} total exercises from database.`);

  const muscleRecovery: MuscleRecovery = {};
  const muscleGroups = [
    "Chest",
    "Back",
    "Shoulders",
    "Biceps",
    "Triceps",
    "forearms",
    "abs",
    "Quadriceps",
    "Hamstrings",
    "glutes",
    "calves"
  ];

  muscleGroups.forEach((muscle) => {
    const recoveryInfo = recoveryData?.[muscle.toLowerCase()];
    const lastWorkout = recoveryInfo?.lastWorkout;
    const recoveryHours = recoveryInfo?.recoveryTime || 72;
    muscleRecovery[muscle] = {
      percentage: calculateRecoveryPercentage(lastWorkout, recoveryHours),
      lastWorkout,
      recoveryHours
    };
  });
  console.log("🔄 Muscle recovery percentages:", muscleRecovery);

  const split = WORKOUT_SPLITS[userGoals.frequency];
  if (!split)
    throw new Error(`No workout split for ${userGoals.frequency} days`);

  const seenFocuses = new Set<string>(); // Keep track of focuses across days
  const plan = {
    days: split.days.map((dayTemplate, index) => {
      const dayResult = generateSingleDayWorkout(
        dayTemplate,
        userGoals,
        allExercises,
        muscleRecovery,
        index,
        seenFocuses
      );
      return {
        day: index + 1,
        focus: dayTemplate.focus,
        exercises: dayResult.exercises,
        recoveryWarnings: dayResult.recoveryWarnings
      };
    })
  };

  // If bodyweight, override day names to be more generic
  if (userGoals.equipment === "bodyweight") {
    plan.days.forEach((day, index) => {
      day.focus = `Full Body Workout ${String.fromCharCode(65 + index)}`;
    });
  }

  return {
    success: true,
    plan,
    context: { userGoals, allExercises, muscleRecovery, split }
  };
};