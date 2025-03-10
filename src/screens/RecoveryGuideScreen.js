import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

const calculateRecovery = (lastWorkout) => {
  if (!lastWorkout) return 100; // If never worked, fully recovered
  
  const now = new Date();
  const workoutDate = new Date(lastWorkout);
  const hoursPassed = (now - workoutDate) / (1000 * 60 * 60);
  
  // Base recovery time (48 hours = 2 days)
  const recoveryTime = 48;
  
  // Calculate recovery percentage (0-100)
  const recoveryPercentage = Math.min((hoursPassed / recoveryTime) * 100, 100);
  return Math.round(recoveryPercentage);
};

const MuscleRecoveryMeter = ({ lastWorkout }) => {
  const value = calculateRecovery(lastWorkout);
  
  let color;
  if (value < 33) {
    color = '#FF4444'; // Red - Need more rest
  } else if (value < 66) {
    color = '#FFBB33'; // Yellow - Caution
  } else {
    color = '#00C851'; // Green - Ready to train
  }

  return (
    <View style={styles.meterContainer}>
      <View style={[styles.meter, { backgroundColor: '#e0e0e0' }]}>
        <View 
          style={[
            styles.meterFill, 
            { 
              width: `${value}%`,
              backgroundColor: color 
            }
          ]} 
        />
      </View>
      <View style={styles.meterLabels}>
        <Text style={[styles.meterLabel, { color: '#FF4444' }]}>Rest</Text>
        <Text style={[styles.meterLabel, { color: '#FFBB33' }]}>Caution</Text>
        <Text style={[styles.meterLabel, { color: '#00C851' }]}>Train</Text>
      </View>
      {lastWorkout && (
        <Text style={styles.lastWorkoutText}>
          Last workout: {new Date(lastWorkout).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
};

const RecoveryGuideScreen = () => {
  const muscleStatus = useSelector(state => state.workout.muscleStatus);
  const workouts = useSelector(state => state.workout.workouts);

  if (!workouts || workouts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recovery Guide</Text>
          <Text style={styles.subtitle}>
            No workouts recorded yet. Start by logging your first workout!
          </Text>
        </View>
      </View>
    );
  }

  const muscleGroups = Object.entries(muscleStatus).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    lastWorkout: data.lastWorkout
  }));

  const sortedMuscleGroups = [...muscleGroups].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recovery Guide</Text>
        <Text style={styles.subtitle}>
          Monitor your muscle recovery status to optimize your training
        </Text>
      </View>

      <View style={styles.muscleList}>
        {sortedMuscleGroups.map((muscle, index) => (
          <View key={index} style={styles.muscleItem}>
            <Text style={styles.muscleName}>{muscle.name}</Text>
            <View style={styles.meterWrapper}>
              <MuscleRecoveryMeter lastWorkout={muscle.lastWorkout} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  noWorkoutsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  muscleList: {
    padding: 15,
  },
  muscleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  muscleName: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  meterWrapper: {
    flex: 2,
  },
  meterContainer: {
    width: '100%',
  },
  meter: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 6,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  meterLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  lastWorkoutText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
});

export default RecoveryGuideScreen;
