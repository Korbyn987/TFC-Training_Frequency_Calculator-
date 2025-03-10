import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../styles/recoveryGuideStyles";

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
  let zoneText = "";
  if (value <= 33) {
    color = "#FF4444"; // Red - Need more rest
    zoneText = "Do not train";
  } else if (value <= 50) {
    color = "#FFBB33";
    zoneText = "Caution!! Probably shouldn't train";
  } else if (value <= 66) {
    color = "#FFBB33"; // Yellow - Caution
    zoneText = "Could train, but be careful";
  } else {
    color = "#00C851"; // Green - Ready to train
    zoneText = "Safe to train";
  }

  return (
    <View style={styles.meterContainer}>
      <View style={[styles.meter, { backgroundColor: "#e0e0e0" }]}>
        <View
          style={[
            styles.meterFill,
            {
              width: `${value}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={styles.zoneText}>{zoneText}</Text>
      {lastWorkout && (
        <Text style={styles.lastWorkoutText}>
          Last workout: {new Date(lastWorkout).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
};

const RecoveryGuideScreen = () => {
  const navigation = useNavigation();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const muscleStatus = useSelector((state) => state.workout?.muscleStatus || {});
  const workouts = useSelector((state) => state.workout?.workouts || []);

  // Following navigation flow memory: redirect to Login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
    }
  }, [isAuthenticated, navigation]);

  const predefinedMuscleGroups = [
    "Biceps",
    "Forearms",
    "Quads",
    "Hamstrings",
    "Triceps",
    "Abs",
    "Shoulders",
    "Traps",
    "Back",
    "Calves",
    "Glutes",
    "Chest",
  ];

  const handleMusclePress = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
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

      <View style={styles.muscleList}>
        {predefinedMuscleGroups.map((muscleName, index) => {
          const muscleKey = muscleName.toLowerCase();
          const muscleData = muscleStatus?.[muscleKey] || {};

          return (
            <TouchableOpacity
              key={index}
              style={styles.muscleItem}
              onPress={handleMusclePress}
              disabled={!isAuthenticated}
            >
              <Text style={styles.muscleName}>{muscleName}</Text>
              <View style={styles.meterWrapper}>
                <MuscleRecoveryMeter lastWorkout={muscleData.lastWorkout} />
                {!isAuthenticated && (
                  <Text style={styles.loginPrompt}>
                    Login to track workouts
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default RecoveryGuideScreen;
