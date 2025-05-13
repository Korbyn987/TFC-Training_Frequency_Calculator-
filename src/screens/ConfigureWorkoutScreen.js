import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ScrollView,
  Picker,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Alert } from 'react-native';
import { addWorkout } from '../redux/workoutSlice';

const setTypes = [
  { label: 'Warmup', value: 'warmup' },
  { label: 'Working Set', value: 'numbered' },
  { label: 'Failure', value: 'failure' },
  { label: 'Drop', value: 'drop' },
];

// Map of exercise IDs to muscle group names
// Note: These must match the muscle group names used in the Redux store
const EXERCISE_TO_MUSCLE_GROUP = {
  // Chest (1)
  1: 'Chest', 2: 'Chest', 3: 'Chest', 4: 'Chest', 5: 'Chest', 6: 'Chest',
  7: 'Chest', 8: 'Chest', 9: 'Chest', 10: 'Chest', 11: 'Chest', 12: 'Chest',
  13: 'Chest', 14: 'Chest', 15: 'Chest', 16: 'Chest', 17: 'Chest', 18: 'Chest',
  19: 'Chest', 20: 'Chest', 21: 'Chest', 22: 'Chest', 23: 'Chest', 24: 'Chest',
  25: 'Chest', 26: 'Chest', 27: 'Chest',
  
  // Biceps (2)
  28: 'Biceps', 29: 'Biceps', 30: 'Biceps', 31: 'Biceps', 32: 'Biceps', 
  33: 'Biceps', 34: 'Biceps', 35: 'Biceps', 36: 'Biceps', 37: 'Biceps',
  38: 'Biceps', 39: 'Biceps',
  
  // Triceps (3)
  40: 'Triceps', 41: 'Triceps', 42: 'Triceps', 43: 'Triceps', 44: 'Triceps',
  45: 'Triceps', 46: 'Triceps', 47: 'Triceps', 48: 'Triceps', 49: 'Triceps',
  50: 'Triceps', 51: 'Triceps',
  
  // Back (4)
  52: 'Back', 53: 'Back', 54: 'Back', 55: 'Back', 56: 'Back', 57: 'Back',
  58: 'Back', 59: 'Back', 60: 'Back', 61: 'Back', 62: 'Back', 63: 'Back',
  64: 'Back', 65: 'Back', 66: 'Back', 67: 'Back', 68: 'Back', 69: 'Back',
  70: 'Back', 71: 'Back', 72: 'Back', 73: 'Back', 74: 'Back', 75: 'Back',
  76: 'Back', 77: 'Back', 78: 'Back',
  
  // Shoulders (5) - Mapped to 'Shoulders' in Redux store
  79: 'Shoulders', 80: 'Shoulders', 81: 'Shoulders', 82: 'Shoulders', 83: 'Shoulders',
  84: 'Shoulders', 85: 'Shoulders', 86: 'Shoulders', 87: 'Shoulders', 88: 'Shoulders',
  89: 'Shoulders', 90: 'Shoulders', 91: 'Shoulders', 92: 'Shoulders', 93: 'Shoulders',
  94: 'Shoulders', 95: 'Shoulders', 96: 'Shoulders', 97: 'Shoulders', 98: 'Shoulders',
  99: 'Shoulders', 100: 'Shoulders', 101: 'Shoulders', 102: 'Shoulders', 103: 'Shoulders',
  104: 'Shoulders', 105: 'Shoulders', 106: 'Shoulders', 107: 'Shoulders', 108: 'Shoulders',
  109: 'Shoulders', 110: 'Shoulders', 111: 'Shoulders', 112: 'Shoulders', 113: 'Shoulders',
  114: 'Shoulders', 115: 'Shoulders', 116: 'Shoulders', 117: 'Shoulders', 118: 'Shoulders',
  119: 'Shoulders', 120: 'Shoulders', 121: 'Shoulders', 122: 'Shoulders', 123: 'Shoulders',
  124: 'Shoulders', 125: 'Shoulders', 126: 'Shoulders', 127: 'Shoulders', 128: 'Shoulders',
  129: 'Shoulders', 130: 'Shoulders', 131: 'Shoulders', 132: 'Shoulders', 133: 'Shoulders',
  134: 'Shoulders', 135: 'Shoulders', 136: 'Shoulders', 137: 'Shoulders', 138: 'Shoulders',
  139: 'Shoulders', 140: 'Shoulders', 141: 'Shoulders', 142: 'Shoulders', 143: 'Shoulders',
  144: 'Shoulders', 145: 'Shoulders', 146: 'Shoulders', 147: 'Shoulders', 148: 'Shoulders',
  149: 'Shoulders', 150: 'Shoulders', 151: 'Shoulders', 152: 'Shoulders',
  
  // Legs (6) - Mapped to specific leg muscles in Redux store
  // Quads
  90: 'Quads', 91: 'Quads', 92: 'Quads', 93: 'Quads', 94: 'Quads', 95: 'Quads',
  96: 'Quads', 97: 'Quads', 98: 'Quads', 99: 'Quads', 100: 'Quads', 101: 'Quads',
  102: 'Quads', 103: 'Quads', 104: 'Quads', 105: 'Quads', 106: 'Quads', 107: 'Quads',
  
  // Hamstrings
  108: 'Hamstrings', 109: 'Hamstrings', 110: 'Hamstrings', 111: 'Hamstrings', 
  112: 'Hamstrings', 113: 'Hamstrings', 114: 'Hamstrings', 115: 'Hamstrings',
  116: 'Hamstrings', 117: 'Hamstrings', 118: 'Hamstrings', 119: 'Hamstrings',
  
  // Calves
  120: 'Calves', 121: 'Calves', 122: 'Calves', 123: 'Calves', 124: 'Calves', 
  125: 'Calves', 126: 'Calves', 127: 'Calves', 128: 'Calves', 129: 'Calves',
  
  // Glutes
  130: 'Glutes', 131: 'Glutes', 132: 'Glutes', 133: 'Glutes', 134: 'Glutes',
  135: 'Glutes', 136: 'Glutes', 137: 'Glutes', 138: 'Glutes', 139: 'Glutes',
  140: 'Glutes', 141: 'Glutes', 142: 'Glutes', 143: 'Glutes', 144: 'Glutes',
  145: 'Glutes', 146: 'Glutes', 147: 'Glutes', 148: 'Glutes', 149: 'Glutes',
  150: 'Glutes', 151: 'Glutes', 152: 'Glutes',
  
  // Core (7) - Mapped to 'Core' in Redux store (matches 'abs' in Redux)
  153: 'Core', 154: 'Core', 155: 'Core', 156: 'Core', 157: 'Core', 158: 'Core',
  159: 'Core', 160: 'Core', 161: 'Core', 162: 'Core', 163: 'Core', 164: 'Core',
  165: 'Core', 166: 'Core', 167: 'Core', 168: 'Core', 169: 'Core', 170: 'Core',
  171: 'Core', 172: 'Core', 173: 'Core', 174: 'Core', 175: 'Core', 176: 'Core',
  177: 'Core', 178: 'Core', 179: 'Core', 180: 'Core'
};

const ConfigureWorkoutScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { exercises, workoutName: navWorkoutName } = route.params || {};
  const safeExercises = Array.isArray(exercises) ? exercises : [];
  const [workoutName, setWorkoutName] = useState(navWorkoutName || '');
  const [exerciseConfigs, setExerciseConfigs] = useState(
    safeExercises.map(exercise => ({
      ...exercise,
      sets: exercise.sets && Array.isArray(exercise.sets) && exercise.sets.length > 0
        ? exercise.sets
        : [
            {
              setType: 'numbered',
              reps: '10',
              weight: '',
              notes: '',
            },
          ],
    }))
  );

  // Only load from AsyncStorage or initial params ONCE, and only if no exercises are present
  useEffect(() => {
    if (
      exerciseConfigs.length === 0 &&
      (!route.params?.selectedExercises || route.params.selectedExercises.length === 0)
    ) {
      const loadSavedWorkout = async () => {
        const workoutStr = await AsyncStorage.getItem('savedWorkout');
        if (workoutStr) {
          const workout = JSON.parse(workoutStr);
          setWorkoutName(workout.name || '');
          setExerciseConfigs(Array.isArray(workout.exercises) ? workout.exercises : []);
        } else if (Array.isArray(safeExercises) && safeExercises.length > 0) {
          setExerciseConfigs(
            safeExercises.map(exercise => ({
              ...exercise,
              sets: exercise.sets && Array.isArray(exercise.sets) && exercise.sets.length > 0
                ? exercise.sets
                : [{ setType: 'numbered', reps: '10', weight: '', notes: '' }]
            }))
          );
        }
      };
      loadSavedWorkout();
    }
  }, []);

  // Always prioritize selectedExercises param if present
  useEffect(() => {
    if (route.params?.selectedExercises && Array.isArray(route.params.selectedExercises)) {
      console.log('[ConfigureWorkoutScreen] Received selectedExercises param:', route.params.selectedExercises);
      setExerciseConfigs(
        route.params.selectedExercises.map(ex => ({
          ...ex,
          sets: ex.sets && Array.isArray(ex.sets) && ex.sets.length > 0
            ? ex.sets
            : [{ setType: 'numbered', reps: '10', weight: '', notes: '' }]
        }))
      );
      navigation.setParams({ selectedExercises: undefined });
    }
  }, [route.params?.selectedExercises]);

  useEffect(() => {
    console.log('[ConfigureWorkoutScreen] exerciseConfigs updated:', exerciseConfigs);
  }, [exerciseConfigs]);

  useEffect(() => {
    if (route.params?.addExercises && Array.isArray(route.params.addExercises) && route.params.addExercises.length > 0) {
      setExerciseConfigs(prev => [
        ...prev,
        ...route.params.addExercises.filter(
          newEx => !prev.some(existing => existing.id === newEx.id)
        )
      ]);
      // Clear the param to prevent repeated additions
      navigation.setParams({ addExercises: [] });
    }
  }, [route.params?.addExercises]);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.addExercise) {
        const newExercise = route.params.addExercise;
        // Prevent duplicates
        if (!exerciseConfigs.some((ex) => ex.id === newExercise.id)) {
          setExerciseConfigs((prev) => [
            ...prev,
            {
              ...newExercise,
              sets: [
                {
                  setType: 'numbered',
                  reps: '10',
                  weight: '',
                  notes: '',
                },
              ],
            },
          ]);
        }
        navigation.setParams({ addExercise: undefined }); // Clear param
      }
    }, [route.params?.addExercise, exerciseConfigs])
  );

  const handleUpdateSet = (exerciseIdx, setIdx, field, value) => {
    const newConfigs = [...exerciseConfigs];
    const newSets = [...newConfigs[exerciseIdx].sets];
    newSets[setIdx] = { ...newSets[setIdx], [field]: value };
    newConfigs[exerciseIdx].sets = newSets;
    setExerciseConfigs(newConfigs);
  };

  const handleAddSet = (exerciseIdx) => {
    const newConfigs = [...exerciseConfigs];
    newConfigs[exerciseIdx].sets = [
      ...newConfigs[exerciseIdx].sets,
      {
        setType: 'numbered',
        reps: '12',
        weight: '',
        notes: '',
      },
    ];
    setExerciseConfigs(newConfigs);
  };

  const handleRemoveSet = (exerciseIdx, setIdx) => {
    const newConfigs = [...exerciseConfigs];
    const sets = [...newConfigs[exerciseIdx].sets];
    if (sets.length > 1) {
      sets.splice(setIdx, 1);
      newConfigs[exerciseIdx].sets = sets;
      setExerciseConfigs(newConfigs);
    }
  };

  const handleUpdateConfig = (index, field, value) => {
    const newConfigs = [...exerciseConfigs];
    newConfigs[index] = {
      ...newConfigs[index],
      [field]: value
    };
    setExerciseConfigs(newConfigs);
  };

  const handleRemoveExercise = (exerciseIdx) => {
    const newConfigs = [...exerciseConfigs];
    newConfigs.splice(exerciseIdx, 1);
    setExerciseConfigs(newConfigs);
  };

  const handleSaveWorkout = () => {
    try {
      // Extract unique muscle groups from all exercises
      const muscleGroups = new Set();
      
      console.log('Saving workout with exercises:', exerciseConfigs);
      
      exerciseConfigs.forEach(exercise => {
        if (exercise.id && EXERCISE_TO_MUSCLE_GROUP[exercise.id]) {
          const muscleGroup = EXERCISE_TO_MUSCLE_GROUP[exercise.id];
          console.log(`Exercise ${exercise.name} (ID: ${exercise.id}) maps to muscle group:`, muscleGroup);
          muscleGroups.add(muscleGroup);
        } else {
          console.warn(`No muscle group mapping found for exercise ID: ${exercise.id} (${exercise.name})`);
        }
      });
      
      // Convert Set to array for Redux
      const muscles = Array.from(muscleGroups);
      
      if (muscles.length === 0) {
        // Fallback in case we couldn't determine muscle groups
        console.warn('No muscle groups found for exercises, using default');
        muscles.push('Full Body');
      }

      console.log('Saving workout with muscle groups:', muscles);
      
      // Create the workout data
      const workoutData = {
        date: new Date().toISOString(),
        muscles,
        intensity: 'moderate',
        name: workoutName || 'My Workout',
        exercises: exerciseConfigs
      };
      
      console.log('Dispatching addWorkout with data:', workoutData);
      
      // Dispatch to Redux store
      dispatch(addWorkout(workoutData));

      // Navigate back to home
      navigation.popToTop();
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
  };

  const renderSet = (exerciseIdx, set, setIdx, setsLength) => (
    <View key={setIdx} style={styles.setCard}>
      <Text style={styles.setNumber}>Set {setIdx + 1}</Text>
      <View style={styles.configRow}>
        <View style={styles.configItem}>
          <Text style={styles.label}>Set Type</Text>
          <Picker
            selectedValue={set.setType}
            style={styles.picker}
            onValueChange={value => handleUpdateSet(exerciseIdx, setIdx, 'setType', value)}
            mode="dropdown"
          >
            {setTypes.map(type => (
              <Picker.Item key={type.value} label={type.label} value={type.value} />
            ))}
          </Picker>
        </View>
        <View style={styles.configItem}>
          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            value={set.reps}
            onChangeText={value => handleUpdateSet(exerciseIdx, setIdx, 'reps', value)}
            keyboardType="numeric"
            placeholder="12"
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.configItem}>
          <Text style={styles.label}>Weight</Text>
          <TextInput
            style={styles.input}
            value={set.weight}
            onChangeText={value => handleUpdateSet(exerciseIdx, setIdx, 'weight', value)}
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
          value={set.notes}
          onChangeText={value => handleUpdateSet(exerciseIdx, setIdx, 'notes', value)}
          placeholder="Add notes here..."
          placeholderTextColor="#666"
          multiline
        />
      </View>
      <View style={styles.setActionsRow}>
        {setsLength > 1 && (
          <TouchableOpacity
            style={styles.removeSetButton}
            onPress={() => handleRemoveSet(exerciseIdx, setIdx)}
          >
            <Text style={styles.removeSetButtonText}>Remove Set</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderExerciseConfig = ({ item, index }) => (
    <View style={styles.exerciseCard}>
      <TouchableOpacity
        style={styles.removeExerciseButton}
        onPress={() => handleRemoveExercise(index)}
      >
        <Ionicons name="close" size={24} color="#e53e3e" />
      </TouchableOpacity>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <Text style={styles.exerciseDesc}>{item.description}</Text>
      {item.sets.map((set, setIdx) => renderSet(index, set, setIdx, item.sets.length))}
      <TouchableOpacity style={styles.addSetButton} onPress={() => handleAddSet(index)}>
        <Text style={styles.addSetButtonText}>+ Add Set</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.workoutNameInput}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Workout Name"
          placeholderTextColor="#666"
        />
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TouchableOpacity
          style={[styles.addExerciseButton, { marginRight: 12 }]}
          onPress={() => navigation.navigate('AddExercise', { onGoBack: () => {} })}
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addExerciseButton, { backgroundColor: '#4b2e83' }]}
          onPress={() => navigation.dispatch(StackActions.push('SelectRoutine'))}
        >
          <Ionicons name="list-outline" size={22} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.addExerciseButtonText}>Select Routine</Text>
        </TouchableOpacity>
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
    </ScrollView>
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
    position: 'relative',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  exerciseDesc: {
    color: '#a0aec0',
    fontSize: 13,
    marginBottom: 4,
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
  picker: {
    minWidth: 120,
    backgroundColor: '#22223b',
    color: '#fff',
    borderRadius: 8,
    marginVertical: 4,
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
  setCard: {
    marginVertical: 6,
    padding: 8,
    backgroundColor: '#23263a',
    borderRadius: 10,
  },
  setNumber: {
    color: '#b794f4',
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 14,
  },
  addSetButton: {
    backgroundColor: '#6b46c1',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  addSetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  setActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  removeSetButton: {
    backgroundColor: '#e53e3e',
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  removeSetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  removeExerciseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  addExerciseButton: {
    backgroundColor: '#6b46c1',
    marginHorizontal: 32,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignSelf: 'center',
    minWidth: 160,
    maxWidth: 320,
  },
  addExerciseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
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
