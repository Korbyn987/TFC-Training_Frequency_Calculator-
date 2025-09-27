import { supabase } from "../config/supabase";

// --- Constants and helpers for client-side single-day refresh ---

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
const isUniversalBodyweightExercise = (exercise) => {
  const exerciseName = exercise.name.toLowerCase();
  return UNIVERSAL_BODYWEIGHT_EXERCISES.some(allowed => 
    exerciseName.includes(allowed)
  );
};

const EQUIPMENT_FILTERS = {
  full_gym: (exercise) => {
    const exerciseName = exercise.name.toLowerCase();
    // Exclude specific bodyweight exercises from gym settings
    if (GYM_BODYWEIGHT_EXCLUSIONS.some((ex) => exerciseName.includes(ex))) {
      return false;
    }

    // Allow bodyweight exercises only if they are in the universal whitelist
    if (exercise.equipment === "bodyweight") {
      return isUniversalBodyweightExercise(exercise);
    }
    return true; // Allow all other equipment types
  },
  home_gym: (exercise) => {
    const exerciseName = exercise.name.toLowerCase();
    // Exclude specific bodyweight exercises from gym settings
    if (GYM_BODYWEIGHT_EXCLUSIONS.some((ex) => exerciseName.includes(ex))) {
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
      "dumbbell",
      "barbell",
      "kettlebell",
      "weight",
      "plate"
    ];

    // Debug logging
    console.log(`🏠 HOME GYM FILTER (CLIENT) - Exercise: "${exercise.name}"`);
    console.log(`   Equipment: "${exercise.equipment || "NONE"}"`);

    const equipmentLower = (exercise.equipment || "").toLowerCase();

    console.log(`   Checking equipment: "${equipmentLower}"`);
    console.log(`   Checking name: "${exercise.name}"`);

    // ALWAYS check exercise name for machine/cable keywords FIRST, regardless of equipment field
    const isMachine = machineKeywords.some((keyword) => {
      const equipmentMatch = equipmentLower.includes(keyword);
      const nameMatch = exercise.name.toLowerCase().includes(keyword);
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
  bodyweight: (exercise) => {
    // With the database now having accurate equipment fields, this check is much simpler.
    return exercise.equipment === "bodyweight";
  }
};

// Helper function to detect cardio exercises
const isCardioExercise = (exercise) => {
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

// Helper function to detect core exercises
const isCoreExercise = (exercise) => {
  const exerciseName = exercise.name.toLowerCase();
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

  return coreKeywords.some((keyword) => exerciseName.includes(keyword));
};

// Helper function to check if cardio exercise is appropriate for experience level
const isAppropriateCardioForLevel = (exercise, level) => {
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
const getCardioFormat = (exercise, level) => {
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

// Helper function to identify static stretches
const isStretchExercise = (exercise) => {
  const exerciseName = exercise.name.toLowerCase();
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
  return stretchKeywords.some((keyword) => exerciseName.includes(keyword));
};

// Helper function to format sets for stretches
const getStretchFormat = (level) => {
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
const isFatLossGoal = (goal) => {
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
  equipment,
  selectedPatterns
) => {
  console.log(
    `🔍 Filtering for muscle "${muscle}" with equipment "${equipment}"...`
  );

  const legMuscles = ["quadriceps", "hamstrings", "glutes", "calves"];

  const muscleExercises = allExercises.filter((ex) => {
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
    `🔍 Found ${muscleExercises.length} exercises for muscle "${muscle}"`
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

  // SPECIAL LOGIC FOR BODYWEIGHT: Generate full-body workouts instead of splits
  if (userGoals.equipment === "bodyweight") {
    console.log("🏋️ BODYWEIGHT MODE (CLIENT): Generating full-body workout");
    console.log(`🎯 User level: ${userGoals.level}`);
    console.log(`📊 Total exercises available: ${allExercises.length}`);

    // Filter for bodyweight exercises within this block, not before
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
    const addExercise = (exercise) => {
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
    }

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
        userGoals.equipment,
        selectedPatterns
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
      userGoals.equipment,
      selectedPatterns
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
      userGoals.equipment,
      selectedPatterns
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
    exercises: dayExercises.map((ex) => {
      if (isStretchExercise(ex)) {
        const stretchFormat = getStretchFormat(userGoals.level);
        return {
          ...ex,
          sets: stretchFormat.sets,
          rest: stretchFormat.rest
        };
      }
      return {
        id: ex.id,
        name: ex.name,
        sets: ex.sets,
        rest: ex.rest,
        muscle_group: ex.muscle_group, // Keep this for display consistency
        muscle_groups: ex.muscle_groups // Pass the new structure along
      };
    }),
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

  // Ensure bodyweight workouts have generic names, even on the client
  if (data.plan && data.context.userGoals.equipment === "bodyweight") {
    console.log("Renaming bodyweight workout days on the client...");
    data.plan.days.forEach((day, index) => {
      day.focus = `Full Body Workout ${String.fromCharCode(65 + index)}`;
    });
  }

  // The backend now returns the full context needed for client-side refresh
  return data; // The edge function now returns the { success, plan, context } object
};

// This is a simplified client-side representation of WORKOUT_SPLITS
// The full source of truth is in the Supabase Edge Function.
const WORKOUT_SPLITS = {
  5: {
    days: [
      { focus: "Push", muscles: ["Chest", "Shoulders", "Triceps"] },
      { focus: "Pull", muscles: ["Back", "Biceps"] },
      {
        focus: "Legs",
        muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves"]
      },
      { focus: "Upper Body", muscles: ["Chest", "Back", "Shoulders"] },
      {
        focus: "Lower Body (Glutes Focus)",
        muscles: ["Glutes", "Hamstrings", "Quadriceps", "Calves"]
      }
    ]
  }
};
