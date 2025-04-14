import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MUSCLE_GROUPS } from '../constants/muscleGroups';

const AddExerciseScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch exercises for the selected category
  useEffect(() => {
    if (selectedCategory) {
      fetchExercises(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchExercises = async (category) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to your SQL database
      // For now, using mock data
      const mockExercises = [
        { id: 1, name: 'Bench Press', description: 'Classic chest exercise' },
        { id: 2, name: 'Push-ups', description: 'Bodyweight chest exercise' },
        // Add more mock exercises here
      ];
      setExercises(mockExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExercise = (exercise) => {
    setSelectedExercises(prev => {
      const isSelected = prev.some(e => e.id === exercise.id);
      if (isSelected) {
        return prev.filter(e => e.id !== exercise.id);
      } else {
        return [...prev, exercise];
      }
    });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.categoryItemSelected
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item && styles.categoryTextSelected
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderExerciseItem = ({ item }) => {
    const isSelected = selectedExercises.some(e => e.id === item.id);
    
    return (
      <TouchableOpacity
        style={[styles.exerciseItem, isSelected && styles.exerciseItemSelected]}
        onPress={() => toggleExercise(item)}
      >
        <View style={styles.exerciseContent}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <Text style={styles.exerciseDescription}>{item.description}</Text>
        </View>
        <Ionicons
          name={isSelected ? "checkmark-circle" : "add-circle-outline"}
          size={24}
          color={isSelected ? "#6b46c1" : "#ffffff"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {MUSCLE_GROUPS.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryItem,
              selectedCategory === category && styles.categoryItemSelected
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextSelected
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.exercisesContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#6b46c1" />
        ) : (
          <FlatList
            data={exercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.exercisesList}
          />
        )}
      </View>

      {selectedExercises.length > 0 && (
        <View style={styles.bottomBar}>
          <Text style={styles.selectedCount}>
            {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''} selected
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              // TODO: Navigate to next screen with selected exercises
              navigation.navigate('ConfigureWorkout', { exercises: selectedExercises });
            }}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171923',
  },
  categoriesContainer: {
    maxHeight: 60,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#2D3748',
  },
  categoryItemSelected: {
    backgroundColor: '#6b46c1',
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  exercisesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  exercisesList: {
    paddingTop: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#2D3748',
  },
  exerciseItemSelected: {
    backgroundColor: '#2D3748',
    borderColor: '#6b46c1',
    borderWidth: 2,
  },
  exerciseContent: {
    flex: 1,
    marginRight: 16,
  },
  exerciseName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exerciseDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A202C',
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
  },
  selectedCount: {
    color: '#ffffff',
    fontSize: 16,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6b46c1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default AddExerciseScreen;
