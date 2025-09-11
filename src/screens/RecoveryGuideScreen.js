import { useFocusEffect } from "@react-navigation/native";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../config/supabase";
import { syncMuscleRecoveryData } from "../redux/workoutSlice";
import { getUserMuscleRecoveryData } from "../services/recoveryService";
import { getCurrentUser } from "../services/supabaseAuth";
import { styles } from "../styles/recoveryGuideStyles";

const MUSCLE_RECOVERY_TIMES = {
  Biceps: 48,
  Triceps: 72,
  Chest: 72,
  Shoulders: 48, // Combined all deltoid parts into one
  Back: 72, // Combined all back muscles
  Glutes: 62,
  Calves: 48,
  Quadriceps: 72,
  Hamstrings: 72,
  Core: 48
};

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
      console.log(
        `Muscle ${muscleName}: No last workout date - considering fully rested`
      );
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
        console.warn(
          `Muscle ${muscleName}: Invalid workout date:`,
          lastWorkout
        );
        setPercentage(100);
        setTimeLeft(0);
        setStatus("Fully Recovered");
        setStatusDetails("Invalid workout date");
        setNextAvailable(now);
        return;
      }

      // Calculate time difference in seconds for more precise countdown
      const timeDiffInSeconds = (now - workoutDate) / 1000;
      const recoveryTimeInSeconds = recoveryTime * 3600; // Convert hours to seconds
      const timeLeftInSeconds = Math.max(
        0,
        recoveryTimeInSeconds - timeDiffInSeconds
      );
      const timeLeftInHours = timeLeftInSeconds / 3600; // Convert back to hours for percentage
      const percentage = Math.min(
        100,
        ((recoveryTimeInSeconds - timeLeftInSeconds) / recoveryTimeInSeconds) *
          100
      );

      // Calculate next available time
      const nextAvailableTime = new Date(workoutDate);
      nextAvailableTime.setHours(nextAvailableTime.getHours() + recoveryTime);

      let status, statusDetails;

      if (timeLeftInSeconds <= 0) {
        status = "Fully Recovered";
        statusDetails = "Ready to train";
      } else {
        status = "Recovering";
        // Format time left with days, hours, minutes, and seconds
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

    // Calculate immediately
    calculateRecovery();

    // Update every second for smooth countdown
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

  // Format the remaining time for countdown with seconds
  const formatTimeLeft = (hours) => {
    if (hours <= 0) return "Now";

    // Convert hours to seconds for more precise calculation
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

  // Determine the color based on status
  const getStatusColor = () => {
    if (status === "Fully Recovered") return "#10b981"; // Green
    if (status === "Recovering") return timeLeft < 24 ? "#f59e0b" : "#ef4444"; // Yellow if <24h, else Red
    return "#ef4444"; // Red
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const dispatch = useDispatch();

  // Check authentication status on mount and focus
  const checkAuthStatus = async () => {
    try {
      const user = await getCurrentUser();
      console.log(
        "RecoveryGuideScreen: Auth check result:",
        user ? "User authenticated" : "No user"
      );
      setCurrentUser(user);
      if (!user) {
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error("RecoveryGuideScreen: Error checking auth status:", error);
      setShowLoginModal(true);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Load real workout data from Supabase when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      console.log("RecoveryGuideScreen: useFocusEffect triggered");

      const loadRecoveryData = async () => {
        // Always check current auth status first
        await checkAuthStatus();
        const user = await getCurrentUser();

        console.log(
          "RecoveryGuideScreen: Current auth status:",
          user ? "User authenticated" : "No user"
        );

        if (!user) {
          console.log("RecoveryGuideScreen: No user found, skipping data load");
          return;
        }

        console.log("RecoveryGuideScreen: Starting to load recovery data...");
        setIsLoading(true);
        try {
          // Load recovery data
          console.log(
            "RecoveryGuideScreen: Calling getUserMuscleRecoveryData..."
          );
          const recoveryData = await getUserMuscleRecoveryData();
          console.log(
            "RecoveryGuideScreen: Recovery data received:",
            recoveryData
          );

          if (recoveryData) {
            console.log(
              "RecoveryGuideScreen: Dispatching syncMuscleRecoveryData..."
            );
            // Only sync data for muscle groups that don't have recent Redux updates
            // This prevents overriding immediate timer resets from workout completion
            const currentReduxState = muscleStatus;
            const filteredRecoveryData = {};

            Object.keys(recoveryData).forEach((muscle) => {
              const reduxData = currentReduxState[muscle];
              const supabaseData = recoveryData[muscle];

              // If Redux has a more recent workout date, keep Redux data
              if (reduxData?.lastWorkout && supabaseData?.lastWorkout) {
                const reduxDate = new Date(reduxData.lastWorkout);
                const supabaseDate = new Date(supabaseData.lastWorkout);

                if (reduxDate > supabaseDate) {
                  console.log(
                    `RecoveryGuideScreen: Keeping Redux data for ${muscle} (more recent)`
                  );
                  filteredRecoveryData[muscle] = reduxData;
                } else {
                  filteredRecoveryData[muscle] = supabaseData;
                }
              } else if (reduxData?.lastWorkout && !supabaseData?.lastWorkout) {
                // Redux has data but Supabase doesn't - keep Redux
                console.log(
                  `RecoveryGuideScreen: Keeping Redux data for ${muscle} (Supabase has no data)`
                );
                filteredRecoveryData[muscle] = reduxData;
              } else {
                // Use Supabase data
                filteredRecoveryData[muscle] = supabaseData;
              }
            });

            dispatch(
              syncMuscleRecoveryData({ recoveryData: filteredRecoveryData })
            );
          } else {
            console.log(
              "RecoveryGuideScreen: No recovery data received from service"
            );
          }

          // Load actual workout count from Supabase
          console.log(
            "RecoveryGuideScreen: Loading workout count from Supabase..."
          );
          console.log("RecoveryGuideScreen: Using user ID:", user.id);

          // Get user's profile ID for RLS compliance
          const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("id")
            .eq("auth_user_id", user.id)
            .single();

          console.log("RecoveryGuideScreen: Profile query result:", {
            userProfile,
            profileError
          });

          if (!profileError && userProfile) {
            console.log(
              "RecoveryGuideScreen: User profile found:",
              userProfile.id
            );
            // Count completed workouts
            const { count, error: countError } = await supabase
              .from("workouts")
              .select("*", { count: "exact", head: true })
              .eq("user_id", userProfile.id)
              .not("completed_at", "is", null);

            console.log("RecoveryGuideScreen: Workout count query result:", {
              count,
              countError
            });

            if (!countError) {
              console.log(
                "RecoveryGuideScreen: Found",
                count,
                "completed workouts in Supabase"
              );
              setWorkoutCount(count || 0);
            } else {
              console.error(
                "RecoveryGuideScreen: Error counting workouts:",
                countError
              );
            }
          } else {
            console.error(
              "RecoveryGuideScreen: Error finding user profile:",
              profileError
            );
          }
        } catch (error) {
          console.error(
            "RecoveryGuideScreen: Error loading recovery data:",
            error
          );
        } finally {
          setIsLoading(false);
          console.log("RecoveryGuideScreen: Finished loading recovery data");
        }
      };

      loadRecoveryData();
    }, [dispatch])
  );

  // Get the muscle status from Redux store
  const muscleStatus =
    useSelector((state) => state.workout?.muscleStatus) || {};

  console.log(
    "RecoveryGuideScreen - Raw muscle status from Redux:",
    muscleStatus
  );
  console.log("RecoveryGuideScreen - Supabase workout count:", workoutCount);

  // Default muscle groups with their recovery times (in hours)
  const defaultMuscleGroups = {
    Chest: { recoveryTime: 72 },
    Biceps: { recoveryTime: 48 },
    Triceps: { recoveryTime: 48 },
    Back: { recoveryTime: 72 }, // This covers all back muscles
    Shoulders: { recoveryTime: 48 },
    Core: { recoveryTime: 24 }, // Maps to 'abs' in Redux
    Quads: { recoveryTime: 72 },
    Hamstrings: { recoveryTime: 72 },
    Calves: { recoveryTime: 48 },
    Glutes: { recoveryTime: 72 }
  };

  // Create a map of muscle display names to their status
  const muscleGroups = { ...defaultMuscleGroups };

  // Update with actual data from Redux
  Object.entries(muscleStatus).forEach(([muscleKey, data]) => {
    // Convert the key to display name (capitalized first letter)
    const displayName = muscleKey.charAt(0).toUpperCase() + muscleKey.slice(1);

    // Special case for 'abs' which is stored as 'abs' but displayed as 'Core'
    const displayNameToUse = muscleKey === "abs" ? "Core" : displayName;

    if (muscleGroups[displayNameToUse]) {
      muscleGroups[displayNameToUse] = {
        ...muscleGroups[displayNameToUse],
        lastWorkout: data.lastWorkout,
        recoveryTime:
          data.recoveryTime ||
          defaultMuscleGroups[displayNameToUse]?.recoveryTime ||
          48
      };
      console.log(`Updated muscle group ${displayNameToUse} with data:`, data);
    } else {
      console.warn(
        `No matching display name for muscle key: ${muscleKey} (tried ${displayName} and ${displayNameToUse})`
      );
    }
  });

  // Log the final processed data for debugging
  console.log("Final muscle groups with recovery data:", muscleGroups);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recovery Guide</Text>
        <Text style={styles.subtitle}>
          {isLoading
            ? "Loading recovery data..."
            : "Track your muscle recovery status"}
        </Text>
        <Text style={styles.workoutCount}>Total Workouts: {workoutCount}</Text>
      </View>

      <View style={styles.content}>
        {Object.entries(muscleGroups)
          .filter(([muscle]) => !["Traps", "Trapezius"].includes(muscle)) // Exclude Traps/Trapezius
          .map(([muscle, data]) => {
            const recoveryTime = data.recoveryTime || 48; // Default to 48 hours if not set
            return (
              <MuscleRecoveryMeter
                key={muscle}
                muscleName={muscle}
                lastWorkout={data.lastWorkout}
                recoveryTime={recoveryTime}
              />
            );
          })}
      </View>
    </ScrollView>
  );
};

export default RecoveryGuideScreen;
