import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useDispatch } from "react-redux";
import { MUSCLE_GROUPS } from "../constants/muscleGroups";
import { resetMuscleRecovery } from "../redux/workoutSlice";
import {
  addActiveExercise,
  addActiveSet,
  calculateWorkoutStats,
  clearActiveWorkout,
  getCompleteActiveWorkout,
  removeActiveExercise,
  removeActiveSet,
  updateActiveSet
} from "../services/localWorkoutStorage";

const ActiveWorkoutScreen = ({ navigation }) => {
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [sets, setSets] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [completing, setCompleting] = useState(false);
  const [filter, setFilter] = useState("All");
  const dispatch = useDispatch();

  useEffect(() => {
    loadWorkoutData();
    loadAvailableExercises();
  }, []);

  useEffect(() => {
    if (workout) {
      updateStats();
    }
  }, [exercises, sets]);

  const loadWorkoutData = async () => {
    try {
      const result = await getCompleteActiveWorkout();
      if (result.success && result.data.workout) {
        setWorkout(result.data.workout);
        setExercises(result.data.exercises || []);
        setSets(result.data.sets || {});
      } else {
        // No active workout, navigate back
        Alert.alert("No Active Workout", "No active workout found.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error("Error loading workout data:", error);
      Alert.alert("Error", "Failed to load workout data");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableExercises = async () => {
    try {
      const { getExercises } = await import("../services/supabaseWorkouts");
      const result = await getExercises();
      if (result.success) {
        setAvailableExercises(result.exercises);
      }
    } catch (error) {
      console.error("Error loading exercises:", error);
    }
  };

  const updateStats = async () => {
    try {
      const result = await calculateWorkoutStats();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const handleAddExercise = async (exercise) => {
    try {
      const result = await addActiveExercise({
        id: exercise.id,
        name: exercise.name,
        muscle_groups: exercise.muscle_groups
      });

      if (result.success) {
        setExercises(result.exercises);
        setShowAddExercise(false);
      }
    } catch (error) {
      console.error("Error adding exercise:", error);
      Alert.alert("Error", "Failed to add exercise");
    }
  };

  const handleRemoveExercise = async (exerciseId) => {
    Alert.alert(
      "Remove Exercise",
      "Are you sure you want to remove this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await removeActiveExercise(exerciseId);
              if (result.success) {
                setExercises(result.exercises);
                // Update sets state
                const updatedSets = { ...sets };
                delete updatedSets[exerciseId];
                setSets(updatedSets);
              }
            } catch (error) {
              console.error("Error removing exercise:", error);
              Alert.alert("Error", "Failed to remove exercise");
            }
          }
        }
      ]
    );
  };

  const handleAddSet = async (exerciseId) => {
    try {
      const exerciseSets = sets[exerciseId] || [];
      const newSet = {
        set_number: exerciseSets.length + 1,
        reps: "",
        weight: "",
        notes: ""
      };

      const result = await addActiveSet(exerciseId, newSet);
      if (result.success) {
        setSets(result.sets);
      }
    } catch (error) {
      console.error("Error adding set:", error);
      Alert.alert("Error", "Failed to add set");
    }
  };

  const handleUpdateSet = async (exerciseId, setIndex, field, value) => {
    try {
      const exerciseSets = sets[exerciseId] || [];
      const updatedSet = { ...exerciseSets[setIndex], [field]: value };

      const result = await updateActiveSet(exerciseId, setIndex, updatedSet);
      if (result.success) {
        setSets(result.sets);
      }
    } catch (error) {
      console.error("Error updating set:", error);
    }
  };

  const handleRemoveSet = async (exerciseId, setIndex) => {
    try {
      const result = await removeActiveSet(exerciseId, setIndex);
      if (result.success) {
        setSets(result.sets);
      }
    } catch (error) {
      console.error("Error removing set:", error);
      Alert.alert("Error", "Failed to remove set");
    }
  };

  const handleCompleteWorkout = async () => {
    if (exercises.length === 0) {
      Alert.alert(
        "No Exercises",
        "Add at least one exercise before completing the workout."
      );
      return;
    }

    setCompleting(true);
    try {
      // Calculate final stats
      const statsResult = await calculateWorkoutStats();
      if (!statsResult.success) {
        throw new Error("Failed to calculate workout stats");
      }

      // Extract muscle groups for recovery timer reset
      const muscleGroups = exercises
        .flatMap((ex) => ex.muscle_groups || [])
        .filter(
          (muscle, index, arr) =>
            muscle && muscle !== "Unknown" && arr.indexOf(muscle) === index
        );

      // Prepare completion data
      const completionPayload = {
        duration_minutes: statsResult.stats.workoutDuration,
        notes: workout.notes || "",
        muscle_groups: muscleGroups
      };

      // Complete workout in Supabase
      const { completeWorkout } = await import("../services/supabaseWorkouts");
      const result = await completeWorkout(
        workout.supabase_id,
        completionPayload
      );
      if (!result.success) {
        throw new Error(result.error || "Failed to complete workout");
      }

      // Reset muscle recovery timers in Redux
      if (muscleGroups.length > 0) {
        dispatch(resetMuscleRecovery({ muscleGroups }));
        console.log(
          "ActiveWorkoutScreen: Reset recovery timers for muscle groups:",
          muscleGroups
        );
      }

      // Save exercises and sets to Supabase
      const { addWorkoutExercise, addExerciseSet } = await import(
        "../services/supabaseWorkouts"
      );
      for (const exercise of exercises) {
        const exerciseResult = await addWorkoutExercise(workout.supabase_id, {
          exercise_id: exercise.id,
          order_index: exercises.indexOf(exercise)
        });

        if (exerciseResult.success) {
          const exerciseSets = sets[exercise.id] || [];
          for (const set of exerciseSets) {
            await addExerciseSet(exerciseResult.workoutExercise.id, set);
          }
        }
      }

      // Clear local workout data
      await clearActiveWorkout();

      Alert.alert(
        "Workout Completed!",
        `Great job! You completed ${exercises.length} exercises in ${statsResult.stats.workoutDuration} minutes.`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home")
          }
        ]
      );
    } catch (error) {
      console.error("Error completing workout:", error);
      Alert.alert("Error", "Failed to complete workout. Please try again.");
    } finally {
      setCompleting(false);
      setShowCompleteModal(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b46c1" />
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with stats */}
      <View style={styles.header}>
        <Text style={styles.workoutName}>
          {workout?.name || "Active Workout"}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.exercises || 0}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalSets || 0}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.workoutDuration || 0}m</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>
      </View>

      {/* Exercises list */}
      <ScrollView style={styles.exercisesList}>
        {exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveExercise(exercise.id)}
                style={styles.removeButton}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>

            {/* Sets for this exercise */}
            {(sets[exercise.id] || []).map((set, setIndex) => (
              <View key={setIndex} style={styles.setRow}>
                <Text style={styles.setNumber}>{setIndex + 1}</Text>
                <TextInput
                  style={styles.setInput}
                  placeholder="Reps"
                  placeholderTextColor="#666"
                  value={set.reps}
                  onChangeText={(value) =>
                    handleUpdateSet(exercise.id, setIndex, "reps", value)
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.setInput}
                  placeholder="Weight"
                  placeholderTextColor="#666"
                  value={set.weight}
                  onChangeText={(value) =>
                    handleUpdateSet(exercise.id, setIndex, "weight", value)
                  }
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  onPress={() => handleRemoveSet(exercise.id, setIndex)}
                  style={styles.removeSetButton}
                >
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add set button */}
            <TouchableOpacity
              onPress={() => handleAddSet(exercise.id)}
              style={styles.addSetButton}
            >
              <Ionicons name="add-circle-outline" size={20} color="#6b46c1" />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add exercise button */}
        <TouchableOpacity
          onPress={() => setShowAddExercise(true)}
          style={styles.addExerciseButton}
        >
          <Ionicons name="add-circle-outline" size={24} color="#6b46c1" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Complete workout button */}
      <TouchableOpacity
        onPress={() => setShowCompleteModal(true)}
        style={styles.completeButton}
        disabled={exercises.length === 0}
      >
        <Text style={styles.completeButtonText}>Complete Workout</Text>
      </TouchableOpacity>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddExercise}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddExercise(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Exercise</Text>
              <TouchableOpacity onPress={() => setShowAddExercise(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.filterContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filter === "All" && styles.activeFilter
                  ]}
                  onPress={() => setFilter("All")}
                >
                  <Text style={styles.filterText}>All</Text>
                </TouchableOpacity>
                {MUSCLE_GROUPS.map((group) => (
                  <TouchableOpacity
                    key={group}
                    style={[
                      styles.filterButton,
                      filter === group && styles.activeFilter
                    ]}
                    onPress={() => setFilter(group)}
                  >
                    <Text style={styles.filterText}>{group}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <ScrollView style={styles.exerciseList}>
              {availableExercises
                .filter((exercise) => {
                  if (filter === "All") return true;
                  const muscleGroupName = availableExercises.find(
                    (e) => e.id === exercise.id
                  )?.muscle_group_name;
                  return exercise.muscle_group === filter;
                })
                .map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    onPress={() => handleAddExercise(exercise)}
                    style={styles.exerciseOption}
                  >
                    <Text style={styles.exerciseOptionText}>
                      {exercise.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Complete Workout Modal */}
      <Modal
        visible={showCompleteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCompleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Workout?</Text>
            <Text style={styles.modalText}>
              You completed {exercises.length} exercises with{" "}
              {stats.totalSets || 0} total sets.
            </Text>
            <Text style={styles.modalText}>
              Workout duration: {stats.workoutDuration || 0} minutes
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowCompleteModal(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCompleteWorkout}
                style={[styles.modalButton, styles.confirmButton]}
                disabled={completing}
              >
                {completing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Complete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1c2e"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1c2e"
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16
  },
  header: {
    padding: 20,
    backgroundColor: "#23263a",
    borderBottomWidth: 1,
    borderBottomColor: "#333"
  },
  workoutName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  statItem: {
    alignItems: "center"
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b46c1"
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 2
  },
  exercisesList: {
    flex: 1,
    padding: 15
  },
  exerciseCard: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333"
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1
  },
  removeButton: {
    padding: 5
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8
  },
  setNumber: {
    width: 30,
    color: "#6b46c1",
    fontWeight: "bold",
    fontSize: 16
  },
  setInput: {
    flex: 1,
    backgroundColor: "#1a1c2e",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333"
  },
  removeSetButton: {
    padding: 5
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: "rgba(107, 70, 193, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6b46c1",
    borderStyle: "dashed"
  },
  addSetText: {
    color: "#6b46c1",
    marginLeft: 5,
    fontWeight: "500"
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(107, 70, 193, 0.1)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6b46c1",
    borderStyle: "dashed",
    marginBottom: 20
  },
  addExerciseText: {
    color: "#6b46c1",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600"
  },
  completeButton: {
    backgroundColor: "#6b46c1",
    margin: 15,
    padding: 18,
    borderRadius: 12,
    alignItems: "center"
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff"
  },
  exerciseList: {
    maxHeight: 400
  },
  exerciseOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333"
  },
  exerciseOptionText: {
    color: "#fff",
    fontSize: 16
  },
  modalText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center"
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5
  },
  cancelButton: {
    backgroundColor: "#333"
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600"
  },
  confirmButton: {
    backgroundColor: "#6b46c1"
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600"
  },
  filterContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333"
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#333",
    marginHorizontal: 5
  },
  activeFilter: {
    backgroundColor: "#6b46c1"
  },
  filterText: {
    color: "#fff",
    fontWeight: "600"
  }
});

export default ActiveWorkoutScreen;
