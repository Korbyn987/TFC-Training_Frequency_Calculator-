import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Static muscle groups data from Workouts.sql
const MUSCLE_GROUPS = [
  { id: 1, name: 'Chest' },
  { id: 2, name: 'Back' },
  { id: 3, name: 'Legs' },
  { id: 4, name: 'Shoulders' },
  { id: 5, name: 'Arms' },
  { id: 6, name: 'Core' }
];

const MuscleGroupSelectionModal = ({ visible, onClose, onSelectMuscleGroup }) => {
  const [muscleGroups, setMuscleGroups] = useState(MUSCLE_GROUPS);

  const renderMuscleGroup = ({ item }) => (
    <TouchableOpacity
      style={styles.muscleGroupItem}
      onPress={() => {
        onSelectMuscleGroup(item);
        onClose();
      }}
    >
      <Text style={styles.muscleGroupText}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={24} color="#A0AEC0" />
    </TouchableOpacity>
  );

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
            <Text style={styles.modalTitle}>Select Muscle Group</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={muscleGroups}
            renderItem={renderMuscleGroup}
            keyExtractor={item => item.id.toString()}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#171923',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 10,
  },
  muscleGroupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2D3748',
    borderRadius: 10,
    marginVertical: 5,
  },
  muscleGroupText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default MuscleGroupSelectionModal;
