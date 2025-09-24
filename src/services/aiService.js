import { supabase } from "../config/supabase";

// --- Constants and helpers for client-side single-day refresh ---

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
  home_gym: (exercise) => {
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
  bodyweight: (exercise) =>
    exercise.equipment?.toLowerCase().includes("bodyweight")
};

const getMovementPattern = (name) => {
  if (!name) return "";
  const lowerName = name.toLowerCase();
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
  if (pattern.trim().endsWith("s")) {
    pattern = pattern.trim().slice(0, -1);
  }
  return pattern.trim();
};

const getAvailableExercises = (
  allExercises,
  level,
  hardExerciseCount,
  hardExerciseMuscleGroups,
  muscleToFilter
) => {
  if (level === "beginner") {
    const beginnerPool = allExercises.filter(
      (ex) => ex.difficulty_level === "beginner"
    );
    // If the beginner pool is too small, expand it to include intermediate exercises.
    if (beginnerPool.length < 10) {
      const intermediatePool = allExercises.filter(
        (ex) => ex.difficulty_level === "intermediate"
      );
      return [...beginnerPool, ...intermediatePool];
    }
    return beginnerPool;
  }

  if (level === "intermediate") {
    // Intermediates should have access to beginner and intermediate exercises.
    return allExercises.filter((ex) => ex.difficulty_level !== "advanced");
  }

  // For advanced users, or intermediates who can still add hard exercises
  return allExercises;
};

const selectExercisesForMuscle = (
  muscle,
  allExercises,
  count,
  experienceLevel,
  equipment
) => {
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

/**
 * Generates the exercises and warnings for a single day of a workout plan.
 * This function remains on the client for a fast and responsive refresh experience.
 */
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

  if (dayTemplate.muscles.length === 0) {
    dayExercises.push({
      id: 1,
      name: "Active Recovery - Light Cardio",
      sets: "20-30 minutes",
      rest: "As needed",
      muscle_group: "Cardio",
      exercise_type: "compound",
      equipment: "bodyweight"
    });
    return { exercises: dayExercises, recoveryWarnings };
  }

  const totalExercises = Math.min(
    config.totalExercises.max,
    Math.max(config.totalExercises.min, dayTemplate.muscles.length * 2)
  );

  // --- New Balanced Selection Logic (Ported from Backend) ---
  const focusType = dayTemplate.focus.toLowerCase();
  const selectedIds = new Set();
  const selectedPatterns = new Set();
  let hardExercisesCount = 0;
  const hardExerciseMuscleGroups = new Set();

  // Helper to add an exercise and its pattern
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
        userGoals.equipment
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
      userGoals.equipment
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
      userGoals.equipment
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
      const rowExercises = available.filter(
        (ex) =>
          ex.exercise_type === "compound" &&
          getMovementPattern(ex.name).includes("row")
      );
      const horizontalPull = selectExercisesForMuscle(
        "back",
        rowExercises,
        1,
        userGoals.level,
        userGoals.equipment
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
    const verticalPullExercises = available.filter(
      (ex) =>
        (ex.name.toLowerCase().includes("pull-up") ||
          ex.name.toLowerCase().includes("lat pulldown")) &&
        !selectedIds.has(ex.id)
    );
    const verticalPull = selectExercisesForMuscle(
      "back",
      verticalPullExercises,
      1,
      userGoals.level,
      userGoals.equipment
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
    const horizontalPullExercises = available.filter(
      (ex) =>
        ex.name.toLowerCase().includes("row") &&
        !selectedIds.has(ex.id) &&
        !selectedPatterns.has(getMovementPattern(ex.name))
    );
    const horizontalPull = selectExercisesForMuscle(
      "back",
      horizontalPullExercises,
      1,
      userGoals.level,
      userGoals.equipment
    );
    addExercise(horizontalPull[0]);
  } else if (focusType.includes("legs")) {
    // --- New Leg Day Logic (mirrors backend) ---

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
          userGoals.equipment
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
        userGoals.equipment
      );

      if (selectedAccessory.length > 0) {
        addExercise(selectedAccessory[0]);
      }
      currentMuscleIndex = (currentMuscleIndex + 1) % accessoryMuscles.length;
    }
  }

  // 3. Final Ordering: Place all compound lifts before isolation lifts
  const compoundLifts = dayExercises.filter(
    (ex) =>
      ex.exercise_type === "compound" ||
      ex.name.toLowerCase().includes("squat") ||
      ex.name.toLowerCase().includes("deadlift") ||
      ex.name.toLowerCase().includes("bench") ||
      ex.name.toLowerCase().includes("press") ||
      ex.name.toLowerCase().includes("row")
  );
  const isolationLifts = dayExercises.filter(
    (ex) => !compoundLifts.includes(ex)
  );

  // Shuffle within each category to provide variety
  compoundLifts.sort(() => Math.random() - 0.5);
  isolationLifts.sort(() => Math.random() - 0.5);

  dayExercises = [...compoundLifts, ...isolationLifts];

  // Ensure total exercise count is respected
  if (dayExercises.length > totalExercises) {
    dayExercises.splice(totalExercises);
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

/**
 * Generate a complete workout plan by invoking the Supabase Edge Function.
 */
export const generateWorkoutPlan = async (userGoals, recoveryData) => {
  console.log("📞 Invoking Supabase Edge Function 'generate-workout-plan'...");

  const { data, error } = await supabase.functions.invoke(
    "generate-workout-plan",
    {
      body: { userGoals, recoveryData }
    }
  );

  if (error) {
    console.error("❌ Error invoking edge function:", error);
    return { success: false, error: error.message };
  }

  console.log("✅ Successfully received plan from edge function.");
  return data; // The edge function now returns the { success, plan, context } object
};

// This is a simplified client-side representation of WORKOUT_SPLITS
// The full source of truth is in the Supabase Edge Function.
const WORKOUT_SPLITS = {
  5: {
    days: [
      { focus: "Push", muscles: ["chest", "shoulders", "triceps"] },
      { focus: "Pull", muscles: ["back", "biceps"] },
      { focus: "Legs", muscles: ["quads", "hamstrings", "glutes", "calves"] },
      { focus: "Upper Body", muscles: ["chest", "back", "shoulders"] },
      {
        focus: "Lower Body (Glutes Focus)",
        muscles: ["glutes", "hamstrings", "quads", "calves"]
      }
    ]
  }
};
