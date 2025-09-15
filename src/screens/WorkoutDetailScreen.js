import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const WorkoutDetailScreen = ({ route }) => {
  const { workoutId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Workout Detail Screen</Text>
      <Text style={styles.text}>Workout ID: {workoutId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1c2e',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
});

export default WorkoutDetailScreen;
