import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = 'workout_presets';

const SelectRoutineScreen = ({ navigation }) => {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresets = async () => {
      setLoading(true);
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
          setPresets(JSON.parse(data));
        } else {
          setPresets([]);
        }
      } catch (err) {
        setPresets([]);
      }
      setLoading(false);
    };
    fetchPresets();
  }, []);

  const handleSelectPreset = (preset) => {
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
      <Text style={styles.title}>Select a Saved Preset</Text>
      {presets.length === 0 ? (
        <Text style={styles.empty}>No saved presets found.</Text>
      ) : (
        <FlatList
          data={presets}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.presetCard} onPress={() => handleSelectPreset(item)}>
              <Text style={styles.presetName}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={22} color="#6b46c1" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171923',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  empty: {
    color: '#aaa',
    marginTop: 32,
    fontSize: 16,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23263a',
    borderRadius: 10,
    padding: 18,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
  },
  presetName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SelectRoutineScreen;
