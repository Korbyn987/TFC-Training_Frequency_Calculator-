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
        muscles: ["chest", "back", "shoulders", "biceps", "triceps"]
      },
      {
        focus: "Lower Body",
        muscles: ["quads", "hamstrings", "glutes", "calves"]
      }
    ]
  },
  3: {
    name: "Push/Pull/Legs",
    days: [
      {
        focus: "Push (Chest, Shoulders, Triceps)",
        muscles: ["chest", "shoulders", "triceps"]
      },
      { focus: "Pull (Back, Biceps)", muscles: ["back", "biceps", "forearms"] },
      {
        focus: "Legs (Quads, Hamstrings, Glutes)",
        muscles: ["quads", "hamstrings", "glutes", "calves"]
      }
    ]
  },
  4: {
    name: "Upper/Lower Split (2x)",
    days: [
      {
        focus: "Upper Body (Heavy)",
        muscles: ["chest", "back", "shoulders", "biceps", "triceps"]
      },
      {
        focus: "Lower Body (Heavy)",
        muscles: ["quads", "hamstrings", "glutes", "calves"]
      },
      {
        focus: "Upper Body (Volume)",
        muscles: ["chest", "back", "shoulders", "biceps", "triceps"]
      },
      {
        focus: "Lower Body (Volume)",
        muscles: ["quads", "hamstrings", "glutes", "calves"]
      }
    ]
  },
  5: {
    name: "Push/Pull/Legs + Upper/Lower",
    days: [
      {
        focus: "Push (Chest, Shoulders, Triceps)",
        muscles: ["chest", "shoulders", "triceps"]
      },
      { focus: "Pull (Back, Biceps)", muscles: ["back", "biceps", "forearms"] },
      {
        focus: "Legs (Quads, Hamstrings, Glutes)",
        muscles: ["quads", "hamstrings", "glutes", "calves"]
      },
      {
        focus: "Upper Body (Arms Focus)",
        muscles: ["biceps", "triceps", "shoulders", "forearms"]
      },
      {
        focus: "Lower Body (Glutes Focus)",
        muscles: ["glutes", "hamstrings", "calves", "abs"]
      }
    ]
  },
  6: {
    name: "Push/Pull/Legs (2x)",
    days: [
      { focus: "Push (Heavy)", muscles: ["chest", "shoulders", "triceps"] },
      { focus: "Pull (Heavy)", muscles: ["back", "biceps", "forearms"] },
      {
        focus: "Legs (Heavy)",
        muscles: ["quads", "hamstrings", "glutes", "calves"]
      },
      { focus: "Push (Volume)", muscles: ["chest", "shoulders", "triceps"] },
      { focus: "Pull (Volume)", muscles: ["back", "biceps", "forearms"] },
      {
        focus: "Legs (Volume)",
        muscles: ["quads", "hamstrings", "glutes", "calves"]
      }
    ]
  }
};

const EXPERIENCE_CONFIGS = {
  beginner: {
    sets: { compound: "3x8-12", isolation: "2x10-15" },
    restTimes: { compound: "90-120s", isolation: "60-90s" },
    totalExercises: { min: 4, max: 6 }
  },
  intermediate: {
    sets: { compound: "4x6-10", isolation: "3x8-12" },
    restTimes: { compound: "120-180s", isolation: "90-120s" },
    totalExercises: { min: 5, max: 8 }
  },
  advanced: {
    sets: { compound: "4x4-8", isolation: "3x8-15" },
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
      "cable",
      "barbell"
    ];
    return homeEquipment.some((eq) =>
      exercise.equipment?.toLowerCase().includes(eq)
    );
  },
  bodyweight: (exercise: Exercise) =>
    exercise.equipment?.toLowerCase().includes("bodyweight")
};

// --- Helper Functions migrated from aiService.js ---

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
    "single leg"
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
    return allExercises.filter((ex) => ex.difficulty_level === "beginner");
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
  allExercises: Exercise[],
  count: number,
  experienceLevel: "beginner" | "intermediate" | "advanced",
  equipment: "full_gym" | "home_gym" | "bodyweight"
): Exercise[] => {
  console.log(
    `🔍 Filtering for muscle "${muscle}" with equipment "${equipment}"...`
  );
  const muscleExercises = allExercises.filter(
    (ex) =>
      ex.muscle_groups &&
      ex.muscle_groups.name?.toLowerCase() === muscle.toLowerCase() &&
      EQUIPMENT_FILTERS[equipment](ex)
  );
  console.log(
    `🔍 Filtering for muscle "${muscle}" with equipment "${equipment}". Found ${muscleExercises.length} exercises.`
  );
  if (muscleExercises.length === 0) return [];

  // Separate compound and isolation exercises
  const compound = muscleExercises.filter(
    (ex) =>
      ex.exercise_type === "compound" ||
      ex.name.toLowerCase().includes("press") ||
      ex.name.toLowerCase().includes("row") ||
      ex.name.toLowerCase().includes("squat")
  );
  const isolation = muscleExercises.filter((ex) => !compound.includes(ex));

  // Shuffle for variety
  compound.sort(() => Math.random() - 0.5);
  isolation.sort(() => Math.random() - 0.5);

  const config = EXPERIENCE_CONFIGS[experienceLevel];
  let selected: Exercise[] = [];

  // Determine the number of compound vs isolation exercises
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

  // Fill any remaining slots if one category was short
  if (selected.length < count) {
    const allAvailable = [...compound, ...isolation];
    for (let i = 0; selected.length < count && i < allAvailable.length; i++) {
      const exerciseToAdd = allAvailable[i];
      if (!selected.find((ex) => ex.id === exerciseToAdd.id)) {
        selected.push(exerciseToAdd);
      }
    }
  }

  // Assign sets and rest times based on exercise type and experience
  return selected.map((ex) => {
    const isCompound = selectedCompound.some((ce) => ce.id === ex.id);
    return {
      ...ex,
      sets: isCompound ? config.sets.compound : config.sets.isolation,
      rest: isCompound ? config.restTimes.compound : config.restTimes.isolation
    };
  });
};

const generateSingleDayWorkout = (
  dayTemplate: { focus: string; muscles: string[] },
  userGoals: UserGoals,
  allExercises: Exercise[],
  muscleRecovery: MuscleRecovery,
  dayIndex: number,
  seenFocuses: Set<string>
): { exercises: Exercise[]; recoveryWarnings: any[] } => {
  let dayExercises: Exercise[] = [];
  const recoveryWarnings: any[] = [];
  const config = EXPERIENCE_CONFIGS[userGoals.level];

  dayTemplate.muscles.forEach((muscle) => {
    const recoveryInfo = muscleRecovery[muscle];
    if (recoveryInfo && recoveryInfo.percentage < 100) {
      recoveryWarnings.push({ muscle, percentage: recoveryInfo.percentage });
    }
  });

  if (dayTemplate.focus.toLowerCase() === "cardio") {
    dayExercises.push({
      id: -1, // Use a temporary ID for cardio
      name: "Cardio Session",
      description: "Perform 30-45 minutes of moderate-intensity cardio.",
      sets: "1",
      rest: "As needed",
      muscle_group: "Cardio",
      exercise_type: "compound",
      equipment: "bodyweight",
      difficulty_level: "beginner"
    });
    return { exercises: dayExercises, recoveryWarnings };
  }

  const totalExercises = Math.min(
    config.totalExercises.max,
    Math.max(config.totalExercises.min, dayTemplate.muscles.length * 2)
  );

  // --- New Balanced Selection Logic ---
  const focusType = dayTemplate.focus.toLowerCase();
  const selectedIds = new Set<number>();
  const selectedPatterns = new Set<string>();
  let hardExercisesCount = 0;
  const hardExerciseMuscleGroups = new Set<string>();

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
      const mainPress = selectExercisesForMuscle(
        "chest",
        available,
        1,
        userGoals.level,
        userGoals.equipment
      ).filter(
        (ex) =>
          ex.exercise_type === "compound" &&
          getMovementPattern(ex.name).includes("bench press")
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
    const mainPress = selectExercisesForMuscle(
      "chest",
      available,
      1,
      userGoals.level,
      userGoals.equipment
    ).filter(
      (ex) =>
        ex.exercise_type === "compound" &&
        ex.name.toLowerCase().includes("press") &&
        !selectedIds.has(ex.id)
    );
    addExercise(mainPress[0]);

    // Main Overhead Press for Shoulders
    available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "shoulders"
    );
    const overheadPress = selectExercisesForMuscle(
      "shoulders",
      available,
      1,
      userGoals.level,
      userGoals.equipment
    ).filter(
      (ex) =>
        ex.exercise_type === "compound" &&
        ex.name.toLowerCase().includes("press") &&
        !selectedIds.has(ex.id) &&
        !selectedPatterns.has(getMovementPattern(ex.name))
    );
    addExercise(overheadPress[0]);
  } else if (focusType.includes("pull")) {
    if (isFirstTimeFocus) {
      // Prioritize a heavy row variation first
      let available = getAvailableExercises(
        allExercises,
        userGoals.level,
        hardExercisesCount,
        hardExerciseMuscleGroups,
        "back"
      );
      const horizontalPull = selectExercisesForMuscle(
        "back",
        available,
        1,
        userGoals.level,
        userGoals.equipment
      ).filter(
        (ex) =>
          ex.exercise_type === "compound" &&
          getMovementPattern(ex.name).includes("row")
      );
      addExercise(horizontalPull[0]);
      seenFocuses.add(focusType);
    }

    // Main Vertical Pull for Back (Lats)
    let available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "back"
    );
    const verticalPull = selectExercisesForMuscle(
      "back",
      available,
      1,
      userGoals.level,
      userGoals.equipment
    ).filter(
      (ex) =>
        (ex.name.toLowerCase().includes("pull-up") ||
          ex.name.toLowerCase().includes("lat pulldown")) &&
        !selectedIds.has(ex.id)
    );
    addExercise(verticalPull[0]);

    // Main Horizontal Pull for Back (Rhomboids, Traps)
    available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "back"
    );
    const horizontalPull = selectExercisesForMuscle(
      "back",
      available,
      1,
      userGoals.level,
      userGoals.equipment
    ).filter(
      (ex) =>
        ex.name.toLowerCase().includes("row") &&
        !selectedIds.has(ex.id) &&
        !selectedPatterns.has(getMovementPattern(ex.name))
    );
    addExercise(horizontalPull[0]);
  } else if (focusType.includes("legs")) {
    if (isFirstTimeFocus) {
      // Prioritize a heavy squat or deadlift variation first
      let available = getAvailableExercises(
        allExercises,
        userGoals.level,
        hardExercisesCount,
        hardExerciseMuscleGroups,
        "quads"
      );
      const primaryCompound = selectExercisesForMuscle(
        "quads",
        available,
        1,
        userGoals.level,
        userGoals.equipment
      ).filter(
        (ex) =>
          ex.exercise_type === "compound" &&
          (getMovementPattern(ex.name).includes("squat") ||
            getMovementPattern(ex.name).includes("deadlift"))
      );
      addExercise(primaryCompound[0]);
      seenFocuses.add(focusType);
    }

    // Main Squat variation for Quads
    let available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "quads"
    );
    const squat = selectExercisesForMuscle(
      "quads",
      available,
      1,
      userGoals.level,
      userGoals.equipment
    ).filter(
      (ex) => ex.name.toLowerCase().includes("squat") && !selectedIds.has(ex.id)
    );
    addExercise(squat[0]);

    // Main Hinge variation for Hamstrings/Glutes
    available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "hamstrings"
    );
    const hinge = selectExercisesForMuscle(
      "hamstrings",
      available,
      1,
      userGoals.level,
      userGoals.equipment
    ).filter(
      (ex) =>
        (ex.name.toLowerCase().includes("deadlift") ||
          ex.name.toLowerCase().includes("hinge")) &&
        !selectedIds.has(ex.id) &&
        !selectedPatterns.has(getMovementPattern(ex.name))
    );
    addExercise(hinge[0]);

    // Unilateral movement (Lunge)
    available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "quads"
    );
    const lunge = selectExercisesForMuscle(
      "quads",
      available,
      1,
      userGoals.level,
      userGoals.equipment
    ).filter(
      (ex) =>
        ex.name.toLowerCase().includes("lunge") &&
        !selectedIds.has(ex.id) &&
        !selectedPatterns.has(getMovementPattern(ex.name))
    );
    addExercise(lunge[0]);

    // Calf exercise
    available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "calves"
    );
    const calfExercise = selectExercisesForMuscle(
      "calves",
      available,
      1,
      userGoals.level,
      userGoals.equipment
    ).filter((ex) => !selectedIds.has(ex.id));
    addExercise(calfExercise[0]);

    // Glute exercise
    available = getAvailableExercises(
      allExercises,
      userGoals.level,
      hardExercisesCount,
      hardExerciseMuscleGroups,
      "glutes"
    );
    const gluteExercise = selectExercisesForMuscle(
      "glutes",
      available,
      1,
      userGoals.level,
      userGoals.equipment
    ).filter(
      (ex) =>
        !selectedIds.has(ex.id) &&
        !selectedPatterns.has(getMovementPattern(ex.name))
    );
    addExercise(gluteExercise[0]);
  }

  // 2. Fill remaining slots with accessory exercises
  const remainingSlots = totalExercises - dayExercises.length;
  if (remainingSlots > 0) {
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
        userGoals.equipment
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

  // 3. Final Ordering: Place all compound lifts before isolation lifts
  const compoundLifts = dayExercises.filter(
    (ex) =>
      ex.exercise_type === "compound" ||
      ex.name.toLowerCase().includes("squat") ||
      ex.name.toLowerCase().includes("press") ||
      ex.name.toLowerCase().includes("row")
  );
  const isolationLifts = dayExercises.filter(
    (ex) => !compoundLifts.includes(ex)
  );

  // Shuffle within each category to provide variety
  compoundLifts.sort(() => Math.random() - 0.5);
  isolationLifts.sort(() => Math.random() - 0.5);

  const finalOrderedExercises = [...compoundLifts, ...isolationLifts];

  return { exercises: finalOrderedExercises, recoveryWarnings };
};

export const generateWorkoutPlan = async (
  supabaseClient: any,
  userGoals: UserGoals,
  recoveryData: any
) => {
  console.log("🏋️ Starting BACKEND AI workout plan generation...");

  const { data: allExercises, error: exerciseError } = await supabaseClient
    .from("exercises")
    .select("*, muscle_groups(name)");
  if (exerciseError)
    throw new Error(`Could not load exercises: ${exerciseError.message}`);
  console.log(`📋 Loaded ${allExercises.length} exercises from database`);
  console.log(
    "🔍 Sample exercise from DB:",
    JSON.stringify(allExercises[0], null, 2)
  );

  const muscleRecovery: MuscleRecovery = {};
  const muscleGroups = [
    "chest",
    "back",
    "shoulders",
    "biceps",
    "triceps",
    "forearms",
    "abs",
    "quads",
    "hamstrings",
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

  const seenFocuses = new Set<string>(); // Track first-time focuses
  const generatedDays = split.days.map((dayTemplate, index) => {
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
  });

  const plan = {
    name: `${split.name} - ${userGoals.goal} (${userGoals.level})`,
    description: `${
      userGoals.frequency
    } day per week ${split.name.toLowerCase()} focused on ${userGoals.goal.replace(
      "_",
      " "
    )}`,
    days: generatedDays,
    metadata: {
      ...userGoals,
      generatedAt: new Date().toISOString(),
      muscleRecoveryConsidered: true
    }
  };

  console.log("✅ Generated workout plan on backend");
  return {
    success: true,
    plan,
    context: { userGoals, allExercises, muscleRecovery, split }
  };
};

