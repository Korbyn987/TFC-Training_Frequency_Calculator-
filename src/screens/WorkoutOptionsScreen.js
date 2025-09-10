import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { getCurrentUser } from "../services/supabaseAuth";
import {
  addExerciseSet,
  addWorkoutExercise,
  completeWorkout,
  createWorkout
} from "../services/supabaseWorkouts";

const { width } = Dimensions.get("window");

const WorkoutOptionsScreen = ({ navigation, route }) => {
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState("");
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [workoutId, setWorkoutId] = useState(null);

  useEffect(() => {
    loadUser();

    // Handle exercises from AddExercise screen
    if (route.params?.selectedExercises && route.params?.fromAddExercise) {
      const exercisesWithDefaults = route.params.selectedExercises.map(
        (exercise) => ({
          ...exercise,
          sets: [
            {
              id: 1,
              reps: 10,
              weight: 0,
              set_type: "working",
              completed: false
            },
            {
              id: 2,
              reps: 10,
              weight: 0,
              set_type: "working",
              completed: false
            },
            {
              id: 3,
              reps: 10,
              weight: 0,
              set_type: "working",
              completed: false
            }
          ],
          rest_seconds: exercise.rest_seconds || 60
        })
      );

      setSelectedExercises(exercisesWithDefaults);
      setWorkoutName(`Custom Workout ${new Date().toLocaleDateString()}`);

      // Clear params to prevent re-processing
      navigation.setParams({
        selectedExercises: undefined,
        fromAddExercise: undefined
      });
    }

    if (route.params?.workoutId && route.params?.editMode) {
      setEditMode(true);
      setWorkoutId(route.params.workoutId);
    }

    if (route.params?.fromActiveWorkout) {
      setEditMode(true);
      loadWorkoutFromStorage();
    }
  }, [route.params]);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadWorkoutFromStorage = async () => {
    try {
      const storedWorkout = await AsyncStorage.getItem("activeWorkout");
      if (storedWorkout) {
        const workoutData = JSON.parse(storedWorkout);
        setSelectedExercises(workoutData.exercises);
        setWorkoutName(workoutData.name);
      }
    } catch (error) {
      console.error("Error loading workout from storage:", error);
    }
  };

  const updateExerciseParameter = (exerciseId, parameter, value) => {
    setSelectedExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, [parameter]: value }
          : exercise
      )
    );
  };

  const updateSetParameter = (exerciseId, setId, parameter, value) => {
    setSelectedExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: (exercise.sets || []).map((set) =>
                set.id === setId ? { ...set, [parameter]: value } : set
              )
            }
          : exercise
      )
    );
  };

  const addSet = (exerciseId) => {
    setSelectedExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: [
                ...(exercise.sets || []),
                {
                  id: (exercise.sets || []).length + 1,
                  reps:
                    (exercise.sets || [])[exercise.sets?.length - 1]?.reps ||
                    10,
                  weight:
                    (exercise.sets || [])[exercise.sets?.length - 1]?.weight ||
                    0,
                  set_type: "working",
                  completed: false
                }
              ]
            }
          : exercise
      )
    );
  };

  const removeSet = (exerciseId, setId) => {
    setSelectedExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: (exercise.sets || [])
                .filter((set) => set.id !== setId)
                .map((set, index) => ({
                  ...set,
                  id: index + 1
                }))
            }
          : exercise
      )
    );
  };

  const removeExercise = (exerciseId) => {
    Alert.alert(
      "Remove Exercise",
      "Are you sure you want to remove this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setSelectedExercises((prev) =>
              prev.filter((e) => e.id !== exerciseId)
            );
          }
        }
      ]
    );
  };

  const duplicateExercise = (exercise) => {
    const newExercise = {
      ...exercise,
      id: `${exercise.id}_copy_${Date.now()}`,
      sets: (exercise.sets || []).map((set, index) => ({
        ...set,
        id: index + 1,
        completed: false
      }))
    };
    setSelectedExercises((prev) => [...prev, newExercise]);
  };

  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert("Error", "Please enter a workout name");
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert("Error", "Please select at least one exercise");
      return;
    }

    if (!user) {
      Alert.alert("Error", "User not found");
      return;
    }

    try {
      setSaving(true);

      if (editMode) {
        // End workout - save to Supabase and clear AsyncStorage
        console.log("Ending workout - saving to Supabase");
        const workoutData = {
          name: workoutName.trim(),
          notes: `Workout with ${selectedExercises.length} exercises`
        };

        const result = await createWorkout(workoutData);

        if (!result.success) {
          throw new Error(result.error);
        }

        const newWorkoutId = result.workout.id;

        // Save individual exercises with their sets
        for (let i = 0; i < selectedExercises.length; i++) {
          const exercise = selectedExercises[i];

          const exerciseResult = await addWorkoutExercise(newWorkoutId, {
            exercise_id: exercise.id,
            exercise_name: exercise.name,
            muscle_group:
              exercise.target_muscle || exercise.muscle_group || "Unknown",
            order_index: i,
            target_sets: exercise.sets.length
          });

          if (!exerciseResult.success) {
            console.error("Error adding exercise:", exerciseResult.error);
            continue;
          }

          const workoutExerciseId = exerciseResult.workoutExercise.id;

          // Add sets for this exercise
          for (let j = 0; j < exercise.sets.length; j++) {
            const set = exercise.sets[j];

            await addExerciseSet(workoutExerciseId, {
              set_number: j + 1,
              set_type: set.set_type,
              reps: set.reps,
              weight: set.weight
            });
          }
        }

        // Complete the workout
        await completeWorkout(newWorkoutId, {
          duration_minutes: Math.floor((new Date() - new Date()) / (1000 * 60)),
          notes: "Workout completed"
        });

        // Clear AsyncStorage
        await AsyncStorage.removeItem("activeWorkout");
        console.log("Cleared AsyncStorage after workout completion");

        Alert.alert("Success", "Workout completed successfully!", [
          {
            text: "View Profile",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Tabs", params: { screen: "Profile" } }]
              });
            }
          }
        ]);
      } else {
        // Save new workout to AsyncStorage
        console.log("Saving new workout to AsyncStorage");
        const workoutData = {
          name: workoutName.trim(),
          exercises: selectedExercises,
          started_at: new Date().toISOString()
        };

        await AsyncStorage.setItem(
          "activeWorkout",
          JSON.stringify(workoutData)
        );
        console.log("Workout saved to AsyncStorage:", workoutData);

        Alert.alert("Success", "Workout saved successfully!", [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to home screen (Tabs)
              navigation.reset({
                index: 0,
                routes: [{ name: "Tabs" }]
              });
            }
          }
        ]);
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert("Error", "Failed to save workout. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // If no exercises selected, show original options
  if (selectedExercises.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="fitness-outline" size={80} color="#666" />
          <Text style={styles.emptyTitle}>Ready to Build Your Workout?</Text>
          <Text style={styles.emptySubtitle}>
            Choose how you'd like to get started
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => navigation.navigate("AddExercise")}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="add-circle" size={32} color="#4CAF50" />
            </View>
            <Text style={styles.optionButtonText}>Add Exercise</Text>
            <Text style={styles.optionButtonSubText}>
              Create a custom workout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => navigation.navigate("SelectRoutine")}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="list-circle" size={32} color="#4CAF50" />
            </View>
            <Text style={styles.optionButtonText}>Select Routine</Text>
            <Text style={styles.optionButtonSubText}>
              Choose from saved routines
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show exercise configuration UI
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Configure Workout</Text>
          <Text style={styles.subtitle}>
            {selectedExercises.length} exercises •{" "}
            {selectedExercises.reduce((total, ex) => total + ex.sets.length, 0)}{" "}
            sets
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => navigation.navigate("AddExercise")}
        >
          <Ionicons name="add" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.workoutNameCard}>
        <Text style={styles.inputLabel}>Workout Name</Text>
        <TextInput
          style={styles.nameInput}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Enter workout name"
          placeholderTextColor="#666"
        />
      </View>

      <ScrollView
        style={styles.exercisesList}
        showsVerticalScrollIndicator={false}
      >
        {selectedExercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseTarget}>
                  {exercise.target_muscle || exercise.muscle_group}
                </Text>
              </View>
              <View style={styles.exerciseActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => duplicateExercise(exercise)}
                >
                  <Ionicons name="copy" size={18} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => removeExercise(exercise.id)}
                >
                  <Ionicons name="trash" size={18} color="#FF6B6B" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    setExpandedExercise(
                      expandedExercise === exercise.id ? null : exercise.id
                    )
                  }
                >
                  <Ionicons
                    name={
                      expandedExercise === exercise.id
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={18}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.setsContainer}>
              <View style={styles.setsHeader}>
                <Text style={styles.setsTitle}>
                  Sets ({exercise.sets.length})
                </Text>
                <TouchableOpacity
                  style={styles.addSetButton}
                  onPress={() => addSet(exercise.id)}
                >
                  <Ionicons name="add" size={16} color="#4CAF50" />
                  <Text style={styles.addSetText}>Add Set</Text>
                </TouchableOpacity>
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={set.id} style={styles.setRow}>
                  <View style={styles.setNumber}>
                    <Text style={styles.setNumberText}>{setIndex + 1}</Text>
                  </View>

                  <View style={styles.setInputs}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Reps</Text>
                      <TextInput
                        style={styles.setInput}
                        value={set.reps?.toString()}
                        onChangeText={(value) =>
                          updateSetParameter(
                            exercise.id,
                            set.id,
                            "reps",
                            parseInt(value) || 0
                          )
                        }
                        keyboardType="numeric"
                        placeholder="10"
                        placeholderTextColor="#666"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Weight</Text>
                      <TextInput
                        style={styles.setInput}
                        value={set.weight?.toString()}
                        onChangeText={(value) =>
                          updateSetParameter(
                            exercise.id,
                            set.id,
                            "weight",
                            parseFloat(value) || 0
                          )
                        }
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Type</Text>
                      <TouchableOpacity
                        style={[
                          styles.setTypeButton,
                          styles[
                            `setType${
                              set.set_type.charAt(0).toUpperCase() +
                              set.set_type.slice(1)
                            }`
                          ]
                        ]}
                        onPress={() => {
                          const types = [
                            "working",
                            "warmup",
                            "failure",
                            "drop"
                          ];
                          const currentIndex = types.indexOf(set.set_type);
                          const nextType =
                            types[(currentIndex + 1) % types.length];
                          updateSetParameter(
                            exercise.id,
                            set.id,
                            "set_type",
                            nextType
                          );
                        }}
                      >
                        <Text style={styles.setTypeText}>
                          {set.set_type.charAt(0).toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {exercise.sets.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeSetButton}
                      onPress={() => removeSet(exercise.id, set.id)}
                    >
                      <Ionicons name="close" size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {expandedExercise === exercise.id && (
              <View style={styles.expandedConfig}>
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>Rest Between Sets</Text>
                  <View style={styles.restControls}>
                    <TouchableOpacity
                      onPress={() =>
                        updateExerciseParameter(
                          exercise.id,
                          "rest_seconds",
                          Math.max(30, exercise.rest_seconds - 15)
                        )
                      }
                    >
                      <Ionicons name="remove" size={20} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.restValue}>
                      {exercise.rest_seconds}s
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateExerciseParameter(
                          exercise.id,
                          "rest_seconds",
                          exercise.rest_seconds + 15
                        )
                      }
                    >
                      <Ionicons name="add" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveWorkout}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Save Workout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171923",
    padding: 20,
    justifyContent: "center"
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    height: width * 0.6,
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#A0AEC0"
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  optionButton: {
    backgroundColor: "#2D3748",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 10
  },
  optionIcon: {
    marginBottom: 10
  },
  optionButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5
  },
  optionButtonSubText: {
    fontSize: 14,
    color: "#A0AEC0"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff"
  },
  subtitle: {
    fontSize: 16,
    color: "#A0AEC0"
  },
  addExerciseButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  workoutNameCard: {
    backgroundColor: "#2D3748",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 16,
    color: "#A0AEC0",
    marginBottom: 5
  },
  nameInput: {
    fontSize: 20,
    color: "#fff",
    backgroundColor: "#2D3748",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10
  },
  exercisesList: {
    flex: 1
  },
  exerciseCard: {
    backgroundColor: "#2D3748",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  exerciseInfo: {
    flex: 1
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff"
  },
  exerciseTarget: {
    fontSize: 16,
    color: "#A0AEC0"
  },
  exerciseActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  actionButton: {
    marginLeft: 10
  },
  setsContainer: {
    padding: 20
  },
  setsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  setsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff"
  },
  addSetButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  addSetText: {
    fontSize: 16,
    color: "#4CAF50",
    marginLeft: 5
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  setNumber: {
    width: 30,
    alignItems: "center"
  },
  setNumberText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff"
  },
  setInputs: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  inputGroup: {
    flex: 1,
    marginRight: 20
  },
  setInput: {
    fontSize: 18,
    color: "#fff",
    backgroundColor: "#2D3748",
    padding: 5,
    borderRadius: 5,
    width: 50
  },
  setTypeButton: {
    backgroundColor: "#2D3748",
    padding: 5,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  setTypeWorking: {
    backgroundColor: "#4CAF50"
  },
  setTypeWarmup: {
    backgroundColor: "#03A9F4"
  },
  setTypeFailure: {
    backgroundColor: "#FF6B6B"
  },
  setTypeDrop: {
    backgroundColor: "#666"
  },
  setTypeText: {
    fontSize: 16,
    color: "#fff"
  },
  removeSetButton: {
    justifyContent: "center",
    alignItems: "center"
  },
  expandedConfig: {
    padding: 20
  },
  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  configLabel: {
    fontSize: 16,
    color: "#A0AEC0"
  },
  restControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  restValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginHorizontal: 10
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  saveButtonDisabled: {
    backgroundColor: "#666"
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 10
  }
});

export default WorkoutOptionsScreen;
