import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { MUSCLE_GROUPS } from "../constants/muscleGroups";
import { styles } from "../styles/workoutSelectionModalStyles";

const WorkoutSelectionModal = ({
  visible,
  onClose,
  onMuscleSelect,
  selectedMuscles,
  startWorkout,
  workoutTimer,
  endWorkout,
}) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return null;
  }

  const isWorkoutInProgress = selectedMuscles.length > 0;

  const clearMuscle = (muscle) => {
    const newMuscles = selectedMuscles.filter((m) => m !== muscle);
    onMuscleSelect(newMuscles);
  };

  const clearAllMuscles = () => {
    onMuscleSelect([]);
  };

  const handleMuscleSelect = (muscle) => {
    const newMuscles = selectedMuscles.includes(muscle)
      ? selectedMuscles.filter((m) => m !== muscle)
      : [...selectedMuscles, muscle];
    onMuscleSelect(newMuscles);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isWorkoutInProgress
                ? "Workout In Progress"
                : "Select Muscles for Workout"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b46c1" />
            </TouchableOpacity>
          </View>

          {isWorkoutInProgress ? (
            <View style={styles.workoutInProgressContainer}>
              <Text style={styles.workoutTimer}>{workoutTimer}</Text>
              <View style={styles.selectedMusclesContainer}>
                <Text style={styles.selectedMusclesTitle}>
                  Muscles Being Trained:
                </Text>
                <View style={styles.selectedMusclesList}>
                  {selectedMuscles.map((muscle, index) => (
                    <View key={index} style={styles.selectedMuscleChip}>
                      <Text style={styles.chipText}>{muscle}</Text>
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => clearMuscle(muscle)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color="#dc3545"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.clearAllButton]}
                  onPress={clearAllMuscles}
                >
                  <Text style={styles.buttonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.endButton]}
                  onPress={endWorkout}
                >
                  <Text style={styles.buttonText}>End Workout</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.selectedMusclesContainer}>
                <Text style={styles.selectedMusclesTitle}>
                  Selected Muscles:
                </Text>
                <View style={styles.selectedMusclesList}>
                  {selectedMuscles.map((muscle, index) => (
                    <View key={index} style={styles.selectedMuscleChip}>
                      <Text style={styles.chipText}>{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.muscleGrid}>
                {MUSCLE_GROUPS.map((muscle) => (
                  <TouchableOpacity
                    key={muscle}
                    style={[
                      styles.muscleButton,
                      selectedMuscles.includes(muscle) &&
                        styles.selectedMuscleButton,
                    ]}
                    onPress={() => handleMuscleSelect(muscle)}
                  >
                    <Text
                      style={[
                        styles.muscleButtonText,
                        selectedMuscles.includes(muscle) &&
                          styles.selectedMuscleButtonText,
                      ]}
                    >
                      {muscle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.clearAllButton]}
                  onPress={clearAllMuscles}
                >
                  <Text style={styles.buttonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.startButton]}
                  onPress={startWorkout}
                  disabled={selectedMuscles.length === 0}
                >
                  <Text style={styles.buttonText}>Start Workout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
export default WorkoutSelectionModal;
