import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
    // Ensure each exercise has the proper format for ConfigureWorkoutScreen
    const formattedExercises = preset.exercises.map(exercise => ({
      ...exercise,
      // Ensure each exercise has an id
      id: exercise.id || exercise.name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now(),
      // Ensure each exercise has a name
      name: exercise.name || 'Unnamed Exercise',
      // Ensure each exercise has sets with proper format
      sets: Array.isArray(exercise.sets) && exercise.sets.length > 0
        ? exercise.sets
        : [{ setType: 'numbered', reps: '10', weight: '', notes: '' }]
    }));
    
    // Navigate to ConfigureWorkout with the formatted exercises
    navigation.navigate('ConfigureWorkout', {
      exercises: formattedExercises,
      workoutName: preset.name,
      fromPreset: true, // Flag to indicate this came from a preset
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b46c1" />
        <Text style={styles.loadingText}>Loading your presets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#171923" />
      <View style={styles.backgroundContainer}>
        <View style={styles.headerContainer}>
          <MaterialCommunityIcons name="playlist-star" size={32} color="#6b46c1" />
          <Text style={styles.title}>Select a Workout Preset</Text>
        </View>
        
        {presets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="playlist-remove" size={60} color="rgba(107, 70, 193, 0.5)" />
            <Text style={styles.empty}>No saved presets found.</Text>
            <Text style={styles.emptySubtext}>Create presets in your profile to use them here.</Text>
          </View>
        ) : (
          <FlatList
            data={presets}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item, index }) => {
              // Determine card color based on index
              const cardStyle = [
                styles.presetCard,
                index % 3 === 0 ? styles.purpleCard : index % 3 === 1 ? styles.darkPurpleCard : styles.brightPurpleCard
              ];
              
              return (
                <TouchableOpacity 
                  style={cardStyle} 
                  onPress={() => handleSelectPreset(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <MaterialCommunityIcons name="dumbbell" size={24} color="#fff" style={styles.cardIcon} />
                      <Text style={styles.presetName}>{item.name}</Text>
                    </View>
                    
                    <View style={styles.exerciseCount}>
                      <Text style={styles.exerciseCountText}>
                        {item.exercises.length} {item.exercises.length === 1 ? 'exercise' : 'exercises'}
                      </Text>
                    </View>
                    
                    <View style={styles.selectButton}>
                      <Text style={styles.selectButtonText}>Select</Text>
                      <Ionicons name="chevron-forward" size={18} color="#fff" style={{ marginLeft: 5 }} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171923',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#171923',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backgroundContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: '#171923',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 15,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  empty: {
    color: '#fff',
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: '80%',
  },
  listContainer: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  presetCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  purpleCard: {
    backgroundColor: '#6b46c1',
    borderLeftWidth: 4,
    borderLeftColor: '#9f7aea',
  },
  darkPurpleCard: {
    backgroundColor: '#4c1d95',
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  brightPurpleCard: {
    backgroundColor: '#7c3aed',
    borderLeftWidth: 4,
    borderLeftColor: '#a78bfa',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    marginRight: 10,
  },
  presetName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  exerciseCount: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  exerciseCountText: {
    color: '#fff',
    fontSize: 14,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SelectRoutineScreen;
