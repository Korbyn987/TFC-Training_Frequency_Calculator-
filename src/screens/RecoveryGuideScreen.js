import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { styles } from "../styles/recoveryGuideStyles";
import CircularProgress from 'react-native-circular-progress-indicator';

const MUSCLE_RECOVERY_TIMES = {
  Biceps: 48,
  Triceps: 72,
  Forearms: 48,
  Chest: 72,
  "Deltoid (front)": 48,
  "Deltoid (side)": 48,
  "Deltoid (rear)": 48,
  "Upper/Middle Back": 72,
  "Lower Back": 62,
  Trapezius: 72,
  Glutes: 62,
  Calves: 48,
  Quadriceps: 72,
  Hamstrings: 72,
  Core: 48,
};

const calculateRecovery = (lastWorkout, recoveryTime) => {
  if (!lastWorkout) return { percentage: 100, timeLeft: 0 };

  const now = new Date();
  const workoutDate = new Date(lastWorkout);
  const hoursPassed = (now - workoutDate) / (1000 * 60 * 60);
  const timeLeft = recoveryTime - hoursPassed;
  const recoveryPercentage = Math.min((hoursPassed / recoveryTime) * 100, 100);
  
  return {
    percentage: recoveryPercentage,
    timeLeft: timeLeft > 0 ? timeLeft : 0,
    hoursPassed,
  };
};

const MuscleRecoveryMeter = ({ muscleName, lastWorkout, recoveryTime }) => {
  const { percentage, timeLeft } = calculateRecovery(lastWorkout, recoveryTime);

  const getGradientColor = (percent) => {
    if (percent <= 33) return '#553c9a';
    if (percent <= 66) return '#805ad5';
    return '#9f7aea';
  };

  return (
    <View style={styles.muscleCard}>
      <Text style={styles.muscleName}>{muscleName}</Text>
      <View style={styles.progressContainer}>
        <CircularProgress
          value={percentage}
          radius={30}
          duration={1000}
          progressValueColor={'#2d3748'}
          maxValue={100}
          title={'%'}
          titleColor={'#2d3748'}
          titleStyle={{ fontWeight: 'bold' }}
          activeStrokeColor={getGradientColor(percentage)}
          inActiveStrokeColor={'#e2e8f0'}
          inActiveStrokeOpacity={0.5}
          inActiveStrokeWidth={6}
          activeStrokeWidth={12}
        />
      </View>
      <Text style={styles.recoveryText}>
        {timeLeft > 0
          ? `${Math.ceil(timeLeft)}h until fully recovered`
          : 'Fully Recovered'}
      </Text>
    </View>
  );
};

const RecoveryGuideScreen = () => {
  const workouts = useSelector((state) => state.workouts?.workouts) || {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recovery Guide</Text>
        <Text style={styles.subtitle}>Track your muscle recovery status</Text>
      </View>

      <View style={styles.content}>
        {Object.entries(MUSCLE_RECOVERY_TIMES).map(([muscle, recoveryTime]) => (
          <MuscleRecoveryMeter
            key={muscle}
            muscleName={muscle}
            lastWorkout={workouts[muscle]?.lastWorkout}
            recoveryTime={recoveryTime}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default RecoveryGuideScreen;
