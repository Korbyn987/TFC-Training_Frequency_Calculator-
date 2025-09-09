import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { supabase } from "../config/supabase";
import { getExercises, getMuscleGroups } from "../services/exerciseService";
import { getCurrentUser } from "../services/supabaseAuth";

const setTypes = [
  { label: "Warmup", value: "warmup" },
  { label: "Working Set", value: "numbered" },
  { label: "Failure", value: "failure" },
  { label: "Drop", value: "drop" }
];

// Helper function to get muscle group name from exercise data
const getMuscleGroupFromExercise = async (exerciseId) => {
  try {
    const exercisesResponse = await getExercises();
    if (!exercisesResponse.success) {
      console.error("Failed to fetch exercises:", exercisesResponse.error);
      return null;
    }

    const exercises = exercisesResponse.data;
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    if (exercise && exercise.muscle_group_id) {
      const muscleGroupsResponse = await getMuscleGroups();
      if (!muscleGroupsResponse.success) {
        console.error(
          "Failed to fetch muscle groups:",
          muscleGroupsResponse.error
        );
        return null;
      }

      const muscleGroups = muscleGroupsResponse.data;
      const muscleGroup = muscleGroups.find(
        (mg) => mg.id === exercise.muscle_group_id
      );
      return muscleGroup ? muscleGroup.name : null;
    }
    return null;
  } catch (error) {
    console.error("Error getting muscle group for exercise:", error);
    return null;
  }
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
    if (
      Array.isArray(safeExercises) &&
      safeExercises.length > 0 &&
      route.params?.fromPreset
    ) {
      console.log(
        "[ConfigureWorkoutScreen] Loading exercises from preset:",
        safeExercises.length
      );
      setExerciseConfigs(
        safeExercises.map((exercise) => ({
          ...exercise,
          sets:
            Array.isArray(exercise.sets) && exercise.sets.length > 0
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
        // Load from user metadata instead of storage
        try {
          const user = await getCurrentUser();
          if (user && user.user_metadata?.currentWorkout) {
            const workout = user.user_metadata.currentWorkout;
            setWorkoutName(workout.name || "");
            setExerciseConfigs(
              Array.isArray(workout.exercises) ? workout.exercises : []
            );
          }
        } catch (error) {
          console.error("Error loading saved workout:", error);
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
          // Load from user metadata instead of storage
          const user = await getCurrentUser();
          if (user && user.user_metadata?.currentWorkout) {
            const workout = user.user_metadata.currentWorkout;
            setExerciseConfigs(
              Array.isArray(workout.exercises) ? workout.exercises : []
            );

            if (workout.name) {
              setWorkoutName(workout.name);
            }

            // Mark as loaded to prevent duplicate loads
            setTempWorkoutLoaded(true);
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
      // Get current user for authentication
      const authUser = await getCurrentUser();
      if (!authUser || !authUser.id) {
        Alert.alert(
          "Authentication Required",
          "Please log in to save workouts."
        );
        return;
      }

      console.log(
        "Using user ID:",
        authUser.id,
        "for auth user:",
        authUser.auth_id
      );

      // Extract unique muscle groups from all exercises using Promise.all
      const muscleGroups = new Set();

      console.log("Saving workout with exercises:", exerciseConfigs);

      // Use Promise.all to properly await all async operations
      const muscleGroupPromises = exerciseConfigs.map(async (exercise) => {
        if (exercise.id) {
          const muscleGroup = await getMuscleGroupFromExercise(exercise.id);
          console.log(
            `Exercise ${exercise.name} (ID: ${exercise.id}) maps to muscle group:`,
            muscleGroup
          );
          return muscleGroup;
        }
        return null;
      });

      const muscleGroupResults = await Promise.all(muscleGroupPromises);

      // Add valid muscle groups to the set
      muscleGroupResults.forEach((muscleGroup) => {
        if (muscleGroup) {
          muscleGroups.add(muscleGroup);
        }
      });

      // Convert Set to array for storage
      const muscles = Array.from(muscleGroups);

      if (muscles.length === 0) {
        // Fallback in case we couldn't determine muscle groups
        console.warn("No muscle groups found for exercises, using default");
        muscles.push("Full Body");
      }

      console.log("Saving workout with muscle groups:", muscles);

      // Create the workout data with profile user ID
      const workoutData = {
        user_id: authUser.id, // Use user ID directly from getCurrentUser
        name: workoutName || "My Workout",
        description: `Workout with ${exerciseConfigs.length} exercises`,
        workout_type: "strength",
        started_at: new Date().toISOString(),
        notes: `Muscle groups: ${muscles.join(", ")}`,
        tags: muscles,
        is_public: true,
        allow_comments: true
      };

      console.log("Saving workout to Supabase:", workoutData);

      // Save to Supabase workouts table
      const { data, error } = await supabase
        .from("workouts")
        .insert([workoutData])
        .select();

      if (error) {
        console.error("Error saving workout to Supabase:", error);
        Alert.alert("Error", `Failed to save workout: ${error.message}`);
        return;
      }

      console.log("Workout saved successfully to Supabase:", data);

      // Save as active workout to local storage
      const activeWorkoutData = {
        supabase_id: data[0].id,
        name: workoutData.name,
        start_time: workoutData.started_at,
        notes: workoutData.notes,
        exercises: exerciseConfigs,
        muscle_groups: muscles
      };

      // Import and save to local storage
      const { saveActiveWorkout } = await import(
        "../services/localWorkoutStorage"
      );
      await saveActiveWorkout(activeWorkoutData);

      console.log("Saved as active workout:", activeWorkoutData);

      // Navigate to home screen
      try {
        navigation.reset({
          index: 0,
          routes: [
            { name: "Tabs", params: { screen: "Home", workoutJustSaved: true } }
          ]
        });
      } catch (navError) {
        console.error("Navigation error:", navError);
        // Fallback navigation
        navigation.navigate("Tabs", { screen: "Home", workoutJustSaved: true });
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
              // Save current exercises to user metadata before navigating
              const workoutData = {
                name: workoutName,
                exercises: exerciseConfigs
              };
              const user = await getCurrentUser();
              if (user) {
                user.user_metadata = {
                  ...user.user_metadata,
                  currentWorkout: workoutData
                };
              }

              // Create a list of exercise IDs to pass as previousExercises
              const currentExerciseIds = exerciseConfigs.map((ex) => ({
                id: ex.id,
                name: ex.name,
                description: ex.description || "",
                muscle_group_id: ex.muscle_group_id || ex.muscleGroupId
              }));

              // Navigate with the current exercises so they appear selected
              navigation.navigate("AddExercise", {
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
              // Save current exercises to user metadata before navigating
              const workoutData = {
                name: workoutName,
                exercises: exerciseConfigs
              };
              const user = await getCurrentUser();
              if (user) {
                user.user_metadata = {
                  ...user.user_metadata,
                  currentWorkout: workoutData
                };
              }
              navigation.navigate("SelectRoutine");
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
            <View
              style={{
                backgroundColor: "#6b46c1",
                borderRadius: 25,
                marginTop: 32,
                marginHorizontal: 16,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 8
              }}
            >
              <TouchableOpacity
                id="save-workout-button"
                style={{
                  backgroundColor: "#7c4ddb",
                  paddingVertical: 18,
                  paddingHorizontal: 32,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: 22
                }}
                onPress={handleSaveWorkout}
                activeOpacity={0.85}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#7c4ddb"
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 18,
                      fontWeight: "bold",
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      backgroundColor: "#7c4ddb"
                    }}
                  >
                    SAVE WORKOUT
                  </Text>
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
