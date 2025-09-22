import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import SetTypePicker from "./SetTypePicker";

const ExerciseDetailModal = ({
  visible,
  exercise,
  onClose,
  onUpdateSet,
  onAddSet,
  onRemoveSet
}) => {
  const [internalExercise, setInternalExercise] = useState(exercise);

  useEffect(() => {
    setInternalExercise(exercise);
  }, [exercise]);

  if (!internalExercise) return null;

  const handleUpdate = (setId, param, value) => {
    const updatedExercise = {
      ...internalExercise,
      sets: internalExercise.sets.map((set) =>
        set.id === setId ? { ...set, [param]: value } : set
      )
    };
    setInternalExercise(updatedExercise);
    onUpdateSet(internalExercise.id, setId, param, value);
  };

  const handleAddSet = () => {
    // Create a new set locally for an instant UI update.
    // The parent's state will become the source of truth once it updates.
    const newSet = {
      id: `set_${Math.random()}`,
      reps: 10,
      weight: 0,
      set_type: "working",
      completed: false,
      notes: ""
    };

    const updatedExercise = {
      ...internalExercise,
      sets: [...internalExercise.sets, newSet]
    };
    setInternalExercise(updatedExercise);

    // Call the parent function to persist the change.
    onAddSet(internalExercise.id);
  };

  const handleRemoveSet = (setId) => {
    // Visually update the modal instantly
    const updatedSets = internalExercise.sets.filter((set) => set.id !== setId);
    setInternalExercise({ ...internalExercise, sets: updatedSets });

    // Propagate the change to the parent component
    onRemoveSet(internalExercise.id, setId);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.exerciseName}>{internalExercise.name}</Text>
              <Text style={styles.exerciseDescription}>
                {internalExercise.description}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {internalExercise.sets &&
              Array.isArray(internalExercise.sets) &&
              internalExercise.sets.map((set, index) => (
                <View key={set.id} style={styles.setContainer}>
                  <View style={styles.setRow}>
                    <Text style={styles.setTitle}>Set {index + 1}</Text>
                    <TouchableOpacity onPress={() => handleRemoveSet(set.id)}>
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#FF6B6B"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.setRow}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Set Type</Text>
                      <SetTypePicker
                        selectedValue={set.set_type || "working"}
                        onValueChange={(value) =>
                          handleUpdate(set.id, "set_type", value)
                        }
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Reps</Text>
                      <TextInput
                        style={styles.input}
                        value={String(set.reps || 0)}
                        onChangeText={(val) =>
                          handleUpdate(set.id, "reps", parseInt(val) || 0)
                        }
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Weight</Text>
                      <TextInput
                        style={styles.input}
                        value={String(set.weight || 0)}
                        onChangeText={(val) =>
                          handleUpdate(set.id, "weight", parseFloat(val) || 0)
                        }
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666"
                      />
                    </View>
                  </View>

                  <View style={styles.notesGroup}>
                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                      style={styles.notesInput}
                      value={set.notes || ""}
                      onChangeText={(val) => handleUpdate(set.id, "notes", val)}
                      placeholder="Add notes here..."
                      placeholderTextColor="#666"
                      multiline
                    />
                  </View>
                </View>
              ))}
          </ScrollView>

          <TouchableOpacity style={styles.addSetButton} onPress={handleAddSet}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addSetButtonText}>Add Set</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)"
  },
  modalContent: {
    width: "95%",
    height: "90%",
    backgroundColor: "#1a1c2e",
    borderRadius: 12,
    padding: 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#4CAF50",
    paddingBottom: 10,
    marginBottom: 10
  },
  headerTextContainer: {
    flex: 1
  },
  exerciseName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold"
  },
  exerciseDescription: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 4
  },
  closeButton: {
    padding: 5
  },
  scrollView: {
    flex: 1
  },
  setContainer: {
    backgroundColor: "#23263a",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15
  },
  setTitle: {
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "bold"
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 5
  },
  label: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 5
  },
  input: {
    backgroundColor: "#1a1c2e",
    color: "#fff",
    borderRadius: 6,
    padding: 10,
    textAlign: "center",
    height: 44
  },
  notesGroup: {
    marginHorizontal: 5
  },
  notesInput: {
    backgroundColor: "#1a1c2e",
    color: "#fff",
    borderRadius: 6,
    padding: 10,
    height: 80,
    textAlignVertical: "top"
  },
  addSetButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
  },
  addSetButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold"
  }
});

export default ExerciseDetailModal;
