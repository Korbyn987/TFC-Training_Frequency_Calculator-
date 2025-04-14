import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const WorkoutOptionsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Workout</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.leftButton]} 
          onPress={() => navigation.navigate('AddExercise')}
        >
          <Ionicons name="add-circle-outline" size={40} color="#ffffff" />
          <Text style={styles.buttonText}>Add Exercise</Text>
          <Text style={styles.buttonSubText}>Create a custom workout</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.rightButton]} 
          onPress={() => navigation.navigate('SelectRoutine')}
        >
          <Ionicons name="list-outline" size={40} color="#ffffff" />
          <Text style={styles.buttonText}>Select Routine</Text>
          <Text style={styles.buttonSubText}>Choose from saved routines</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171923',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 32,
    letterSpacing: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  button: {
    width: '45%',
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftButton: {
    backgroundColor: '#6b46c1', 
  },
  rightButton: {
    backgroundColor: '#805AD5', 
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  buttonSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default WorkoutOptionsScreen;
