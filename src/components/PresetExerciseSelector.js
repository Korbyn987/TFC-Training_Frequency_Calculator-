import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet } from "react-native";
import MuscleGroupSelectionModal from "./MuscleGroupSelectionModal";
import { useNavigation } from '@react-navigation/native';

const PresetExerciseSelector = ({ visible, onClose, onAddExercise, selectedExercises }) => {
  const navigation = useNavigation();
  const [muscleModalVisible, setMuscleModalVisible] = useState(false);
  const [selectExerciseVisible, setSelectExerciseVisible] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);

  const handleAddExercise = () => {
    setMuscleModalVisible(true);
  };

  const handleSelectMuscleGroup = (muscleGroup) => {
    setMuscleModalVisible(false);
    setSelectedMuscleGroup(muscleGroup);
    setSelectExerciseVisible(true);
  };

  const handleSelectExercise = (exercise) => {
    onAddExercise(exercise);
    setSelectExerciseVisible(false);
    setSelectedMuscleGroup(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Edit Exercises</Text>
          <FlatList
            data={selectedExercises}
            keyExtractor={(item, idx) => item.name + idx}
            renderItem={({ item, index }) => (
              <View style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                {/* Add remove/edit logic as needed */}
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No exercises yet.</Text>}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddExercise}>
            <Text style={styles.addButtonText}>+ Add Exercise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
        <MuscleGroupSelectionModal
          visible={muscleModalVisible}
          onClose={() => setMuscleModalVisible(false)}
          onSelectMuscleGroup={handleSelectMuscleGroup}
        />
        {selectExerciseVisible && selectedMuscleGroup && (
          <Modal
            visible={selectExerciseVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setSelectExerciseVisible(false)}
          >
            {(() => {
              setSelectExerciseVisible(false);
              navigation.navigate('AddExercise', {
                muscleGroup: selectedMuscleGroup.name,
                muscleGroupId: selectedMuscleGroup.id,
                // Add a callback or use params for return if needed
              });
              return null;
            })()}
          </Modal>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  content: { backgroundColor: "#fff", borderRadius: 14, padding: 28, width: "90%", maxHeight: "80%", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", color: "#6b46c1", marginBottom: 16 },
  exerciseRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  exerciseName: { fontSize: 16, color: "#222" },
  addButton: { backgroundColor: "#6b46c1", paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, marginTop: 10, marginBottom: 4 },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  closeButton: { marginTop: 8 },
  closeButtonText: { color: "#6b46c1", fontWeight: "bold", fontSize: 16 },
  empty: { color: "#666", marginTop: 10 },
});

export default PresetExerciseSelector;
