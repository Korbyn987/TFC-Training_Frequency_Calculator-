import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
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
  if (!lastWorkout) return { percentage: 100, timeLeft: 0 }; // If never worked, fully recovered aka no time left

  const now = new Date();
  const workoutDate = new Date(lastWorkout);
  const hoursPassed = (now - workoutDate) / (1000 * 60 * 60);

  const timeLeft = recoveryTime - hoursPassed;

  // Calculate recovery percentage (0-100)
  const recoveryPercentage = Math.min((hoursPassed / recoveryTime) * 100, 100);
  return {
    percentage: recoveryPercentage,
    timeLeft: timeLeft > 0 ? timeLeft : 0,
    hoursPassed,
  };
};

const MuscleRecoveryMeter = ({ lastWorkout, recoveryTime }) => {
  const { percentage, timeLeft } = calculateRecovery(lastWorkout, recoveryTime);

  // Calculate color gradient based on percentage
  const getGradientColor = (percent) => {
    if (percent <= 33) {
      return '#553c9a'; // Darker purple for low recovery
    } else if (percent <= 66) {
      return '#6b46c1'; // Primary purple for medium recovery
    } else {
      return '#805ad5'; // Lighter purple for high recovery
    }
  };

  return (
    <View style={styles.meterContainer}>
      <View style={styles.progressRing}>
        <CircularProgress
          value={percentage}
          radius={30}
          duration={500}
          progressValueColor={'#FFFFFF'}
          activeStrokeColor={getGradientColor(percentage)}
          inActiveStrokeColor={'rgba(107, 70, 193, 0.2)'}
          inActiveStrokeWidth={6}
          activeStrokeWidth={8}
        />
      </View>
      <View style={styles.meterTextContainer}>
        <Text style={styles.timeText}>
          {timeLeft > 0 ? `${Math.ceil(timeLeft)}h` : 'Ready!'}
        </Text>
        <Text style={styles.statusText}>
          {percentage < 100 ? 'Recovering' : 'Recovered'}
        </Text>
      </View>
    </View>
  );
};

const RecoveryGuideScreen = () => {
  const navigation = useNavigation();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const lastWorkouts = useSelector((state) => state.workouts?.lastWorkouts || {});

  // Following navigation flow memory: redirect to Login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace("Login");
    }
  }, [isAuthenticated, navigation]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recovery Guide</Text>
        <Text style={styles.subtitle}>
          Track your muscle recovery times and optimize your training
        </Text>
      </View>

      <View style={styles.gridHeader}>
        <Text style={styles.headerCell}>Muscle Group</Text>
        <Text style={styles.headerCell}>Recovery</Text>
        <Text style={styles.headerCell}>Status</Text>
      </View>

      <View style={styles.muscleList}>
        {Object.entries(MUSCLE_RECOVERY_TIMES).map(([muscle, hours]) => (
          <View key={muscle} style={styles.gridRow}>
            <View style={styles.gridCell}>
              <Text style={styles.muscleName}>{muscle}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.recoveryTime}>{hours}h</Text>
            </View>
            <View style={styles.gridCell}>
              {isAuthenticated ? (
                <MuscleRecoveryMeter
                  lastWorkout={lastWorkouts[muscle]}
                  recoveryTime={hours}
                />
              ) : (
                <Text style={styles.loginPrompt}>Login to track</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default RecoveryGuideScreen;
