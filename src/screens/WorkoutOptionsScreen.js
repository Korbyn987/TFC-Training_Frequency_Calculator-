import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MuscleGroupSelectionModal from '../components/MuscleGroupSelectionModal';

const WorkoutOptionsScreen = ({ navigation }) => {
  const [isMuscleGroupModalVisible, setIsMuscleGroupModalVisible] = useState(false);

  const handleMuscleGroupSelect = (muscleGroup) => {
    navigation.navigate('AddExercise', { muscleGroup });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => setIsMuscleGroupModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={40} color="#fff" />
        <Text style={styles.optionButtonText}>Add Exercise</Text>
        <Text style={styles.optionButtonSubText}>Create a custom workout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate('SelectRoutine')}
      >
        <Ionicons name="list-outline" size={40} color="#fff" />
        <Text style={styles.optionButtonText}>Select Routine</Text>
        <Text style={styles.optionButtonSubText}>Choose from saved routines</Text>
      </TouchableOpacity>

      <MuscleGroupSelectionModal
        visible={isMuscleGroupModalVisible}
        onClose={() => setIsMuscleGroupModalVisible(false)}
        onSelectMuscleGroup={handleMuscleGroupSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171923',
    padding: 20,
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: '#2D3748',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  optionButtonSubText: {
    color: '#A0AEC0',
    fontSize: 14,
    marginTop: 5,
  },
});

export default WorkoutOptionsScreen;
