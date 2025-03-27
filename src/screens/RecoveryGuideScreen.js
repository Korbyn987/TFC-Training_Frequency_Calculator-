import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../styles/recoveryGuideStyles";
import { CircularProgress } from "react-native-circular-progress";

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
      // Red to Orange
      const r = 255;
      const g = Math.floor(255 * (percent / 33));
      return `rgb(${r}, ${g}, 0)`;
    } else if (percent <= 66) {
      // Orange to Yellow
      const r = Math.floor(255 * (1 - (percent - 33) / 33));
      const g = 255;
      return `rgb(${r}, ${g}, 0)`;
    } else {
      // Yellow to Green
      const r = 0;
      const g = 255;
      const b = Math.floor(255 * ((percent - 66) / 34));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  return (
    <View style={styles.meterContainer}>
      <CircularProgress
        size={120}
        width={12}
        fill={percentage}
        tintColor={getGradientColor(percentage)}
        backgroundColor="#e0e0e0"
        rotation={90}
      >
        {() => (
          <View style={styles.meterTextContainer}>
            <Text style={styles.timeText}>{Math.floor(timeLeft)}h</Text>
            <Text style={styles.statusText}>
              {percentage <= 33 ? "Rest" : percentage <= 66 ? "Caution" : "Go"}
            </Text>
          </View>
        )}
      </CircularProgress>
    </View>
  );
};

const RecoveryGuideScreen = () => {
  const navigation = useNavigation();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const muscleStatus = useSelector(
    (state) => state.workout?.muscleStatus || {}
  );
  const workouts = useSelector((state) => state.workout?.workouts || []);

  // Following navigation flow memory: redirect to Login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace("Login");
    }
  }, [isAuthenticated, navigation]);

  if (!isAuthenticated) {
    return null;
  }

  const handleMusclePress = () => {
    if (!isAuthenticated) {
      navigation.navigate("Login");
      return;
    }
    // In the future, we can add interaction for authenticated users
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recovery Guide</Text>
        <Text style={styles.subtitle}>
          {isAuthenticated
            ? "Monitor your muscle recovery status to optimize your training"
            : "Please log in to access the Recovery Guide"}
        </Text>
      </View>

      {/* Grid header */}
      <View style={styles.gridHeader}>
        <Text style={styles.headerCell}>Recovery Time</Text>
      </View>

      {/* Grid Content */}
      <View style={styles.muscleList}>
        {Object.entries(MUSCLE_RECOVERY_TIMES).map(
          ([muscleName, recoveryTime], index) => {
            const muscleKey = muscleName.toLowerCase().replace(/[^a-z]/g, "");
            const muscleData = muscleStatus?.[muscleKey] || {};

            return (
              <TouchableOpacity
                key={index}
                style={styles.gridRow}
                onPress={handleMusclePress}
                disabled={!isAuthenticated}
              >
                <View style={styles.gridCell}>
                  <Text style={styles.muscleName}>{muscleName}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.recoveryTime}>{recoveryTime} hours</Text>
                </View>
                <View style={styles.gridCell}>
                  <MuscleRecoveryMeter
                    lastWorkout={muscleData.lastWorkout}
                    recoveryTime={recoveryTime}
                  />
                </View>
              </TouchableOpacity>
            );
          }
        )}
      </View>
    </ScrollView>
  );
};

export default RecoveryGuideScreen;
