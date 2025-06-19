import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Picker,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { safeNavigate, safePush } from "../shims/NavigationWeb";

import { useFocusEffect } from "@react-navigation/native";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";
import { addWorkout } from "../redux/workoutSlice";

const setTypes = [
  { label: "Warmup", value: "warmup" },
  { label: "Working Set", value: "numbered" },
  { label: "Failure", value: "failure" },
  { label: "Drop", value: "drop" }
];

// Map of exercise IDs to muscle group names
// Note: These must match the muscle group names used in the Redux store
// MODIFIED: Only tracking calf exercises now, all other exercises map to null
const EXERCISE_TO_MUSCLE_GROUP = {
  // Chest (1)
  1: "Chest",
  2: "Chest",
  3: "Chest",
  4: "Chest",
  5: "Chest",
  6: "Chest",
  7: "Chest",
  8: "Chest",
  9: "Chest",
  10: "Chest",
  11: "Chest",
  12: "Chest",
  13: "Chest",
  14: "Chest",
  15: "Chest",
  16: "Chest",
  17: "Chest",
  18: "Chest",
  19: "Chest",
  20: "Chest",
  21: "Chest",
  22: "Chest",
  23: "Chest",
  24: "Chest",
  25: "Chest",
  26: "Chest",
  27: "Chest",

  // Biceps (2)
  28: "Biceps",
  29: "Biceps",
  30: "Biceps",
  31: "Biceps",
  32: "Biceps",
  33: "Biceps",
  34: "Biceps",
  35: "Biceps",
  36: "Biceps",
  37: "Biceps",
  38: "Biceps",
  39: "Biceps",

  // Triceps (3)
  40: "Triceps",
  41: "Triceps",
  42: "Triceps",
  43: "Triceps",
  44: "Triceps",
  45: "Triceps",
  46: "Triceps",
  47: "Triceps",
  48: "Triceps",
  49: "Triceps",
  50: "Triceps",
  51: "Triceps",

  // Back (4)
  52: "Back",
  53: "Back",
  54: "Back",
  55: "Back",
  56: "Back",
  57: "Back",
  58: "Back",
  59: "Back",
  60: "Back",
  61: "Back",
  62: "Back",
  63: "Back",
  64: "Back",
  65: "Back",
  66: "Back",
  67: "Back",
  68: "Back",
  69: "Back",
  70: "Back",
  71: "Back",
  72: "Back",
  73: "Back",
  74: "Back",
  75: "Back",
  76: "Back",
  77: "Back",
  78: "Back",

  // Shoulders (5) - Mapped to 'Shoulders' in Redux store
  79: "Shoulders",
  80: "Shoulders",
  81: "Shoulders",
  82: "Shoulders",
  83: "Shoulders",
  84: "Shoulders",
  85: "Shoulders",
  86: "Shoulders",
  87: "Shoulders",
  88: "Shoulders",
  89: "Shoulders",
  90: "Shoulders",
  91: "Shoulders",
  92: "Shoulders",
  93: "Shoulders",
  94: "Shoulders",
  95: "Shoulders",
  96: "Shoulders",
  97: "Shoulders",
  98: "Shoulders",
  99: "Shoulders",
  100: "Shoulders",
  101: "Shoulders",
  102: "Shoulders",
  103: "Shoulders",
  104: "Shoulders",
  105: "Shoulders",
  106: "Shoulders",
  107: "Shoulders",
  108: "Shoulders",
  109: "Shoulders",
  110: "Shoulders",
  111: "Shoulders",
  112: "Shoulders",
  113: "Shoulders",
  114: "Shoulders",
  115: "Shoulders",
  116: "Shoulders",
  117: "Shoulders",
  118: "Shoulders",
  119: "Shoulders",
  120: "Shoulders",
  121: "Shoulders",
  122: "Shoulders",
  123: "Shoulders",
  124: "Shoulders",
  125: "Shoulders",
  126: "Shoulders",
  127: "Shoulders",
  128: "Shoulders",
  129: "Shoulders",
  130: "Shoulders",
  131: "Shoulders",
  132: "Shoulders",
  133: "Shoulders",
  134: "Shoulders",
  135: "Shoulders",
  136: "Shoulders",
  137: "Shoulders",
  138: "Shoulders",
  139: "Shoulders",
  140: "Shoulders",
  141: "Shoulders",
  142: "Shoulders",
  143: "Shoulders",
  144: "Shoulders",
  145: "Shoulders",
  146: "Shoulders",
  147: "Shoulders",
  148: "Shoulders",
  149: "Shoulders",
  150: "Shoulders",
  151: "Shoulders",
  152: "Shoulders",

  // Legs (6) - Mapped to specific leg muscles in Redux store
  // Quads
  90: "Quads",
  91: "Quads",
  92: "Quads",
  93: "Quads",
  94: "Quads",
  95: "Quads",
  96: "Quads",
  97: "Quads",
  98: "Quads",
  99: "Quads",
  100: "Quads",
  101: "Quads",
  102: "Quads",
  103: "Quads",
  104: "Quads",
  105: "Quads",
  106: "Quads",
  107: "Quads",

  // Hamstrings
  108: "Hamstrings",
  109: "Hamstrings",
  110: "Hamstrings",
  111: "Hamstrings",
  112: "Hamstrings",
  113: "Hamstrings",
  114: "Hamstrings",
  115: "Hamstrings",
  116: "Hamstrings",
  117: "Hamstrings",
  118: "Hamstrings",
  119: "Hamstrings",

  // Calves
  120: "Calves",
  121: "Calves",
  122: "Calves",
  123: "Calves",
  124: "Calves",
  125: "Calves",
  126: "Calves",
  127: "Calves",
  128: "Calves",
  129: "Calves",

  // Glutes
  130: "Glutes",
  131: "Glutes",
  132: "Glutes",
  133: "Glutes",
  134: "Glutes",
  135: "Glutes",
  136: "Glutes",
  137: "Glutes",
  138: "Glutes",
  139: "Glutes",
  140: "Glutes",
  141: "Glutes",
  142: "Glutes",
  143: "Glutes",
  144: "Glutes",
  145: "Glutes",
  146: "Glutes",
  147: "Glutes",
  148: "Glutes",
  149: "Glutes",
  150: "Glutes",
  151: "Glutes",
  152: "Glutes",

  // Core (7) - Mapped to 'Core' in Redux store (matches 'abs' in Redux)
  153: "Core",
  154: "Core",
  155: "Core",
  156: "Core",
  157: "Core",
  158: "Core",
  159: "Core",
  160: "Core",
  161: "Core",
  162: "Core",
  163: "Core",
  164: "Core",
  165: "Core",
  166: "Core",
  167: "Core",
  168: "Core",
  169: "Core",
  170: "Core",
  171: "Core",
  172: "Core",
  173: "Core",
  174: "Core",
  175: "Core",
  176: "Core",
  177: "Core",
  178: "Core",
  179: "Core",
  180: "Core"
};

const ConfigureWorkoutScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { exercises, workoutName: navWorkoutName } = route.params || {};
  const safeExercises = Array.isArray(exercises) ? exercises : [];
  const [workoutName, setWorkoutName] = useState(navWorkoutName || "");
  const [exerciseConfigs, setExerciseConfigs] = useState(
    safeExercises.map((exercise) => ({
      ...exercise,
      sets:
        exercise.sets &&
        Array.isArray(exercise.sets) &&
        exercise.sets.length > 0
          ? exercise.sets
          : [
              {
                setType: "numbered",
                reps: "10",
                weight: "",
                notes: ""
              }
            ]
    }))
  );

  // Handle initial loading of exercises from params or AsyncStorage
  useEffect(() => {
    // If we have exercises from a preset, prioritize those
    if (Array.isArray(safeExercises) && safeExercises.length > 0 && route.params?.fromPreset) {
      console.log('[ConfigureWorkoutScreen] Loading exercises from preset:', safeExercises.length);
      setExerciseConfigs(
        safeExercises.map((exercise) => ({
          ...exercise,
          sets: Array.isArray(exercise.sets) && exercise.sets.length > 0
            ? exercise.sets
            : [{ setType: "numbered", reps: "10", weight: "", notes: "" }]
        }))
      );
    }
    // Otherwise, if no exercises are present and no selectedExercises param
    else if (
      exerciseConfigs.length === 0 &&
      (!route.params?.selectedExercises ||
        route.params.selectedExercises.length === 0)
    ) {
      const loadSavedWorkout = async () => {
        const workoutStr = await AsyncStorage.getItem("savedWorkout");
        if (workoutStr) {
          const workout = JSON.parse(workoutStr);
          setWorkoutName(workout.name || "");
          setExerciseConfigs(
            Array.isArray(workout.exercises) ? workout.exercises : []
          );
        } else if (Array.isArray(safeExercises) && safeExercises.length > 0) {
          setExerciseConfigs(
            safeExercises.map((exercise) => ({
              ...exercise,
              sets:
                exercise.sets &&
                Array.isArray(exercise.sets) &&
                exercise.sets.length > 0
                  ? exercise.sets
                  : [{ setType: "numbered", reps: "10", weight: "", notes: "" }]
            }))
          );
        }
      };
      loadSavedWorkout();
    }
  }, [route.params?.fromPreset]);

  // Always prioritize selectedExercises param if present
  useEffect(() => {
    if (
      route.params?.selectedExercises &&
      Array.isArray(route.params.selectedExercises)
    ) {
      console.log(
        "[ConfigureWorkoutScreen] Received selectedExercises param:",
        route.params.selectedExercises
      );
      // Initialize all exercises with proper sets arrays
      const initializedExercises = route.params.selectedExercises.map((ex) => {
        // Safely ensure the exercise has a valid structure
        return {
          id: ex.id,
          name: ex.name || "Unnamed Exercise",
          description: ex.description || "",
          muscle_group_id: ex.muscle_group_id || ex.muscleGroupId,
          // Ensure sets is properly initialized
          sets:
            Array.isArray(ex.sets) && ex.sets.length > 0
              ? ex.sets
              : [{ setType: "numbered", reps: "10", weight: "", notes: "" }]
        };
      });

      // Update the exercise configs with properly initialized exercises
      setExerciseConfigs(initializedExercises);
      navigation.setParams({ selectedExercises: undefined });
    }
  }, [route.params?.selectedExercises]);

  // Removed excessive debug logging that was causing infinite console messages
  // Only log exercise config changes in development mode and limit frequency
  useEffect(() => {
    // Debug log exerciseConfigs changes, but only if not empty and only in development
    if (process.env.NODE_ENV === "development" && exerciseConfigs.length > 0) {
      console.log(
        `[ConfigureWorkoutScreen] Working with ${exerciseConfigs.length} exercises`
      );
    }
  }, [exerciseConfigs.length]); // Only track length changes, not the entire object

  useEffect(() => {
    if (
      route.params?.addExercises &&
      Array.isArray(route.params.addExercises) &&
      route.params.addExercises.length > 0
    ) {
      setExerciseConfigs((prev) => [
        ...prev,
        ...route.params.addExercises
          .filter((newEx) => !prev.some((existing) => existing.id === newEx.id))
          .map((exercise) => ({
            ...exercise,
            // Make sure each exercise has a properly initialized sets array
            sets:
              Array.isArray(exercise.sets) && exercise.sets.length > 0
                ? exercise.sets
                : [
                    {
                      setType: "numbered",
                      reps: "10",
                      weight: "",
                      notes: ""
                    }
                  ]
          }))
      ]);
      // Clear the param to prevent repeated additions
      navigation.setParams({ addExercises: [] });
    }
  }, [route.params?.addExercises]);

  // This tracks if we've already loaded the temp workout to prevent duplicate loads
  const [tempWorkoutLoaded, setTempWorkoutLoaded] = useState(false);

  // Cleanup effect - this runs when the component unmounts
  useEffect(() => {
    return () => {
      // When navigating away from this screen to a non-exercise related screen,
      // clear the temp workout config to prevent future duplicate loads
      if (navigation.getState) {
        try {
          const currentRoute =
            navigation.getState().routes[navigation.getState().index];
          if (
            currentRoute.name !== "AddExercise" &&
            currentRoute.name !== "SelectRoutine"
          ) {
            AsyncStorage.removeItem("tempWorkoutConfig");
            console.log("Cleared temporary workout configuration");
          }
        } catch (e) {
          console.warn("Error checking navigation state:", e);
        }
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Load temp workout config when returning to this screen
      const loadTempWorkout = async () => {
        // Skip if we've already loaded once to prevent infinite loops
        if (tempWorkoutLoaded) {
          console.log("Temp workout already loaded, skipping...");
          return;
        }

        try {
          const savedConfig = await AsyncStorage.getItem("tempWorkoutConfig");
          if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);

            // Only restore if we have exercise configurations
            if (parsedConfig.exercises && parsedConfig.exercises.length > 0) {
              console.log(
                "Restoring saved workout configuration with",
                parsedConfig.exercises.length,
                "exercises"
              );
              setExerciseConfigs(parsedConfig.exercises);

              if (parsedConfig.name) {
                setWorkoutName(parsedConfig.name);
              }

              // Mark as loaded to prevent duplicate loads
              setTempWorkoutLoaded(true);
            }
          }
        } catch (error) {
          console.error("Error loading temp workout config:", error);
        }
      };

      // First handle any newly added exercise from params
      if (route.params?.addExercise) {
        const newExercise = route.params.addExercise;
        // Prevent duplicates
        if (!exerciseConfigs.some((ex) => ex.id === newExercise.id)) {
          // Create a properly structured exercise object with safety checks
          const safeExercise = {
            id: newExercise.id,
            name: newExercise.name || "Unnamed Exercise",
            description: newExercise.description || "",
            muscle_group_id:
              newExercise.muscle_group_id || newExercise.muscleGroupId,
            // Always initialize with a default set
            sets:
              Array.isArray(newExercise.sets) && newExercise.sets.length > 0
                ? newExercise.sets
                : [
                    {
                      setType: "numbered",
                      reps: "10",
                      weight: "",
                      notes: ""
                    }
                  ]
          };

          setExerciseConfigs((prev) => [...prev, safeExercise]);
        }
        navigation.setParams({ addExercise: undefined }); // Clear param
      } else if (!tempWorkoutLoaded) {
        // Only load temp workout if it hasn't been loaded yet
        loadTempWorkout();
      }

      // Return cleanup function for focus effect
      return () => {
        // No specific cleanup needed here
      };
    }, [route.params?.addExercise, tempWorkoutLoaded])
  );

  const handleUpdateSet = (exerciseIdx, setIdx, field, value) => {
    const newConfigs = [...exerciseConfigs];
    const newSets = [...newConfigs[exerciseIdx].sets];
    newSets[setIdx] = { ...newSets[setIdx], [field]: value };
    newConfigs[exerciseIdx].sets = newSets;
    setExerciseConfigs(newConfigs);
  };

  const handleAddSet = (exerciseIdx) => {
    const newConfigs = [...exerciseConfigs];
    newConfigs[exerciseIdx].sets = [
      ...newConfigs[exerciseIdx].sets,
      {
        setType: "numbered",
        reps: "12",
        weight: "",
        notes: ""
      }
    ];
    setExerciseConfigs(newConfigs);
  };

  const handleRemoveSet = (exerciseIdx, setIdx) => {
    const newConfigs = [...exerciseConfigs];
    const sets = [...newConfigs[exerciseIdx].sets];
    if (sets.length > 1) {
      sets.splice(setIdx, 1);
      newConfigs[exerciseIdx].sets = sets;
      setExerciseConfigs(newConfigs);
    }
  };

  const handleUpdateConfig = (index, field, value) => {
    const newConfigs = [...exerciseConfigs];
    newConfigs[index] = {
      ...newConfigs[index],
      [field]: value
    };
    setExerciseConfigs(newConfigs);
  };

  const handleRemoveExercise = (exerciseIdx) => {
    const newConfigs = [...exerciseConfigs];
    newConfigs.splice(exerciseIdx, 1);
    setExerciseConfigs(newConfigs);
  };

  const handleSaveWorkout = async () => {
    try {
      // Extract unique muscle groups from all exercises
      const muscleGroups = new Set();

      console.log("Saving workout with exercises:", exerciseConfigs);

      exerciseConfigs.forEach((exercise) => {
        if (exercise.id && EXERCISE_TO_MUSCLE_GROUP[exercise.id]) {
          const muscleGroup = EXERCISE_TO_MUSCLE_GROUP[exercise.id];
          console.log(
            `Exercise ${exercise.name} (ID: ${exercise.id}) maps to muscle group:`,
            muscleGroup
          );
          muscleGroups.add(muscleGroup);
        } else {
          console.warn(
            `No muscle group mapping found for exercise ID: ${exercise.id} (${exercise.name})`
          );
        }
      });

      // Convert Set to array for Redux
      const muscles = Array.from(muscleGroups);

      if (muscles.length === 0) {
        // Fallback in case we couldn't determine muscle groups
        console.warn("No muscle groups found for exercises, using default");
        muscles.push("Full Body");
      }

      console.log("Saving workout with muscle groups:", muscles);

      // Create the workout data
      const workoutData = {
        date: new Date().toISOString(),
        muscles,
        intensity: "moderate",
        name: workoutName || "My Workout",
        exercises: exerciseConfigs
      };

      console.log("Dispatching addWorkout with data:", workoutData);

      // Dispatch to Redux store
      dispatch(addWorkout(workoutData));

      // Save the workout to AsyncStorage for the current workout section
      await AsyncStorage.setItem("savedWorkout", JSON.stringify(workoutData));
      console.log("Workout saved to AsyncStorage:", workoutData);

      // Only set workout in progress if there are exercises
      if (exerciseConfigs && exerciseConfigs.length > 0) {
        await AsyncStorage.setItem("workoutInProgress", "true");
        await AsyncStorage.setItem("selectedMuscles", JSON.stringify(muscles));
      } else {
        // If no exercises, ensure workoutInProgress is false
        await AsyncStorage.setItem("workoutInProgress", "false");
      }

      // Use multiple approaches for more reliable navigation
      try {
        // First try the safe navigation method
        safeNavigate(navigation, "Home", { workoutJustSaved: true });

        // Add fallbacks with timeout for the web environment
        if (typeof window !== "undefined") {
          // Attempt normal navigation as fallback
          setTimeout(() => {
            console.log("Using standard navigation as fallback...");
            try {
              navigation.navigate("Home", { workoutJustSaved: true });
            } catch (e) {
              console.warn("Standard navigation fallback failed:", e);
            }
          }, 300);

          // Last resort - use reset navigation or direct URL navigation
          setTimeout(() => {
            console.log("Using navigation reset as final fallback...");
            try {
              navigation.reset({
                index: 0,
                routes: [{ name: "Home", params: { workoutJustSaved: true } }]
              });
            } catch (e) {
              console.warn("Navigation reset fallback failed:", e);
              // Direct URL redirection as last resort
              window.location.href = "/";
            }
          }, 600);
        }
      } catch (navError) {
        console.error("Navigation error:", navError);
        // Final fallback - use window.location for web
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert("Error", "Failed to save workout. Please try again.");
    }
  };

  const renderSet = (exerciseIdx, set, setIdx, setsLength) => (
    <View key={setIdx} style={styles.setCard}>
      <Text style={styles.setNumber}>Set {setIdx + 1}</Text>
      <View style={styles.configRow}>
        <View style={styles.configItem}>
          <Text style={styles.label}>Set Type</Text>
          <Picker
            selectedValue={set.setType}
            style={styles.picker}
            onValueChange={(value) =>
              handleUpdateSet(exerciseIdx, setIdx, "setType", value)
            }
            mode="dropdown"
          >
            {setTypes.map((type) => (
              <Picker.Item
                key={type.value}
                label={type.label}
                value={type.value}
              />
            ))}
          </Picker>
        </View>
        <View style={styles.configItem}>
          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            value={set.reps}
            onChangeText={(value) =>
              handleUpdateSet(exerciseIdx, setIdx, "reps", value)
            }
            keyboardType="numeric"
            placeholder="12"
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.configItem}>
          <Text style={styles.label}>Weight</Text>
          <TextInput
            style={styles.input}
            value={set.weight}
            onChangeText={(value) =>
              handleUpdateSet(exerciseIdx, setIdx, "weight", value)
            }
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#666"
          />
        </View>
      </View>
      <View style={styles.notesContainer}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          value={set.notes}
          onChangeText={(value) =>
            handleUpdateSet(exerciseIdx, setIdx, "notes", value)
          }
          placeholder="Add notes here..."
          placeholderTextColor="#666"
          multiline
        />
      </View>
      <View style={styles.setActionsRow}>
        {setsLength > 1 && (
          <TouchableOpacity
            style={styles.removeSetButton}
            onPress={() => handleRemoveSet(exerciseIdx, setIdx)}
          >
            <Text style={styles.removeSetButtonText}>Remove Set</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderExerciseConfig = ({ item, index }) => {
    // Defensive check - ensure item has a sets array
    const sets = Array.isArray(item.sets) ? item.sets : [];

    return (
      <View style={styles.exerciseCard}>
        <TouchableOpacity
          style={styles.removeExerciseButton}
          onPress={() => handleRemoveExercise(index)}
        >
          <View>
            <MaterialIcons name="close" size={24} color="#e53e3e" />
          </View>
        </TouchableOpacity>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseDesc}>{item.description || ""}</Text>
        {sets.map((set, setIdx) => renderSet(index, set, setIdx, sets.length))}
        <TouchableOpacity
          style={styles.addSetButton}
          onPress={() => handleAddSet(index)}
        >
          <Text style={styles.addSetButtonText}>+ Add Set</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Reference to the scroll view
  const scrollViewRef = React.useRef(null);

  // Simplified scrolling functionality with color consistency
  useEffect(() => {
    if (typeof document !== "undefined") {
      // Force the page to be scrollable by adding minimum height to content
      // and ensure consistent dark theme colors
      const style = document.createElement("style");
      style.innerHTML = `
        /* Ensure content is always scrollable */
        .rn-scrollview-content {
          min-height: 150vh !important; /* Force content to be taller than viewport */
          background-color: #171923 !important; /* App dark theme */
        }
        
        /* Make main container scrollable and maintain dark theme */
        body, html, #root, .scrollable-container {
          height: 100%;
          overflow-y: auto !important;
          background-color: #171923 !important; /* App dark theme */
          color: #ffffff !important; /* Light text for dark theme */
        }

        /* Remove any potential scroll blockers */
        * {
          overflow: visible !important;
        }

        /* Add explicit scroll styling with consistent color theme */
        .scroll-container {
          max-height: 100vh;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch;
          background-color: #171923 !important; /* App dark theme */
        }
        
        /* Ensure all ScrollView parents maintain dark theme */
        .rn-scrollview, .rn-scrollview-content, .rn-scrollview-container {
          background-color: #171923 !important; /* App dark theme */
        }
        
        /* Ensure all view containers maintain the theme */
        .rn-view {
          background-color: transparent;
        }
      `;
      document.head.appendChild(style);

      // Apply explicit scrolling properties to document
      document.documentElement.style.overflowY = "auto";
      document.body.style.overflowY = "auto";

      // Ensure all React Native ScrollView elements can actually scroll
      setTimeout(() => {
        const scrollViews = document.querySelectorAll(".rn-scrollview");
        scrollViews.forEach((sv) => {
          sv.style.overflowY = "auto";
          sv.style.maxHeight = "100vh";
          sv.style.WebkitOverflowScrolling = "touch";
        });

        console.log(
          "Applied forced scrolling to",
          scrollViews.length,
          "scroll views"
        );
      }, 500);

      return () => {
        if (style.parentNode) {
          document.head.removeChild(style);
        }
      };
    }
  }, []);

  // Apply dark theme to the entire document to prevent white backgrounds
  useEffect(() => {
    if (typeof document !== "undefined") {
      // Apply the dark theme to the entire document and its parent containers
      document.body.style.backgroundColor = "#171923";
      document.documentElement.style.backgroundColor = "#171923";

      // Force dark theme on any parent containers
      const applyDarkTheme = () => {
        // Target all potential parent containers
        const containers = document.querySelectorAll(
          ".rn-scrollview, .rn-scrollview-content, .rn-scrollview-container, div"
        );
        containers.forEach((container) => {
          // Only set background if it's currently white or undefined
          const currentBg = window.getComputedStyle(container).backgroundColor;
          if (
            currentBg === "rgb(255, 255, 255)" ||
            currentBg === "rgba(0, 0, 0, 0)"
          ) {
            container.style.backgroundColor = "#171923";
          }
        });
      };

      // Apply theme initially and after short delay to catch any late-rendering elements
      applyDarkTheme();
      const intervalId = setInterval(applyDarkTheme, 500);

      return () => clearInterval(intervalId);
    }
  }, []);

  // Auto-scroll when a new exercise is added
  useEffect(() => {
    if (exerciseConfigs.length > 0) {
      // Delay to ensure the DOM is updated
      const timeoutId = setTimeout(() => {
        if (scrollViewRef.current) {
          // Scroll to a position near the bottom to show the new exercise
          const scrollHeight = document.documentElement.scrollHeight;
          const windowHeight = window.innerHeight;
          window.scrollTo({
            top: scrollHeight - windowHeight * 0.8,
            behavior: "smooth"
          });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [exerciseConfigs.length]);

  // Helper functions for manual scrolling
  const scrollDown = () => {
    if (typeof window !== "undefined" && scrollViewRef.current) {
      const currentPos = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      window.scrollTo({
        top: currentPos + windowHeight * 0.7,
        behavior: "smooth"
      });
    }
  };

  const scrollUp = () => {
    if (typeof window !== "undefined" && scrollViewRef.current) {
      const currentPos = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      window.scrollTo({
        top: Math.max(0, currentPos - windowHeight * 0.7),
        behavior: "smooth"
      });
    }
  };

  // This useEffect has been replaced with the enhanced one above

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
        className="scroll-container"
        nestedScrollEnabled={true}
      >
        <View style={styles.header}>
          <TextInput
            style={styles.workoutNameInput}
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="Workout Name"
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={async () => {
              // Save current exercises to AsyncStorage before navigating
              const workoutData = {
                name: workoutName,
                exercises: exerciseConfigs
              };
              await AsyncStorage.setItem(
                "tempWorkoutConfig",
                JSON.stringify(workoutData)
              );

              // Create a list of exercise IDs to pass as previousExercises
              const currentExerciseIds = exerciseConfigs.map((ex) => ({
                id: ex.id,
                name: ex.name,
                description: ex.description || "",
                muscle_group_id: ex.muscle_group_id || ex.muscleGroupId
              }));

              // Navigate with the current exercises so they appear selected
              safeNavigate(navigation, "AddExercise", {
                previousExercises: currentExerciseIds
              });
            }}
          >
            <View>
              <MaterialIcons
                name="add-circle-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 6 }}
              />
            </View>
            <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={async () => {
              // Save current exercises to AsyncStorage before navigating
              const workoutData = {
                name: workoutName,
                exercises: exerciseConfigs
              };
              await AsyncStorage.setItem(
                "tempWorkoutConfig",
                JSON.stringify(workoutData)
              );
              safePush(navigation, "SelectRoutine");
            }}
          >
            <View>
              <MaterialIcons
                name="playlist-add"
                size={20}
                color="#fff"
                style={{ marginRight: 6 }}
              />
            </View>
            <Text style={styles.addExerciseButtonText}>Select Routine</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={exerciseConfigs}
          renderItem={renderExerciseConfig}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.exerciseList}
          ListFooterComponent={
            <View style={{ backgroundColor: '#6b46c1', borderRadius: 25, marginTop: 32, marginHorizontal: 16, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 }}>
              <TouchableOpacity
                id="save-workout-button"
                style={{ 
                  backgroundColor: '#7c4ddb', 
                  paddingVertical: 18, 
                  paddingHorizontal: 32,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 22
                }}
                onPress={handleSaveWorkout}
                activeOpacity={0.85}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7c4ddb' }}>
                  <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "bold", letterSpacing: 1.2, textTransform: 'uppercase', backgroundColor: '#7c4ddb' }}>SAVE WORKOUT</Text>
                </View>
              </TouchableOpacity>
            </View>
          }
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 0
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "space-between"
  },
  contentContainer: {
    paddingBottom: 24,
    padding: 16
  },
  scrollButtonsContainer: {
    position: "absolute",
    right: 16,
    bottom: 100,
    zIndex: 100,
    flexDirection: "column",
    alignItems: "center"
  },
  scrollButton: {
    backgroundColor: "#6b46c1",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#171923",
    height: "100vh"
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: "#161616",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    marginBottom: 0
  },
  workoutNameInput: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#7c3aed",
    backgroundColor: "transparent"
  },
  exerciseList: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: "transparent",
    paddingBottom: 20
  },
  exerciseCard: {
    marginBottom: 24,
    position: "relative",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    paddingRight: 36,
    letterSpacing: 0.2,
    lineHeight: 24,
    marginBottom: 6
  },
  exerciseLabelText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    minWidth: 80,
    fontWeight: "500"
  },
  exerciseDesc: {
    color: "rgba(200, 210, 220, 0.85)",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    marginBottom: 0
  },
  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  configItem: {
    flex: 1,
    marginHorizontal: 4
  },
  label: {
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1
  },
  input: {
    backgroundColor: "#222222",
    borderRadius: 8,
    padding: 12,
    color: "#ffffff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#333333",
    textAlign: "center",
    marginVertical: 6,
    height: 48
  },
  picker: {
    minWidth: 120,
    color: "#ffffff",
    marginVertical: 6,
    backgroundColor: "#222222",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333333",
    height: 48
  },
  notesContainer: {
    marginTop: 12
  },
  notesInput: {
    backgroundColor: "#222222",
    borderRadius: 8,
    padding: 12,
    color: "#ffffff",
    height: 80,
    textAlignVertical: "top",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#333333",
    marginTop: 6
  },
  setCard: {
    marginVertical: 10,
    marginHorizontal: 2,
    padding: 16,
    backgroundColor: "#222222",
    borderRadius: 8,
    borderTopWidth: 3,
    borderTopColor: "#7c3aed"
  },
  setNumber: {
    color: "#a78bfa",
    fontWeight: "700",
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "transparent",
    letterSpacing: 0.3
  },
  addSetButton: {
    backgroundColor: "transparent",
    padding: 10,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    width: "auto",
    borderWidth: 1,
    borderColor: "#7c3aed",
    alignSelf: "center",
    paddingHorizontal: 20
  },
  addSetButtonText: {
    color: "#b794f4",
    fontWeight: "bold",
    fontSize: 14
  },
  setActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8
  },
  removeSetButton: {
    backgroundColor: "transparent",
    padding: 8,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 16,
    paddingHorizontal: 12,
    marginLeft: 8
  },
  removeSetButtonText: {
    color: "#888",
    fontSize: 12,
    fontWeight: "500"
  },
  removeExerciseButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#444"
  },
  addExerciseButton: {
    backgroundColor: "transparent",
    marginVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#7c3aed",
    borderStyle: "dashed"
  },
  addExerciseButtonText: {
    color: "#a78bfa",
    fontWeight: "600",
    fontSize: 16,
    backgroundColor: "transparent"
  },
  saveButton: {
    backgroundColor: "#6b46c1", // Primary purple color matching the app's theme
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 32,
    marginHorizontal: 16,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveIcon: {
    marginRight: 12,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ConfigureWorkoutScreen;
