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
  muscle,
  availableExercises,
  count,
  experienceLevel,
  equipment
) => {
  console.log(
    `🔍 Working with ${availableExercises.length} pre-filtered exercises for muscle "${muscle}"...`
  );
  const muscleExercises = availableExercises.filter(
    (ex) =>
      ex.muscle_groups &&
      ex.muscle_groups.name?.toLowerCase() === muscle.toLowerCase() &&
      EQUIPMENT_FILTERS[equipment](ex)
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
) => {
  let dayExercises = [];
  const recoveryWarnings = [];
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

  let totalExercises = Math.min(
    config.totalExercises.max,
    Math.max(config.totalExercises.min, dayTemplate.muscles.length * 2)
  );

  // Ensure at least 3 exercises are always generated
  if (totalExercises < 3) {
    totalExercises = 3;
  }

  const focusType = dayTemplate.focus.toLowerCase();
  const selectedIds = new Set();
  const selectedPatterns = new Set();
  let hardExercisesCount = 0;
  const hardExerciseMuscleGroups = new Set();

  const addExercise = (exercise) => {
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
        userGoals.equipment
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
      userGoals.equipment
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
        userGoals.equipment
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
      userGoals.equipment
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
      userGoals.equipment
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
      userGoals.equipment
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
        userGoals.equipment
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
      userGoals.equipment
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
        userGoals.equipment
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
          userGoals.equipment
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

  const finalOrderedExercises = [...dayExercises].sort((a, b) => {
    const keyLiftSubstrings = ["bench press", "squat", "deadlift", "row"];
    const aIsKeyLift = keyLiftSubstrings.some((substring) =>
      a.name.toLowerCase().includes(substring)
    );
    const bIsKeyLift = keyLiftSubstrings.some((substring) =>
      b.name.toLowerCase().includes(substring)
    );

    // 1. Prioritize key lifts
    if (aIsKeyLift && !bIsKeyLift) return -1;
    if (!aIsKeyLift && bIsKeyLift) return 1;

    const aIsCompound =
      a.exercise_type === "compound" ||
      a.name.toLowerCase().includes("press") ||
      a.name.toLowerCase().includes("row");
    const bIsCompound =
      b.exercise_type === "compound" ||
      b.name.toLowerCase().includes("press") ||
      b.name.toLowerCase().includes("row");

    // 2. Primary sorting: Compound vs. Isolation
    if (aIsCompound && !bIsCompound) return -1; // a (compound) comes first
    if (!aIsCompound && bIsCompound) return 1; // b (compound) comes first

    // 3. Secondary sorting (if both are compound): by difficulty
    if (aIsCompound && bIsCompound) {
      const difficultyOrder = { advanced: 0, intermediate: 1, beginner: 2 };
      const aDifficulty = difficultyOrder[a.difficulty_level] ?? 2;
      const bDifficulty = difficultyOrder[b.difficulty_level] ?? 2;
      if (aDifficulty < bDifficulty) return -1; // a (more difficult) comes first
      if (aDifficulty > bDifficulty) return 1; // b (more difficult) comes first
    }

    // 4. If types and difficulty are the same, maintain original order
    return 0;
  });

  return { exercises: finalOrderedExercises, recoveryWarnings };
};

export const generateWorkoutPlan = async (
  userGoals: UserGoals,
  allExercises: Exercise[],
  recoveryData: any
) => {
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