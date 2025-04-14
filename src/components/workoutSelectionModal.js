import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../styles/workoutSelectionModalStyles";

const WorkoutSelectionModal = ({ visible, onClose }) => {
  const navigation = useNavigation();

  const handleAddExercise = () => {
    onClose();
    navigation.navigate("AddExercise");
  };

  const handleSelectRoutine = () => {
    onClose();
    navigation.navigate("SelectRoutine");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Workout</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.leftButton]}
              onPress={handleAddExercise}
            >
              <Ionicons name="add-circle-outline" size={40} color="#ffffff" />
              <Text style={styles.buttonText}>Add Exercise</Text>
              <Text style={styles.buttonSubText}>Create a custom workout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rightButton]}
              onPress={handleSelectRoutine}
            >
              <Ionicons name="list-outline" size={40} color="#ffffff" />
              <Text style={styles.buttonText}>Select Routine</Text>
              <Text style={styles.buttonSubText}>Choose from saved routines</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default WorkoutSelectionModal;
