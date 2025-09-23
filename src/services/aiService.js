import { getExercises } from "./supabaseWorkouts";

// Workout split templates based on frequency
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

// Exercise count and set/rep schemes based on experience level
const EXPERIENCE_CONFIGS = {
  beginner: {
    exercisesPerMuscle: { primary: 2, secondary: 1 },
    sets: { compound: "3x8-12", isolation: "2x10-15" },
    restTimes: { compound: "90-120s", isolation: "60-90s" },
    totalExercises: { min: 4, max: 6 }
  },
  intermediate: {
    exercisesPerMuscle: { primary: 2, secondary: 2 },
    sets: { compound: "4x6-10", isolation: "3x8-12" },
    restTimes: { compound: "120-180s", isolation: "90-120s" },
    totalExercises: { min: 5, max: 8 }
  },
  advanced: {
    exercisesPerMuscle: { primary: 3, secondary: 2 },
    sets: { compound: "4x4-8", isolation: "3x8-15" },
    restTimes: { compound: "180-240s", isolation: "90-120s" },
    totalExercises: { min: 6, max: 10 }
  }
};

// Equipment filtering
const EQUIPMENT_FILTERS = {
  full_gym: () => true, // All exercises
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

/**
 * Calculate muscle recovery percentage (0-100%) in UTC
 */
const calculateRecoveryPercentage = (lastWorkoutDate, recoveryHours = 72) => {
  if (!lastWorkoutDate) return 100; // Fully recovered if never worked

  // Get current time in UTC
  const now = new Date(new Date().toISOString());
  // Supabase provides UTC, so ensure it's parsed as such
  // CRITICAL FIX: Append 'Z' to the timestamp to force UTC parsing
  const lastWorkout = new Date(
    lastWorkoutDate.endsWith("Z") ? lastWorkoutDate : lastWorkoutDate + "Z"
  );

  const hoursSinceWorkout =
    (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);

  // Ensure percentage is never negative and is capped at 100
  const percentage = Math.min(100, (hoursSinceWorkout / recoveryHours) * 100);
  const finalPercentage = Math.max(0, percentage);

  // Use Math.floor to match the RecoveryGuideScreen and avoid decimals
  return Math.floor(finalPercentage);
};

/**
 * Select exercises for a specific muscle group
 */
const selectExercisesForMuscle = (
  muscle,
  allExercises,
  count,
  experienceLevel,
  equipment
) => {
  // Filter exercises for this muscle group and equipment
  const muscleExercises = allExercises.filter(
    (ex) =>
      ex.muscle_group?.toLowerCase() === muscle.toLowerCase() &&
      EQUIPMENT_FILTERS[equipment](ex)
  );

  if (muscleExercises.length === 0) return [];

  // Prioritize compound movements for beginners, mix for advanced
  const compound = muscleExercises.filter(
    (ex) =>
      ex.exercise_type === "compound" ||
      ex.name.toLowerCase().includes("press") ||
      ex.name.toLowerCase().includes("row") ||
      ex.name.toLowerCase().includes("squat")
  );

  const isolation = muscleExercises.filter((ex) => !compound.includes(ex));

  // CRITICAL FIX: Shuffle the filtered lists to ensure variety
  compound.sort(() => Math.random() - 0.5);
  isolation.sort(() => Math.random() - 0.5);

  const config = EXPERIENCE_CONFIGS[experienceLevel];
  let selected = [];

  // Determine the number of compound vs isolation exercises
  let compoundCount = 0;
  let isolationCount = 0;

  if (experienceLevel === "beginner") {
    compoundCount = Math.ceil(count * 0.5); // 50% compound
    isolationCount = Math.floor(count * 0.5);
  } else if (experienceLevel === "intermediate") {
    compoundCount = Math.ceil(count * 0.6); // 60% compound
    isolationCount = Math.floor(count * 0.4);
  } else {
    // Advanced
    compoundCount = Math.ceil(count * 0.7); // 70% compound
    isolationCount = Math.floor(count * 0.3);
  }

  // Select exercises using slice for true randomness
  const selectedCompound = compound.slice(0, compoundCount);
  const selectedIsolation = isolation.slice(0, isolationCount);

  selected = [...selectedCompound, ...selectedIsolation];

  // Add sets and rest times to the selected exercises
  selected = selected.map((ex) => {
    const isCompound = selectedCompound.some((ce) => ce.id === ex.id);
    return {
      ...ex,
      sets: isCompound ? config.sets.compound : config.sets.isolation,
      rest: isCompound ? config.restTimes.compound : config.restTimes.isolation,
      type: isCompound ? "compound" : "isolation",
      muscle_group: muscle
    };
  });

  // If not enough exercises were selected, fill with whatever is available
  if (selected.length < count) {
    const allAvailable = [...compound, ...isolation];
    for (let i = 0; selected.length < count && i < allAvailable.length; i++) {
      const exerciseToAdd = allAvailable[i];
      if (!selected.find((ex) => ex.id === exerciseToAdd.id)) {
        selected.push({
          ...exerciseToAdd,
          sets:
            exerciseToAdd.exercise_type === "compound"
              ? config.sets.compound
              : config.sets.isolation,
          rest:
            exerciseToAdd.exercise_type === "compound"
              ? config.restTimes.compound
              : config.restTimes.isolation,
          type: exerciseToAdd.exercise_type,
          muscle_group: muscle
        });
      }
    }
  }

  return selected;
};

/**
 * Generates the exercises and warnings for a single day of a workout plan.
 */
export const generateSingleDayWorkout = (
  dayTemplate,
  userGoals,
  allExercises,
  muscleRecovery
) => {
  const dayExercises = [];
  const recoveryWarnings = [];
  const config = EXPERIENCE_CONFIGS[userGoals.level];

  // Check recovery status to create warnings
  const musclesForThisDay = dayTemplate.muscles;
  musclesForThisDay.forEach((muscle) => {
    const recoveryInfo = muscleRecovery[muscle];
    if (recoveryInfo && recoveryInfo.percentage < 100) {
      const now = new Date(new Date().toISOString());
      const lastWorkout = new Date(
        recoveryInfo.lastWorkout.endsWith("Z")
          ? recoveryInfo.lastWorkout
          : recoveryInfo.lastWorkout + "Z"
      );
      const hoursSince =
        (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);
      const hoursRemaining = Math.max(
        0,
        recoveryInfo.recoveryHours - hoursSince
      );

      let timeString = "";
      if (hoursRemaining > 24) {
        timeString = `${Math.round(hoursRemaining / 24)} days`;
      } else {
        timeString = `${Math.round(hoursRemaining)} hours`;
      }

      recoveryWarnings.push({
        muscle: muscle.charAt(0).toUpperCase() + muscle.slice(1),
        percentage: Math.floor(recoveryInfo.percentage),
        timeRemaining: timeString
      });
    }
  });

  if (musclesForThisDay.length === 0) {
    dayExercises.push({
      id: 1, // A real exercise ID for cardio/rest
      name: "Active Recovery - Light Cardio",
      sets: "20-30 minutes",
      rest: "As needed",
      muscle_group: "Cardio"
    });
  } else {
    const totalExercises = Math.min(
      config.totalExercises.max,
      Math.max(config.totalExercises.min, musclesForThisDay.length * 2)
    );

    const exercisesPerMuscle = Math.floor(
      totalExercises / musclesForThisDay.length
    );
    let remainder = totalExercises % musclesForThisDay.length;

    for (const muscle of musclesForThisDay) {
      let countForThisMuscle = exercisesPerMuscle + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;

      if (countForThisMuscle > 0) {
        const exercises = selectExercisesForMuscle(
          muscle,
          allExercises, // Pass the original unshuffled list
          countForThisMuscle,
          userGoals.level,
          userGoals.equipment
        );
        dayExercises.push(...exercises);
      }
    }
    // This shuffle is less important now but adds a final mix-up of muscle groups
    dayExercises.sort(() => Math.random() - 0.5);

    if (dayExercises.length > config.totalExercises.max) {
      dayExercises.splice(config.totalExercises.max);
    }
  }

  return {
    exercises: dayExercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      sets: ex.sets,
      rest: ex.rest,
      muscle_group: ex.muscle_group
    })),
    recoveryWarnings
  };
};

/**
 * Generate a complete workout plan using real exercises and recovery data
 */
export const generateWorkoutPlan = async (
  userGoals,
  recoveryData, // Use the data passed from the screen
  workoutHistory
) => {
  try {
    console.log("🏋️ Starting AI workout plan generation...");

    // 1. Load all available exercises from database
    const exerciseResult = await getExercises();
    if (!exerciseResult.success) {
      throw new Error("Could not load exercises from database");
    }
    const allExercises = exerciseResult.exercises;
    console.log(`📋 Loaded ${allExercises.length} exercises from database`);

    // 2. Use the recovery data passed from the UI for consistency
    const currentRecoveryData = recoveryData;
    console.log("💪 Using recovery data from context:", currentRecoveryData);

    // 3. Calculate recovery percentages for each muscle group
    const muscleRecovery = {};
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
      const recoveryInfo = currentRecoveryData?.[muscle.toLowerCase()];
      const lastWorkout = recoveryInfo?.lastWorkout;
      const recoveryHours = recoveryInfo?.recoveryTime || 72;

      muscleRecovery[muscle] = {
        percentage: calculateRecoveryPercentage(lastWorkout, recoveryHours),
        lastWorkout,
        recoveryHours
      };
    });

    console.log("🔄 Muscle recovery percentages:", muscleRecovery);

    // 4. Get workout split based on frequency
    const split = WORKOUT_SPLITS[userGoals.frequency];
    if (!split) {
      throw new Error(
        `No workout split available for ${userGoals.frequency} days per week`
      );
    }

    // 5. Generate each day of the workout plan
    const generatedDays = [];

    for (let dayIndex = 0; dayIndex < split.days.length; dayIndex++) {
      const dayTemplate = split.days[dayIndex];

      const dayResult = generateSingleDayWorkout(
        dayTemplate,
        userGoals,
        allExercises,
        muscleRecovery
      );

      generatedDays.push({
        day: dayIndex + 1,
        focus: dayTemplate.focus,
        ...dayResult
      });
    }

    // 6. Create the final plan
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
        goal: userGoals.goal,
        level: userGoals.level,
        frequency: userGoals.frequency,
        equipment: userGoals.equipment,
        generatedAt: new Date().toISOString(),
        muscleRecoveryConsidered: true
      }
    };

    console.log("✅ Generated workout plan:", plan);
    return {
      success: true,
      plan,
      context: { userGoals, allExercises, muscleRecovery, split }
    };
  } catch (error) {
    console.error("❌ Error generating workout plan:", error);
    return {
      success: false,
      error: error.message || "Failed to generate workout plan"
    };
  }
};
