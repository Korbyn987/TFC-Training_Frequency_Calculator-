import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'workout_presets';

const SelectRoutineScreen = ({ navigation }) => {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPresets = async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        setPresets(data ? JSON.parse(data) : []);
      } catch (err) {
        setPresets([]);
      } finally {
        setLoading(false);
      }
    };
    loadPresets();
  }, []);

  const handleSelectPreset = (preset) => {
    // You can customize this to navigate or apply the preset as needed
    navigation.navigate('ConfigureWorkout', {
      exercises: preset.exercises,
      workoutName: preset.name,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6b46c1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Preset Routine</Text>
      <FlatList
        data={presets}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.presetCard} onPress={() => handleSelectPreset(item)}>
            <Text style={styles.presetName}>{item.name}</Text>
            <Text style={styles.exerciseCount}>{item.exercises.length} exercises</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No presets found.</Text>}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171923',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    letterSpacing: 1,
  },
  presetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    width: 280,
    alignItems: 'center',
    shadowColor: '#6b46c1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e3d9fa',
  },
  presetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b46c1',
    marginBottom: 4,
  },
  exerciseCount: {
    color: '#444',
    fontSize: 14,
  },
  empty: {
    color: '#666',
    marginTop: 30,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SelectRoutineScreen;
