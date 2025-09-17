import React, { useEffect, useRef, useState } from "react";
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

  // Use a ref to hold the latest props to avoid stale closures in setInterval
  const latestProps = useRef({ lastWorkout, recoveryTime });
  useEffect(() => {
    latestProps.current = { lastWorkout, recoveryTime };
  });

  useEffect(() => {
    const calculateRecovery = () => {
      const { lastWorkout, recoveryTime } = latestProps.current;
      const now = new Date();

      if (!lastWorkout) {
        setPercentage(100);
        setTimeLeft(0);
        setStatus("Fully Recovered");
        setStatusDetails("Ready to train");
        setNextAvailable(new Date());
        return;
      }

      const workoutDate = new Date(lastWorkout);
      if (isNaN(workoutDate.getTime())) {
        setPercentage(100);
        setTimeLeft(0);
        setStatus("Fully Recovered");
        setStatusDetails("Invalid date");
        setNextAvailable(new Date());
        return;
      }

      // Ensure we're working with the correct UTC time
      // The lastWorkout timestamp from the database is already in UTC
      const workoutDateUTC = new Date(
        lastWorkout + (lastWorkout.includes("Z") ? "" : "Z")
      );

      const recoveryTimeInSeconds = recoveryTime * 3600;
      const nextAvailableTime = new Date(
        workoutDateUTC.getTime() + recoveryTimeInSeconds * 1000
      );

      let timeLeftInSeconds = Math.max(0, (nextAvailableTime - now) / 1000);

      if (timeLeftInSeconds > recoveryTimeInSeconds) {
        timeLeftInSeconds = recoveryTimeInSeconds;
      }

      const percentage =
        recoveryTimeInSeconds > 0
          ? Math.min(
              100,
              ((recoveryTimeInSeconds - timeLeftInSeconds) /
                recoveryTimeInSeconds) *
                100
            )
          : 100;

      let status, statusDetails;
      if (timeLeftInSeconds <= 0) {
        status = "Fully Recovered";
        statusDetails = "Ready to train";
      } else {
        status = "Recovering";
        const days = Math.floor(timeLeftInSeconds / 86400);
        const hours = Math.floor((timeLeftInSeconds % 86400) / 3600);
        const minutes = Math.floor((timeLeftInSeconds % 3600) / 60);

        if (days > 0) {
          if (hours === 0 && minutes < 1) {
            statusDetails = `Ready in ~${days}d`;
          } else {
            statusDetails = `Ready in ~${days}d ${hours}h`;
          }
        } else if (hours > 0) {
          statusDetails = `Ready in ~${hours}h ${minutes}m`;
        } else {
          statusDetails = `Ready in ~${minutes}m`;
        }
      }

      setTimeLeft(timeLeftInSeconds / 3600);
      setPercentage(percentage);
      setStatus(status);
      setStatusDetails(statusDetails);
      setNextAvailable(
        new Date(
          nextAvailableTime.getTime() +
            workoutDate.getTimezoneOffset() * 60 * 1000
        )
      );
    };

    calculateRecovery(); // Initial call
    const interval = setInterval(calculateRecovery, 1000);

    return () => clearInterval(interval);
  }, []); // Run this effect only once

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
              Ready by:{" "}
              {(() => {
                // Convert UTC time to local time for display
                const localTime = new Date(
                  nextAvailable.getTime() -
                    new Date().getTimezoneOffset() * 60000
                );
                return localTime.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true
                });
              })()}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const RecoveryGuideScreen = () => {
  const { userStats, muscleRecoveryData, loading } = useTabData();
  const [workoutCount, setWorkoutCount] = useState(0);
  const [muscleGroups, setMuscleGroups] = useState(muscleRecoveryData);

  useEffect(() => {
    setMuscleGroups(muscleRecoveryData);
  }, [muscleRecoveryData]);

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

  // Robust, case-insensitive merging logic
  const finalMergedMuscleGroups = {};
  const normalizedRecoveryData = {};

  if (muscleRecoveryData) {
    for (const [key, value] of Object.entries(muscleRecoveryData)) {
      const normalizedKey =
        key.toLowerCase() === "abs" ? "core" : key.toLowerCase();
      normalizedRecoveryData[normalizedKey] = value;
    }
  }

  for (const [defaultKey, defaultValue] of Object.entries(
    defaultMuscleGroups
  )) {
    const normalizedDefaultKey = defaultKey.toLowerCase();
    const recoveryData = normalizedRecoveryData[normalizedDefaultKey];

    if (recoveryData) {
      finalMergedMuscleGroups[defaultKey] = {
        ...defaultValue,
        lastWorkout: recoveryData.lastWorkout,
        recoveryTime: recoveryData.recoveryTime || defaultValue.recoveryTime
      };
    } else {
      finalMergedMuscleGroups[defaultKey] = defaultValue;
    }
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
        {Object.entries(finalMergedMuscleGroups).map(([muscle, data]) => (
          <MuscleRecoveryMeter
            key={`${muscle}-${data.lastWorkout}`}
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
