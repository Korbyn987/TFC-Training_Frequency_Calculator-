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
        muscles: ["Quadriceps", "Hamstrings", "glutes", "calves"]
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
      { focus: "Pull (Back, Biceps)", muscles: ["Back", "Biceps", "forearms"] },
      {
        focus: "Legs (Quads, Hamstrings, Glutes)",
        muscles: ["Quadriceps", "Hamstrings", "glutes", "calves"]
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
        muscles: ["Quadriceps", "Hamstrings", "glutes", "calves"]
      },
      {
        focus: "Upper Body (Volume)",
        muscles: ["Chest", "Back", "Shoulders", "Biceps", "Triceps"]
      },
      {
        focus: "Lower Body (Volume)",
        muscles: ["Quadriceps", "Hamstrings", "glutes", "calves"]
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
      { focus: "Pull (Back, Biceps)", muscles: ["Back", "Biceps", "forearms"] },
      {
        focus: "Legs (Quads, Hamstrings, Glutes)",
        muscles: ["Quadriceps", "Hamstrings", "glutes", "calves"]
      },
      {
        focus: "Upper Body (Arms Focus)",
        muscles: ["Biceps", "Triceps", "Shoulders", "forearms"]
      },
      {
        focus: "Lower Body (Glutes Focus)",
        muscles: ["glutes", "Hamstrings", "Quadriceps", "calves", "Core"]
      }
    ]
  },
  6: {
    name: "Push/Pull/Legs (2x)",
    days: [
      { focus: "Push (Heavy)", muscles: ["Chest", "Shoulders", "Triceps"] },
      { focus: "Pull (Heavy)", muscles: ["Back", "Biceps", "forearms"] },
      {
        focus: "Legs (Heavy)",
        muscles: ["Quadriceps", "Hamstrings", "glutes", "calves"]
      },
      { focus: "Push (Volume)", muscles: ["Chest", "Shoulders", "Triceps"] },
      { focus: "Pull (Volume)", muscles: ["Back", "Biceps", "forearms"] },
      {
        focus: "Legs (Volume)",
        muscles: ["Quadriceps", "Hamstrings", "glutes", "calves"]
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

const EQUIPMENT_FILTERS = {
  full_gym: () => true,
  home_gym: (exercise: Exercise) => {
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
    const exerciseName = exercise.name.toLowerCase();

    console.log(`   Checking equipment: "${equipmentLower}"`);
    console.log(`   Checking name: "${exerciseName}"`);

    // ALWAYS check exercise name for machine/cable keywords FIRST, regardless of equipment field
    const isMachine = machineKeywords.some((keyword) => {
      const equipmentMatch = equipmentLower.includes(keyword);
      const nameMatch = exerciseName.includes(keyword);
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
    const bodyweightKeywords = [
      "bodyweight",
      "body weight",
      "no equipment",
      "none",
      "mat",
      "floor"
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
      "dumbbell",
      "barbell",
      "kettlebell",
      "weight",
      "plate"
    ];

    // If no equipment specified, allow it for bodyweight
    if (!exercise.equipment || exercise.equipment.trim() === "") {
      return true;
    }

    const equipmentLower = exercise.equipment.toLowerCase();
    const exerciseName = exercise.name.toLowerCase();

    // Exclude machine-based and weighted exercises
    const requiresEquipment = machineKeywords.some(
      (keyword) =>
        equipmentLower.includes(keyword) || exerciseName.includes(keyword)
    );

    if (requiresEquipment) {
      return false;
    }

    return (
      bodyweightKeywords.some((keyword) => equipmentLower.includes(keyword)) ||
      // Also allow exercises that are typically bodyweight movements
      exercise.name.toLowerCase().includes("push-up") ||
      exercise.name.toLowerCase().includes("sit-up") ||
      exercise.name.toLowerCase().includes("squat") ||
      exercise.name.toLowerCase().includes("lunge") ||
      exercise.name.toLowerCase().includes("plank") ||
      exercise.name.toLowerCase().includes("crunch")
    );
  }
};

// Helper function to detect cardio exercises
const isCardioExercise = (exercise: Exercise): boolean => {
  const exerciseName = exercise.name.toLowerCase();

  // Explicitly exclude Inchworm from cardio classification
  if (exerciseName.includes("inchworm")) {
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
    "step ups"
  ];

  const muscleGroup = exercise.muscle_groups?.name?.toLowerCase() || "";

  return cardioKeywords.some(
    (keyword) =>
      exerciseName.includes(keyword) || muscleGroup.includes("cardio")
  );
};

// Helper function to check if cardio exercise is appropriate for experience level
const isAppropriateCardioForLevel = (
  exercise: Exercise,
  level: string
): boolean => {
  const exerciseName = exercise.name.toLowerCase();

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
    exerciseName.includes(keyword)
  );

  const isMediumIntensity = mediumIntensityKeywords.some((keyword) =>
    exerciseName.includes(keyword)
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

  const exerciseName = exercise.name.toLowerCase();
  const isDynamic = dynamicCardioKeywords.some((keyword) =>
    exerciseName.includes(keyword)
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
  const muscleExercises = availableExercises.filter(
    (ex) =>
      ex.muscle_groups &&
      ex.muscle_groups.name?.toLowerCase() === muscle.toLowerCase() &&
      EQUIPMENT_FILTERS[equipment](ex) &&
      !selectedPatterns.has(getMovementPattern(ex.name))
  );
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

  dayTemplate.muscles.forEach((muscle) => {
    const recoveryInfo = muscleRecovery[muscle];
    if (recoveryInfo && recoveryInfo.percentage < 100) {
      recoveryWarnings.push({ muscle, percentage: recoveryInfo.percentage });
    }
  });

  if (dayTemplate.muscles.length === 0) {
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

  let totalExercises = Math.min(
    config.totalExercises.max,
    Math.max(config.totalExercises.min, dayTemplate.muscles.length * 2)
  );

  // Adjust for beginner fat loss goal to shorten the strength portion
  if (userGoals.level === "beginner" && isFatLossGoal(userGoals.goal)) {
    totalExercises = Math.floor(Math.random() * 2) + 3; // Randomly 3 or 4 exercises
  } else {
    // For all other cases, ensure at least 4 exercises are generated
    if (totalExercises < 4) {
      totalExercises = 4;
    }
  }

  const focusType = dayTemplate.focus.toLowerCase();
  const selectedIds = new Set();
  const selectedPatterns = new Set();
  let hardExercisesCount = 0;
  const hardExerciseMuscleGroups = new Set();

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

  const isFirstTimeFocus = !seenFocuses.has(focusType);

  if (focusType.includes("push")) {
    if (isFirstTimeFocus) {
      let available = getAvailableExercises(
        allExercises,
        userGoals.level,
        hardExercisesCount,
        hardExerciseMuscleGroups,
        "Chest"
      );
      const mainPress = selectExercisesForMuscle(
        "Chest",
        available,
        1,
        userGoals.level,
        userGoals.equipment,
        selectedPatterns
      ).filter(
        (ex) =>
          ex.exercise_type === "compound" &&
          getMovementPattern(ex.name).includes("bench press")
      );
      addExercise(mainPress[0]);
      seenFocuses.add(focusType);
    }

    let available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "Chest"
    );
    const mainPress = selectExercisesForMuscle(
      "Chest",
      available,
      1,
      userGoals.level,
      userGoals.equipment,
      selectedPatterns
    ).filter(
      (ex) =>
        ex.exercise_type === "compound" &&
        ex.name.toLowerCase().includes("press") &&
        !selectedIds.has(ex.id)
    );
    addExercise(mainPress[0]);

    available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "Shoulders"
    );
    const overheadPress = selectExercisesForMuscle(
      "Shoulders",
      available,
      1,
      userGoals.level,
      userGoals.equipment,
      selectedPatterns
    ).filter(
      (ex) =>
        ex.exercise_type === "compound" &&
        ex.name.toLowerCase().includes("press") &&
        !selectedIds.has(ex.id) &&
        !selectedPatterns.has(getMovementPattern(ex.name))
    );
    addExercise(overheadPress[0]);

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
  } else if (focusType.includes("pull")) {
    if (isFirstTimeFocus) {
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
        ex.exercise_type === "compound" &&
        (ex.name.toLowerCase().includes("squat") ||
          ex.name.toLowerCase().includes("leg press"))
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
          ex.exercise_type === "compound" &&
          (ex.name.toLowerCase().includes("squat") ||
            ex.name.toLowerCase().includes("leg press"))
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

    // 3. Fill remaining slots with other leg exercises, prioritizing missing groups
    const remainingLegSlots = totalExercises - dayExercises.length;
    if (remainingLegSlots > 0) {
      const allLegMuscles = ["Quadriceps", "Hamstrings", "glutes", "calves"];
      const currentMuscles = new Set(
        dayExercises.map((ex) => ex.muscle_groups?.name?.toLowerCase())
      );

      const missingMuscles = allLegMuscles.filter(
        (m) => !currentMuscles.has(m)
      );

      // Prioritize missing muscles first, then cycle through all for variety
      const muscleFillOrder = [
        ...missingMuscles,
        ...allLegMuscles.sort(() => Math.random() - 0.5)
      ];

      for (let i = 0; i < remainingLegSlots; i++) {
        const muscleToTrain = muscleFillOrder[i % muscleFillOrder.length];
        if (!muscleToTrain) continue;

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
      }
    }
  }

  // Fill any remaining slots if the main logic didn't hit the total
  const remainingSlots = totalExercises - dayExercises.length;
  if (remainingSlots > 0 && !focusType.includes("legs")) {
    const accessoryMuscles = [...dayTemplate.muscles].sort(
      () => Math.random() - 0.5
    );
    let currentMuscleIndex = 0;

    for (let i = 0; i < remainingSlots; i++) {
      const muscleToTrain = accessoryMuscles[currentMuscleIndex];

      let available = getAvailableExercises(
        allExercises,
        userGoals.level,
        hardExercisesCount,
        hardExerciseMuscleGroups,
        muscleToTrain
      );
      const accessoryExercises = selectExercisesForMuscle(
        muscleToTrain,
        available,
        remainingSlots,
        userGoals.level,
        userGoals.equipment,
        selectedPatterns
      ).filter(
        (ex) =>
          !selectedIds.has(ex.id) &&
          !selectedPatterns.has(getMovementPattern(ex.name))
      );

      if (accessoryExercises.length > 0) {
        addExercise(accessoryExercises[0]);
      }
      currentMuscleIndex = (currentMuscleIndex + 1) % accessoryMuscles.length;
    }
  }

  // Add cardio exercises for fat loss goals
  if (isFatLossGoal(userGoals.goal)) {
    console.log("🔥 Fat loss goal detected, adding cardio exercises...");
    console.log("🔍 User goal:", userGoals.goal);

    const cardioExercises = allExercises.filter(
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
        exercise_type: "compound" as const,
        equipment:
          userGoals.equipment === "bodyweight" ? "bodyweight" : "machine",
        difficulty_level: "beginner" as const
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

  // Final Ordering: Key lifts > Compound > Isolation > Cardio
  const finalOrderedExercises = [...dayExercises].sort((a, b) => {
    const aIsCardio = isCardioExercise(a);
    const bIsCardio = isCardioExercise(b);

    if (aIsCardio && !bIsCardio) return 1; // a (cardio) goes after b (non-cardio)
    if (!aIsCardio && bIsCardio) return -1; // a (non-cardio) goes before b (cardio)

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

  dayExercises = finalOrderedExercises;

  return {
    exercises: dayExercises.map((ex) => ({
      ...ex,
      sets: ex.sets || config.sets.isolation,
      rest: ex.rest || config.restTimes.isolation
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

  return {
    success: true,
    plan,
    context: { userGoals, allExercises, muscleRecovery, split }
  };
};