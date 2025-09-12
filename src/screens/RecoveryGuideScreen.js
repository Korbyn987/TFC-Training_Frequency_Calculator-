import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import { useTabData } from "../context/TabDataContext";
import { styles } from "../styles/recoveryGuideStyles";

const useRecoveryCountdown = (
  lastWorkout,
  recoveryTime,
  muscleName = "unknown"
) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [status, setStatus] = useState("Fully Recovered");
  const [statusDetails, setStatusDetails] = useState("");
  const [nextAvailable, setNextAvailable] = useState(null);

  useEffect(() => {
    if (!lastWorkout) {
      setPercentage(100);
      setTimeLeft(0);
      setStatus("Fully Recovered");
      setStatusDetails("No workout recorded");
      setNextAvailable(new Date());
      return;
    }

    const calculateRecovery = () => {
      const now = new Date();
      const workoutDate = new Date(lastWorkout);

      if (isNaN(workoutDate.getTime())) {
        setPercentage(100);
        setTimeLeft(0);
        setStatus("Fully Recovered");
        setStatusDetails("Invalid workout date");
        setNextAvailable(now);
        return;
      }

      const timeDiffInSeconds = (now - workoutDate) / 1000;
      const recoveryTimeInSeconds = recoveryTime * 3600;
      const timeLeftInSeconds = Math.max(
        0,
        recoveryTimeInSeconds - timeDiffInSeconds
      );
      const timeLeftInHours = timeLeftInSeconds / 3600;
      const percentage = Math.min(
        100,
        ((recoveryTimeInSeconds - timeLeftInSeconds) / recoveryTimeInSeconds) *
          100
      );

      const nextAvailableTime = new Date(workoutDate);
      nextAvailableTime.setHours(nextAvailableTime.getHours() + recoveryTime);

      let status, statusDetails;

      if (timeLeftInSeconds <= 0) {
        status = "Fully Recovered";
        statusDetails = "Ready to train";
      } else {
        status = "Recovering";
        const days = Math.floor(timeLeftInSeconds / 86400);
        const hours = Math.floor((timeLeftInSeconds % 86400) / 3600);
        const minutes = Math.floor((timeLeftInSeconds % 3600) / 60);
        const seconds = Math.floor(timeLeftInSeconds % 60);

        if (days > 0) {
          statusDetails = `Ready in ~${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
          statusDetails = `Ready in ~${hours}h ${minutes}m ${seconds}s`;
        } else {
          statusDetails = `Ready in ~${minutes}m ${seconds}s`;
        }
      }

      setTimeLeft(timeLeftInHours);
      setPercentage(percentage);
      setStatus(status);
      setStatusDetails(statusDetails);
      setNextAvailable(nextAvailableTime);
    };

    calculateRecovery();
    const interval = setInterval(calculateRecovery, 1000);

    return () => clearInterval(interval);
  }, [lastWorkout, recoveryTime, muscleName]);

  return {
    timeLeft,
    percentage,
    status,
    statusDetails,
    nextAvailable
  };
};

const MuscleRecoveryMeter = ({ muscleName, lastWorkout, recoveryTime }) => {
  const { percentage, status, statusDetails, nextAvailable, timeLeft } =
    useRecoveryCountdown(lastWorkout, recoveryTime, muscleName);

  const formatTimeLeft = (hours) => {
    if (hours <= 0) return "Now";
    const totalSeconds = Math.ceil(hours * 3600);
    const days = Math.floor(totalSeconds / 86400);
    const hoursRemaining = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hoursRemaining}h ${minutes}m`;
    } else if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minutes}m ${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  };

  const getStatusColor = () => {
    if (status === "Fully Recovered") return "#10b981";
    if (status === "Recovering") return timeLeft < 24 ? "#f59e0b" : "#ef4444";
    return "#ef4444";
  };

  return (
    <View style={styles.muscleCard}>
      <View style={styles.muscleHeader}>
        <Text style={styles.muscleName}>{muscleName}</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <CircularProgress
          value={percentage}
          radius={48}
          duration={1000}
          progressValueColor={getStatusColor()}
          activeStrokeColor={getStatusColor()}
          inActiveStrokeColor="#e5e7eb"
          maxValue={100}
          title={`${
            status === "Fully Recovered" ? "Ready" : formatTimeLeft(timeLeft)
          }`}
          titleStyle={[styles.progressTitle, { color: getStatusColor() }]}
          titleFontSize={14}
          progressValueFontSize={16}
          progressValueStyle={{ fontWeight: "bold" }}
        />
        <View style={styles.recoveryInfo}>
          <Text style={styles.recoveryText}>Recovery: {recoveryTime}h</Text>
          <Text style={[styles.recoveryText, { color: getStatusColor() }]}>
            {statusDetails}
          </Text>
          {nextAvailable && status !== "Fully Recovered" && (
            <Text style={[styles.recoveryText, { fontSize: 12, opacity: 0.8 }]}>
              Ready by: {format(nextAvailable, "MMM d, h:mm a")}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const RecoveryGuideScreen = () => {
  const { userStats, muscleRecoveryData, loading } = useTabData();

  const defaultMuscleGroups = {
    Chest: { recoveryTime: 72, lastWorkout: null },
    Biceps: { recoveryTime: 48, lastWorkout: null },
    Triceps: { recoveryTime: 48, lastWorkout: null },
    Back: { recoveryTime: 72, lastWorkout: null },
    Shoulders: { recoveryTime: 48, lastWorkout: null },
    Core: { recoveryTime: 24, lastWorkout: null },
    Quads: { recoveryTime: 72, lastWorkout: null },
    Hamstrings: { recoveryTime: 72, lastWorkout: null },
    Calves: { recoveryTime: 48, lastWorkout: null },
    Glutes: { recoveryTime: 72, lastWorkout: null }
  };

  // Merge data from context with default structure
  const muscleGroups = { ...defaultMuscleGroups };
  if (muscleRecoveryData) {
    Object.entries(muscleRecoveryData).forEach(([muscleKey, data]) => {
      const displayName =
        muscleKey.charAt(0).toUpperCase() + muscleKey.slice(1);
      const displayNameToUse = muscleKey === "abs" ? "Core" : displayName;

      if (muscleGroups[displayNameToUse]) {
        muscleGroups[displayNameToUse] = {
          ...muscleGroups[displayNameToUse],
          lastWorkout: data.lastWorkout,
          recoveryTime:
            data.recoveryTime || muscleGroups[displayNameToUse].recoveryTime
        };
      }
    });
  }

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" }
        ]}
      >
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.subtitle}>Loading recovery data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recovery Guide</Text>
        <Text style={styles.subtitle}>Track your muscle recovery status</Text>
        <Text style={styles.workoutCount}>
          Total Workouts: {userStats?.totalWorkouts || 0}
        </Text>
      </View>

      <View style={styles.content}>
        {Object.entries(muscleGroups).map(([muscle, data]) => (
          <MuscleRecoveryMeter
            key={muscle}
            muscleName={muscle}
            lastWorkout={data.lastWorkout}
            recoveryTime={data.recoveryTime}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default RecoveryGuideScreen;
