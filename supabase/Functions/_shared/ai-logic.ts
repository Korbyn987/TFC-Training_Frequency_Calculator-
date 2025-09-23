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

const selectExercisesForMuscle = (
  muscle: string,
  allExercises: Exercise[],
  count: number,
  experienceLevel: "beginner" | "intermediate" | "advanced",
  equipment: "full_gym" | "home_gym" | "bodyweight"
): Exercise[] => {
  const muscleExercises = allExercises.filter(
    (ex) =>
      // CRITICAL FIX: Look for the muscle group name in the nested object
      ex.muscle_groups?.name?.toLowerCase() === muscle.toLowerCase() &&
      EQUIPMENT_FILTERS[equipment](ex)
  );
  // ADD THIS LINE TO DEBUG:
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
  let selected: Exercise[] = [];

  let compoundCount = 0;
  let isolationCount = 0;

  if (experienceLevel === "beginner") {
    compoundCount = Math.ceil(count * 0.5);
    isolationCount = Math.floor(count * 0.5);
  } else if (experienceLevel === "intermediate") {
    compoundCount = Math.ceil(count * 0.6);
    isolationCount = Math.floor(count * 0.4);
  } else {
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

const generateSingleDayWorkout = (
  dayTemplate: { focus: string; muscles: string[] },
  userGoals: UserGoals,
  allExercises: Exercise[],
  muscleRecovery: MuscleRecovery
) => {
  const dayExercises: Exercise[] = [];
  const recoveryWarnings: any[] = [];
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
  } else {
    const totalExercises = Math.min(
      config.totalExercises.max,
      Math.max(config.totalExercises.min, dayTemplate.muscles.length * 2)
    );
    const exercisesPerMuscle = Math.floor(
      totalExercises / dayTemplate.muscles.length
    );
    let remainder = totalExercises % dayTemplate.muscles.length;

    for (const muscle of dayTemplate.muscles) {
      let countForThisMuscle = exercisesPerMuscle + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;

      if (countForThisMuscle > 0) {
        const exercises = selectExercisesForMuscle(
          muscle,
          allExercises,
          countForThisMuscle,
          userGoals.level,
          userGoals.equipment
        );
        dayExercises.push(...exercises);
      }
    }
    dayExercises.sort(() => Math.random() - 0.5);
    if (dayExercises.length > config.totalExercises.max) {
      dayExercises.splice(config.totalExercises.max);
    }
  }

  return { exercises: dayExercises, recoveryWarnings };
};

// --- Main Exported Function ---

export const generateWorkoutPlan = async (
  supabaseClient: any,
  userGoals: UserGoals,
  recoveryData: any
) => {
  console.log("🏋️ Starting BACKEND AI workout plan generation...");

  // CRITICAL FIX: Join with the muscle_groups table to get the name
  const { data: allExercises, error: exerciseError } = await supabaseClient
    .from("exercises")
    .select("*, muscle_groups(name)");
  if (exerciseError)
    throw new Error(`Could not load exercises: ${exerciseError.message}`);
  console.log(`📋 Loaded ${allExercises.length} exercises from database`);
  // ADD THIS LINE TO DEBUG:
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

  const generatedDays = split.days.map((dayTemplate, index) => {
    const dayResult = generateSingleDayWorkout(
      dayTemplate,
      userGoals,
      allExercises,
      muscleRecovery
    );
    return {
      day: index + 1,
      focus: dayTemplate.focus,
      ...dayResult
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
