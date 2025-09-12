import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserMuscleRecoveryData } from "../services/recoveryService";
import { getCurrentUser } from "../services/supabaseAuth";
import {
  getUserStats,
  getUserWorkoutHistory
} from "../services/supabaseWorkouts";

const TabDataContext = createContext();

export const useTabData = () => useContext(TabDataContext);

export const TabDataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [muscleRecoveryData, setMuscleRecoveryData] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAllTabData = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        // Fetch active workout from AsyncStorage first
        const activeWorkoutJson = await AsyncStorage.getItem("activeWorkout");
        if (activeWorkoutJson) {
          setActiveWorkout(JSON.parse(activeWorkoutJson));
        }

        const results = await Promise.allSettled([
          getUserStats(currentUser.user_metadata?.id),
          getUserWorkoutHistory(currentUser.user_metadata?.id, 30),
          getUserMuscleRecoveryData() // No user ID needed, it gets it from auth state
        ]);

        const statsResult = results[0];
        const historyResult = results[1];
        const recoveryResult = results[2];

        if (statsResult.status === "fulfilled" && statsResult.value.success) {
          setUserStats(statsResult.value.stats);
        }

        if (
          historyResult.status === "fulfilled" &&
          historyResult.value.success
        ) {
          setWorkoutHistory(historyResult.value.workouts);
          setRecentWorkouts(historyResult.value.workouts.slice(0, 7));
        }

        if (recoveryResult.status === "fulfilled" && recoveryResult.value) {
          setMuscleRecoveryData(recoveryResult.value);
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
    setMuscleRecoveryData // Expose for optimistic updates
  };

  return (
    <TabDataContext.Provider value={value}>{children}</TabDataContext.Provider>
  );
};
