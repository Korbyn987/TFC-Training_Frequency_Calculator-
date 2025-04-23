import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConfigureWorkoutScreen = ({ route, navigation }) => {
  const { exercises } = route.params || { exercises: [] };
  const [workoutName, setWorkoutName] = useState('');
  const [exerciseConfigs, setExerciseConfigs] = useState(
    exercises.map(exercise => ({
      ...exercise,
      sets: '3',
      reps: '12',
      weight: '',
      notes: ''
    }))
  );

  const handleUpdateConfig = (index, field, value) => {
    const newConfigs = [...exerciseConfigs];
    newConfigs[index] = {
      ...newConfigs[index],
      [field]: value
    };
    setExerciseConfigs(newConfigs);
  };

  const handleSaveWorkout = () => {
    // Here you would save the workout configuration
    // For now, we'll just navigate back to home
    navigation.navigate('HomeScreen', {
      workout: {
        name: workoutName || 'My Workout',
        exercises: exerciseConfigs
      }
    });
  };

  const renderExerciseConfig = ({ item, index }) => (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      
      <View style={styles.configRow}>
        <View style={styles.configItem}>
          <Text style={styles.label}>Sets</Text>
          <TextInput
            style={styles.input}
            value={item.sets}
            onChangeText={(value) => handleUpdateConfig(index, 'sets', value)}
            keyboardType="numeric"
            placeholder="3"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.configItem}>
          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            value={item.reps}
            onChangeText={(value) => handleUpdateConfig(index, 'reps', value)}
            keyboardType="numeric"
            placeholder="12"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.configItem}>
          <Text style={styles.label}>Weight (lbs)</Text>
          <TextInput
            style={styles.input}
            value={item.weight}
            onChangeText={(value) => handleUpdateConfig(index, 'weight', value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#666"
          />
        </View>
      </View>

      <View style={styles.notesContainer}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          value={item.notes}
          onChangeText={(value) => handleUpdateConfig(index, 'notes', value)}
          placeholder="Add notes here..."
          placeholderTextColor="#666"
          multiline
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.workoutNameInput}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Workout Name"
          placeholderTextColor="#666"
        />
      </View>

      <FlatList
        data={exerciseConfigs}
        renderItem={renderExerciseConfig}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.exerciseList}
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveWorkout}
      >
        <Text style={styles.saveButtonText}>Save Workout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171923',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  workoutNameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    padding: 8,
    backgroundColor: '#2D3748',
    borderRadius: 8,
  },
  exerciseList: {
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  configItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  label: {
    color: '#fff',
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#1A202C',
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    textAlign: 'center',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesInput: {
    backgroundColor: '#1A202C',
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#6b46c1',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfigureWorkoutScreen;
