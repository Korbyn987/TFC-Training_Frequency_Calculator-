import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// Static muscle groups data from Workouts.sql
const MUSCLE_GROUPS = [
  { id: 1, name: "Chest" },
  { id: 2, name: "Back" },
  { id: 3, name: "Quadriceps" },
  { id: 4, name: "Hamstrings" },
  { id: 5, name: "Shoulders" },
  { id: 6, name: "Biceps" },
  { id: 7, name: "Triceps" },
  { id: 8, name: "Core" }
];

const MuscleGroupSelectionModal = ({
  visible,
  onClose,
  onSelectMuscleGroup,
  onSelect,
  selectedGroups = [],
  muscleGroups = MUSCLE_GROUPS
}) => {
  const [selectedMuscleGroups, setSelectedMuscleGroups] =
    useState(selectedGroups);

  const handleMuscleGroupToggle = (muscleGroup) => {
    const isSelected = selectedMuscleGroups.includes(muscleGroup.name);
    let newSelection;

    if (isSelected) {
      newSelection = selectedMuscleGroups.filter(
        (name) => name !== muscleGroup.name
      );
    } else {
      newSelection = [...selectedMuscleGroups, muscleGroup.name];
    }

    setSelectedMuscleGroups(newSelection);
  };

  const handleConfirm = () => {
    // Support both prop names for backward compatibility
    if (onSelect) {
      onSelect(selectedMuscleGroups);
    } else if (onSelectMuscleGroup) {
      onSelectMuscleGroup(selectedMuscleGroups[0]); // Legacy single selection
    }
    onClose();
  };

  const renderMuscleGroup = ({ item }) => {
    // Handle both string and object formats
    const muscleGroupName = typeof item === "string" ? item : item.name;
    const isSelected = selectedMuscleGroups.includes(muscleGroupName);

    return (
      <TouchableOpacity
        style={[
          styles.muscleGroupItem,
          isSelected && styles.muscleGroupItemSelected
        ]}
        onPress={() => handleMuscleGroupToggle({ name: muscleGroupName })}
      >
        <Text
          style={[
            styles.muscleGroupText,
            isSelected && styles.muscleGroupTextSelected
          ]}
        >
          {muscleGroupName}
        </Text>
        <Ionicons
          name={isSelected ? "checkmark-circle" : "add-circle-outline"}
          size={24}
          color={isSelected ? "#4CAF50" : "#A0AEC0"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Select Muscle Groups</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={muscleGroups}
            renderItem={renderMuscleGroup}
            keyExtractor={(item) => item.id?.toString() || item.name}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                selectedMuscleGroups.length === 0 &&
                  styles.confirmButtonDisabled
              ]}
              onPress={handleConfirm}
              disabled={selectedMuscleGroups.length === 0}
            >
              <Text style={styles.confirmButtonText}>
                Confirm ({selectedMuscleGroups.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#171923",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "50%",
    maxHeight: "80%"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3748"
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff"
  },
  closeButton: {
    padding: 5
  },
  list: {
    flex: 1
  },
  listContent: {
    padding: 10
  },
  muscleGroupItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#2D3748",
    borderRadius: 10,
    marginVertical: 5
  },
  muscleGroupItemSelected: {
    backgroundColor: "#4CAF50"
  },
  muscleGroupText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500"
  },
  muscleGroupTextSelected: {
    color: "#fff"
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#2D3748"
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  confirmButtonDisabled: {
    backgroundColor: "#ccc"
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold"
  }
});

export default MuscleGroupSelectionModal;
