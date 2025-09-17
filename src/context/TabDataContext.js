import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const TabDataContext = createContext();

export const useTabData = () => useContext(TabDataContext);

// Mock data for development
const mockUser = {
  id: "mock-user-id",
  username: "TestUser",
  display_name: "Test User",
  email: "test@example.com",
  is_premium: true,
  user_metadata: {
    id: "mock-user-id",
    username: "TestUser",
    display_name: "Test User"
  }
};

const mockUserStats = {
  totalWorkouts: 15,
  currentStreak: 3,
  workoutsThisMonth: 8,
  averageWorkoutTime: 45,
  totalTime: 675,
  personalRecord: {
    weight: 100,
    exercise: "Bench Press"
  }
};

const mockMuscleRecoveryData = {
  chest: {
    lastWorked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    recoveryTime: 48
  },
  back: {
    lastWorked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    recoveryTime: 48
  },
  legs: {
    lastWorked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    recoveryTime: 72
  }
};

// Check if we're in development mode
const isDevelopment = false; // Set to false to use production logic

export const TabDataProvider = ({ children }) => {
  const [user, setUser] = useState(isDevelopment ? mockUser : null);
  const [userStats, setUserStats] = useState(
    isDevelopment ? mockUserStats : null
  );
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [muscleRecoveryData, setMuscleRecoveryData] = useState(
    isDevelopment ? mockMuscleRecoveryData : null
  );
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [loading, setLoading] = useState(!isDevelopment);
  const [error, setError] = useState(null);

  const loadAllTabData = async () => {
    try {
      setLoading(true);

      const activeWorkoutJson = await AsyncStorage.getItem("activeWorkout");
      if (activeWorkoutJson) {
        setActiveWorkout(JSON.parse(activeWorkoutJson));
      }

      if (isDevelopment) {
        console.log(" Development mode: Using mock data");
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        console.log(" Production mode: Loading real data");

        const { getCurrentUser } = await import("../services/supabaseAuth");
        const { getUserStats, getUserWorkoutHistory } = await import(
          "../services/supabaseWorkouts"
        );
        const { getUserMuscleRecoveryData } = await import(
          "../services/recoveryService"
        );

        const currentUser = await getCurrentUser();

        let normalizedUser = null;
        if (currentUser) {
          normalizedUser = {
            ...currentUser,
            username:
              currentUser.user_metadata?.username || currentUser.username,
            display_name:
              currentUser.user_metadata?.display_name ||
              currentUser.display_name ||
              currentUser.user_metadata?.username ||
              currentUser.username,
            id: currentUser.user_metadata?.id, // Use the correct database ID
            is_premium: currentUser.user_metadata?.is_premium || false
          };
        }

        setUser(normalizedUser);

        if (normalizedUser) {
          const results = await Promise.allSettled([
            getUserStats(normalizedUser.id),
            getUserWorkoutHistory(normalizedUser.id, 30),
            getUserMuscleRecoveryData()
          ]);

          const [statsResult, historyResult, recoveryResult] = results;

          if (statsResult.status === "fulfilled" && statsResult.value.success) {
            setUserStats(statsResult.value.stats);
          } else if (
            statsResult.status === "rejected" ||
            !statsResult.value.success
          ) {
            console.error(
              "Failed to load user stats:",
              statsResult.reason || statsResult.value.error
            );
          }

          if (
            historyResult.status === "fulfilled" &&
            historyResult.value.success
          ) {
            setWorkoutHistory(historyResult.value.workouts);
            setRecentWorkouts(historyResult.value.workouts.slice(0, 7));
          } else if (
            historyResult.status === "rejected" ||
            !historyResult.value.success
          ) {
            console.error(
              "Failed to load workout history:",
              historyResult.reason || historyResult.value.error
            );
          }

          if (recoveryResult.status === "fulfilled" && recoveryResult.value) {
            setMuscleRecoveryData(recoveryResult.value);
          } else if (recoveryResult.status === "rejected") {
            console.error(
              "Failed to load recovery data:",
              recoveryResult.reason
            );
          }
        }
      }
    } catch (e) {
      setError(e);
      console.error("Failed to load tab data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllTabData();
  }, []);

  const refreshTabData = async () => {
    await loadAllTabData();
  };

  const saveWorkout = async (workoutData) => {
    // Always use production logic now
    console.log("Production saveWorkout called with:", workoutData.name);
    const { saveWorkout: saveWorkoutToSupabase, getWorkoutDetails } =
      await import("../services/supabaseWorkouts");

    const result = await saveWorkoutToSupabase(workoutData);

    if (result.success) {
      // Fetch the complete workout details to ensure we have all sets data
      const detailsResult = await getWorkoutDetails(result.workout.id);

      if (detailsResult.success) {
        const completeWorkout = detailsResult.workout;
        setActiveWorkout(completeWorkout);
        await AsyncStorage.setItem(
          "activeWorkout",
          JSON.stringify(completeWorkout)
        );
        console.log(
          "Saving new workout to AsyncStorage with complete details:",
          completeWorkout
        );
      } else {
        // Fallback to the original workout if details fetch fails
        setActiveWorkout(result.workout);
        await AsyncStorage.setItem(
          "activeWorkout",
          JSON.stringify(result.workout)
        );
      }

      // Refresh other data that might be affected by a new workout
      await refreshTabData();
    }

    return result;
  };

  const value = {
    user,
    userStats,
    workoutHistory,
    recentWorkouts,
    muscleRecoveryData,
    activeWorkout,
    loading,
    error,
    refreshTabData,
    setActiveWorkout,
    setMuscleRecoveryData,
    saveWorkout
  };

  return (
    <TabDataContext.Provider value={value}>{children}</TabDataContext.Provider>
  );
};
