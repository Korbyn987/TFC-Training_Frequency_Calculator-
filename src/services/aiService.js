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

const selectExercisesForMuscle = (
  muscle,
  allExercises,
  count,
  experienceLevel,
  equipment
) => {
  const muscleExercises = allExercises.filter(
    (ex) =>
      // CRITICAL FIX: Align with backend data structure for client-side refresh
      ex.muscle_groups?.name?.toLowerCase() === muscle.toLowerCase() &&
      EQUIPMENT_FILTERS[equipment](ex)
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
    compoundCount = Math.ceil(count * 0.7);
    isolationCount = Math.floor(count * 0.3);
  }

  const selectedCompound = compound.slice(0, compoundCount);
  const selectedIsolation = isolation.slice(0, isolationCount);
  selected = [...selectedCompound, ...selectedIsolation];

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
 * This function remains on the client for a fast and responsive refresh experience.
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
      muscle_group: "Cardio"
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
