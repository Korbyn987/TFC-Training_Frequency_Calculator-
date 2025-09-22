import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import ExerciseDetailModal from "../components/ExerciseDetailModal";
import MuscleGroupSelectionModal from "../components/MuscleGroupSelectionModal";
import { MUSCLE_GROUPS } from "../constants/muscleGroups";
import { useTabData } from "../context/TabDataContext";

const { width } = Dimensions.get("window");

const ConfigureWorkoutScreen = ({ navigation, route }) => {
  const { refreshTabData, saveWorkout } = useTabData();
  const editingWorkout = route?.params?.editingWorkout;
  const presetData = route?.params;

  const [user, setUser] = useState(null);
  const [workoutName, setWorkoutName] = useState("");
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMuscleGroupModal, setShowMuscleGroupModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] =
    useState(null);

  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    try {
      setLoading(true);
      const { getCurrentUser } = await import("../services/supabaseAuth");
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        navigation.navigate("Login");
        return;
      }

      setUser(currentUser);

      // Handle preset workout data
      if (presetData?.preset) {
        setWorkoutName(presetData.workoutName || "");
        setSelectedMuscleGroups(presetData.muscleGroups || []);

        // Convert preset exercises to the format expected by the screen
        const formattedExercises =
          presetData.exercises?.map((exercise, index) => ({
            id: `preset_${index}`, // Temporary ID for preset exercises
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight || 0,
            muscle_group: presetData.muscleGroups?.[0] || "Unknown",
            set_type: "working"
          })) || [];

        setSelectedExercises(formattedExercises);
        setCurrentStep(3); // Skip to review step for presets

        // Load exercises for the preset muscle groups
        if (presetData.muscleGroups?.length > 0) {
          await loadExercisesForMuscleGroups(presetData.muscleGroups);
        }
      } else if (editingWorkout) {
        setWorkoutName(editingWorkout.name || "");
        setSelectedMuscleGroups(editingWorkout.muscle_groups || []);

        // Transform exercises to handle different data formats
        const transformedExercises = (editingWorkout.exercises || []).map(
          (exercise) => {
            const newExercise = { ...exercise };

            // This logic robustly handles all data formats (new, old, or malformed)
            // to ensure `newExercise.sets` is always a valid array.

            // Case 1: `sets` is a valid, non-empty array (from the new data model)
            if (
              Array.isArray(newExercise.sets) &&
              newExercise.sets.length > 0
            ) {
              newExercise.sets = newExercise.sets
                .filter((s) => s) // Filter out any null/undefined sets
                .map((set) => ({
                  ...set,
                  id: `set_${Date.now()}_${Math.random()}`,
                  reps: set.reps || 10,
                  weight:
                    set.weight_kg !== undefined
                      ? set.weight_kg
                      : set.weight || 0,
                  set_type: set.set_type || "working",
                  notes: set.notes || ""
                }));
            }
            // Case 2: `sets` is not a valid array (from the old data model or is missing)
            else {
              const setCount =
                typeof newExercise.sets === "number" ? newExercise.sets : 3;
              const baseReps = newExercise.reps || 10;
              const baseWeight = newExercise.weight || 0;

              newExercise.sets = Array.from({ length: setCount }, (_, i) => ({
                id: `set_${Date.now()}_${Math.random()}`,
                set_number: i + 1,
                reps: baseReps,
                weight: baseWeight,
                set_type: "working",
                notes: ""
              }));
            }

            // Clean up old top-level properties to prevent data conflicts
            delete newExercise.reps;
            delete newExercise.weight;

            return newExercise;
          }
        );

        setSelectedExercises(transformedExercises);
        setCurrentStep(3);
      } else if (presetData?.fromAddExercise && presetData?.exercises) {
        // Handle exercises coming from AddExerciseScreen
        setWorkoutName(
          presetData.workoutName ||
            `Custom Workout ${new Date().toLocaleDateString()}`
        );

        // Extract muscle groups from the selected exercises
        const muscleGroups = [
          ...new Set(
            presetData.exercises
              .map(
                (exercise) =>
                  exercise.muscle_groups?.name ||
                  exercise.muscle_group ||
                  "Unknown"
              )
              .filter((group) => group !== "Unknown")
          )
        ];

        setSelectedMuscleGroups(muscleGroups);

        // Format exercises for the configure screen
        const formattedExercises = presetData.exercises.map((exercise) => ({
          ...exercise,
          sets: Array.from({ length: 3 }, (_, i) => ({
            id: `set_${Date.now()}_${Math.random()}`,
            reps: 10,
            weight: 0,
            set_type: "working",
            notes: ""
          }))
        }));

        setSelectedExercises(formattedExercises);

        // Load available exercises for the muscle groups
        if (muscleGroups.length > 0) {
          await loadExercisesForMuscleGroups(muscleGroups);
        }

        // Go directly to review step since exercises are already selected
        setCurrentStep(3);
      } else {
        // Generate default workout name
        const { getUserWorkoutHistory } = await import(
          "../services/supabaseWorkouts"
        );
        const result = await getUserWorkoutHistory(currentUser.id);
        const workoutCount = result.data?.length || []; // Fix: Use correct property name
        setWorkoutName(`Workout ${(workoutCount?.length || 0) + 1}`);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const loadExercisesForMuscleGroups = async (muscleGroups) => {
    try {
      const { getExercisesByMuscleGroup } = await import(
        "../services/exerciseService"
      );
      const exercises = [];
      for (const muscleGroup of muscleGroups) {
        const groupExercises = await getExercisesByMuscleGroup(muscleGroup);
        exercises.push(...groupExercises);
      }

      // Remove duplicates
      const uniqueExercises = exercises.filter(
        (exercise, index, self) =>
          index === self.findIndex((e) => e.id === exercise.id)
      );

      setAvailableExercises(uniqueExercises);
    } catch (error) {
      console.error("Error loading exercises:", error);
      Alert.alert("Error", "Failed to load exercises");
    }
  };

  const handleMuscleGroupSelection = (muscleGroups) => {
    setSelectedMuscleGroups(muscleGroups);
    setShowMuscleGroupModal(false);

    if (muscleGroups.length > 0) {
      loadExercisesForMuscleGroups(muscleGroups);
      setCurrentStep(2);
    } else {
      setAvailableExercises([]);
      setSelectedExercises([]);
    }
  };

  const toggleExerciseSelection = (exercise) => {
    setSelectedExercises((prev) => {
      const isSelected = prev.find((e) => e.id === exercise.id);
      if (isSelected) {
        return prev.filter((e) => e.id !== exercise.id);
      } else {
        return [
          ...prev,
          {
            ...exercise,
            sets: Array.from({ length: 3 }, (_, i) => ({
              id: `set_${Date.now()}_${Math.random()}`,
              reps: 10,
              weight: 0,
              set_type: "working",
              notes: ""
            }))
          }
        ];
      }
    });
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

  const removeExercise = (exerciseId) => {
    setSelectedExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const duplicateExercise = (exercise) => {
    const duplicatedExercise = {
      ...exercise,
      id: `${exercise.id}_copy_${Date.now()}`,
      sets: Array.isArray(exercise.sets)
        ? exercise.sets.map((set, index) => ({
            ...set,
            id: `${exercise.id}_copy_${Date.now()}_set_${index}`
          }))
        : []
    };
    setSelectedExercises((prev) => [...prev, duplicatedExercise]);
  };

  const addSet = (exerciseId) => {
    setSelectedExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: Array.isArray(exercise.sets)
                ? [
                    ...exercise.sets,
                    {
                      id: `${exercise.id}_set_${Date.now()}`,
                      reps: 10,
                      weight: 0,
                      set_type: "working",
                      notes: ""
                    }
                  ]
                : []
            }
          : exercise
      )
    );
  };

  const updateSet = (exerciseId, setId, parameter, value) => {
    setSelectedExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: Array.isArray(exercise.sets)
                ? exercise.sets.map((set) =>
                    set.id === setId ? { ...set, [parameter]: value } : set
                  )
                : []
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
              sets: Array.isArray(exercise.sets)
                ? exercise.sets.filter((set) => set.id !== setId)
                : []
            }
          : exercise
      )
    );
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

    try {
      setSaving(true);

      // Transform the local state into the structure the backend expects
      const formattedExercises = selectedExercises.map((exercise) => {
        return {
          ...exercise,
          // Ensure the sets are formatted correctly for the backend
          sets: Array.isArray(exercise.sets)
            ? exercise.sets.map((set, index) => ({
                set_number: index + 1, // Ensure correct numbering
                reps: set.reps,
                weight_kg: set.weight,
                set_type: set.set_type,
                notes: set.notes
              }))
            : []
        };
      });

      console.log("Saving workout with exercises:", formattedExercises);

      const workoutData = {
        user_id: user.id,
        name: workoutName.trim(),
        muscle_groups: selectedMuscleGroups,
        exercises: formattedExercises, // Use the correctly formatted exercises
        status: "active"
      };

      // Call the context function to save the workout
      const result = await saveWorkout(workoutData);

      if (result.success) {
        // Refresh data before showing success alert
        await refreshTabData();

        Alert.alert(
          "Success",
          `Workout ${editingWorkout ? "updated" : "created"} successfully!`,
          [
            {
              text: "Start Workout",
              onPress: () =>
                navigation.navigate("WorkoutOptions", {
                  workoutId: result.workout.id,
                  workoutName: workoutName,
                  startWorkout: true
                })
            },
            {
              text: "Back to Home",
              onPress: () =>
                navigation.navigate("Tabs", {
                  screen: "Home",
                  params: { workoutJustSaved: true }
                })
            }
          ]
        );
      } else {
        throw new Error(result.error || "Failed to save workout.");
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert("Error", `Failed to save workout: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View style={[styles.step, currentStep >= 1 && styles.stepActive]}>
          <Text
            style={[styles.stepText, currentStep >= 1 && styles.stepTextActive]}
          >
            1
          </Text>
        </View>
        <View
          style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]}
        />
        <View style={[styles.step, currentStep >= 2 && styles.stepActive]}>
          <Text
            style={[styles.stepText, currentStep >= 2 && styles.stepTextActive]}
          >
            2
          </Text>
        </View>
        <View
          style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]}
        />
        <View style={[styles.step, currentStep >= 3 && styles.stepActive]}>
          <Text
            style={[styles.stepText, currentStep >= 3 && styles.stepTextActive]}
          >
            3
          </Text>
        </View>
      </View>
      <View style={styles.stepLabels}>
        <Text style={styles.stepLabel}>Setup</Text>
        <Text style={styles.stepLabel}>Exercises</Text>
        <Text style={styles.stepLabel}>Review</Text>
      </View>
    </View>
  );

  const renderWorkoutSetup = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Workout Setup</Text>
      <Text style={styles.stepSubtitle}>
        Name your workout and select target muscle groups
      </Text>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Workout Name</Text>
        <TextInput
          style={styles.nameInput}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Enter workout name"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Target Muscle Groups</Text>
        <TouchableOpacity
          style={styles.muscleGroupSelector}
          onPress={() => setShowMuscleGroupModal(true)}
        >
          <View style={styles.muscleGroupContent}>
            <Ionicons name="body" size={24} color="#4CAF50" />
            <Text style={styles.muscleGroupText}>
              {selectedMuscleGroups.length > 0
                ? `${selectedMuscleGroups.length} groups selected`
                : "Select muscle groups"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        {selectedMuscleGroups.length > 0 && (
          <View style={styles.selectedMuscleGroups}>
            {selectedMuscleGroups.map((group) => (
              <View key={group} style={styles.muscleGroupChip}>
                <Text style={styles.muscleGroupChipText}>{group}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {selectedMuscleGroups.length > 0 && (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => setCurrentStep(2)}
        >
          <Text style={styles.nextButtonText}>Continue to Exercises</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderExerciseSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Exercises</Text>
      <Text style={styles.stepSubtitle}>Choose exercises for your workout</Text>

      <View style={styles.exerciseGrid}>
        {availableExercises.map((exercise) => {
          const isSelected = selectedExercises.find(
            (e) => e.id === exercise.id
          );
          return (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseCard,
                isSelected && styles.exerciseCardSelected
              ]}
              onPress={() => toggleExerciseSelection(exercise)}
            >
              <View style={styles.exerciseCardHeader}>
                <View style={styles.exerciseIcon}>
                  <Ionicons
                    name="fitness"
                    size={20}
                    color={isSelected ? "#4CAF50" : "#666"}
                  />
                </View>
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                  size={24}
                  color={isSelected ? "#4CAF50" : "#666"}
                />
              </View>
              <Text
                style={[
                  styles.exerciseCardName,
                  isSelected && styles.exerciseCardNameSelected
                ]}
              >
                {exercise.name}
              </Text>
              <Text style={styles.exerciseCardTarget}>
                {exercise.target_muscle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedExercises.length > 0 && (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => setCurrentStep(3)}
        >
          <Text style={styles.nextButtonText}>
            Review Workout ({selectedExercises.length})
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderWorkoutReview = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review & Configure</Text>
      <Text style={styles.stepSubtitle}>Fine-tune your workout settings</Text>

      <View style={styles.workoutSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Workout:</Text>
          <Text style={styles.summaryValue}>{workoutName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Exercises:</Text>
          <Text style={styles.summaryValue}>{selectedExercises.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Muscle Groups:</Text>
          <Text style={styles.summaryValue}>
            {selectedMuscleGroups.join(", ")}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.exerciseList}
        showsVerticalScrollIndicator={false}
      >
        {selectedExercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.exerciseReviewCard}
            onPress={() => setSelectedExerciseForDetail(exercise)}
          >
            <View style={styles.exerciseReviewHeader}>
              <View style={styles.exerciseReviewInfo}>
                <Text style={styles.exerciseReviewName}>{exercise.name}</Text>
                <Text style={styles.exerciseReviewTarget}>
                  {exercise.target_muscle}
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
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(2)}
        >
          <Ionicons name="arrow-back" size={20} color="#4CAF50" />
          <Text style={styles.backButtonText}>Add More Exercises</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveWorkout}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {editingWorkout ? "Update Workout" : "Save & Start"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {renderStepIndicator()}

      <View style={styles.content}>
        {currentStep === 1 && renderWorkoutSetup()}
        {currentStep === 2 && renderExerciseSelection()}
        {currentStep === 3 && renderWorkoutReview()}
      </View>

      <MuscleGroupSelectionModal
        visible={showMuscleGroupModal}
        muscleGroups={MUSCLE_GROUPS}
        selectedGroups={selectedMuscleGroups}
        onSelect={handleMuscleGroupSelection}
        onClose={() => setShowMuscleGroupModal(false)}
      />

      <ExerciseDetailModal
        visible={!!selectedExerciseForDetail}
        exercise={selectedExerciseForDetail}
        onClose={() => setSelectedExerciseForDetail(null)}
        onUpdateSet={updateSet}
        onAddSet={addSet}
        onRemoveSet={removeSet}
      />
    </SafeAreaView>
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
  stepIndicator: {
    height: 60,
    backgroundColor: "#23263a",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20
  },
  stepContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1
  },
  step: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#666",
    justifyContent: "center",
    alignItems: "center"
  },
  stepActive: {
    backgroundColor: "#4CAF50"
  },
  stepText: {
    fontSize: 12,
    color: "#666"
  },
  stepTextActive: {
    color: "#fff"
  },
  stepLine: {
    height: 2,
    backgroundColor: "#666",
    flex: 1,
    marginHorizontal: 10
  },
  stepLineActive: {
    backgroundColor: "#4CAF50"
  },
  stepLabels: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20
  },
  stepLabel: {
    fontSize: 12,
    color: "#666"
  },
  content: {
    flex: 1,
    backgroundColor: "#1a1c2e",
    paddingHorizontal: 20
  },
  stepContent: {
    paddingVertical: 20
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20
  },
  inputCard: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10
  },
  nameInput: {
    backgroundColor: "#1a1c2e",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#fff",
    textAlign: "left"
  },
  muscleGroupSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10
  },
  muscleGroupContent: {
    flexDirection: "row",
    alignItems: "center"
  },
  muscleGroupText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 10
  },
  selectedMuscleGroups: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10
  },
  muscleGroupChip: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4
  },
  muscleGroupChipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold"
  },
  nextButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
  },
  nextButtonText: {
    fontSize: 16,
    color: "#fff",
    marginRight: 10
  },
  exerciseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  exerciseCard: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 15,
    width: (width - 40) / 2,
    marginBottom: 20
  },
  exerciseCardSelected: {
    borderWidth: 2,
    borderColor: "#4CAF50"
  },
  exerciseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  exerciseIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center"
  },
  exerciseCardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff"
  },
  exerciseCardNameSelected: {
    color: "#4CAF50"
  },
  exerciseCardTarget: {
    fontSize: 14,
    color: "#666"
  },
  workoutSummary: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666"
  },
  summaryValue: {
    fontSize: 16,
    color: "#fff"
  },
  exerciseList: {
    marginBottom: 20
  },
  exerciseReviewCard: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10
  },
  exerciseReviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  exerciseReviewInfo: {
    flex: 1
  },
  exerciseReviewName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff"
  },
  exerciseReviewTarget: {
    fontSize: 14,
    color: "#666"
  },
  exerciseActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  actionButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10
  },
  exerciseConfig: {
    backgroundColor: "#1a1c2e",
    borderRadius: 12,
    padding: 15,
    marginTop: 10
  },
  setConfig: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
    position: "relative"
  },
  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  configItem: {
    flex: 1,
    marginHorizontal: 5
  },
  configItemFullWidth: {
    flex: 1
  },
  configLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
    textTransform: "uppercase"
  },
  configInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1c2e",
    borderRadius: 8,
    padding: 5
  },
  configValue: {
    fontSize: 16,
    color: "#fff",
    marginHorizontal: 15,
    fontWeight: "600"
  },
  weightInput: {
    backgroundColor: "#1a1c2e",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    flex: 1
  },
  notesInput: {
    backgroundColor: "#1a1c2e",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#fff",
    textAlign: "left",
    height: 50,
    width: "100%"
  },
  setTypeSection: {
    marginTop: 10,
    marginBottom: 10
  },
  setTypeButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5
  },
  setTypeButton: {
    backgroundColor: "#23263a",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#444"
  },
  setTypeButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50"
  },
  setTypeButtonText: {
    fontSize: 12,
    color: "#ccc",
    fontWeight: "600",
    textTransform: "capitalize"
  },
  setTypeButtonTextActive: {
    color: "#fff"
  },
  removeSetButton: {
    position: "absolute",
    top: 10,
    right: 10
  },
  addSetButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
  },
  addSetButtonText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 10
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  backButton: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  backButtonText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 10
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 10
  }
});

export default ConfigureWorkoutScreen;
