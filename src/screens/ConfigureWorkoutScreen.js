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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const setTypes = [
  { label: 'Warmup', value: 'warmup' },
  { label: 'Working Set', value: 'numbered' },
  { label: 'Failure', value: 'failure' },
  { label: 'Drop', value: 'drop' },
];

const ConfigureWorkoutScreen = ({ route, navigation }) => {
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

  const handleSaveWorkout = async () => {
    // Save the workout to AsyncStorage
    const workout = {
      name: workoutName || 'My Workout',
      exercises: exerciseConfigs
    };
    await AsyncStorage.setItem('savedWorkout', JSON.stringify(workout));
    // Pop to the top of the stack (Home)
    navigation.popToTop();
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
      {/* Move Add Exercise Button to the top */}
      <TouchableOpacity style={styles.addExerciseButton} onPress={() => navigation.navigate('AddExercise', { previousExercises: exerciseConfigs })}>
        <Ionicons name="add-circle" size={28} color="#fff" style={{ marginRight: 12 }} />
        <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
      </TouchableOpacity>
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
