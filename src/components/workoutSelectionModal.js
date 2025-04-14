import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/workoutSelectionModalStyles';
import MuscleGroupSelectionModal from './MuscleGroupSelectionModal';

const WorkoutSelectionModal = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const [isMuscleGroupModalVisible, setIsMuscleGroupModalVisible] = useState(false);

  const handleAddExercise = () => {
    setIsMuscleGroupModalVisible(true);
  };

  const handleSelectRoutine = () => {
    onClose();
    navigation.navigate('SelectRoutine');
  };

  const handleMuscleGroupSelect = (muscleGroup) => {
    setIsMuscleGroupModalVisible(false);
    onClose();
    navigation.navigate('AddExercise', { muscleGroup });
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Workout Type</Text>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAddExercise}
            >
              <Text style={styles.modalButtonText}>Add Exercise</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSelectRoutine}
            >
              <Text style={styles.modalButtonText}>Select Routine</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <MuscleGroupSelectionModal
        visible={isMuscleGroupModalVisible}
        onClose={() => setIsMuscleGroupModalVisible(false)}
        onSelectMuscleGroup={handleMuscleGroupSelect}
      />
    </>
  );
};

export default WorkoutSelectionModal;
