import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const WorkoutHistoryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Workout History</Text>
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

export default WorkoutHistoryScreen;
