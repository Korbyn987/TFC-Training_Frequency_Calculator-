import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from "../config/supabase";
import {
  clearActiveWorkout,
  hasActiveWorkout,
  loadActiveWorkout
} from "../services/localWorkoutStorage";
import { getCurrentUser } from "../services/supabaseAuth";
import { getUserStats } from "../services/supabaseWorkouts";

const NewHomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingWorkout, setStartingWorkout] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Get current user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigation.navigate("Login");
        return;
      }
      setUser(currentUser);

      // Load user stats
      const statsResult = await getUserStats(currentUser.id);
      if (statsResult.success) {
        setUserStats(statsResult.stats);
      }

      // Check for active workout
      const activeResult = await hasActiveWorkout();
      if (activeResult.success && activeResult.hasActive) {
        const workoutResult = await loadActiveWorkout();
        if (workoutResult.success && workoutResult.workout) {
          setActiveWorkout(workoutResult.workout);
        }
      } else {
        setActiveWorkout(null);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async () => {
    try {
      setStartingWorkout(true);

      // Navigate directly to ConfigureWorkout screen
      navigation.navigate("ConfigureWorkout");
    } catch (error) {
      console.error("Error starting workout:", error);
      Alert.alert("Error", "Failed to start workout. Please try again.");
    } finally {
      setStartingWorkout(false);
    }
  };

  const handleContinueWorkout = () => {
    navigation.navigate("ConfigureWorkout");
  };

  const handleViewHistory = () => {
    navigation.navigate("Profile");
  };

  const handleRecoveryGuide = () => {
    navigation.navigate("RecoveryGuide");
  };

  const handleEndWorkout = async () => {
    try {
      setLoading(true);

      if (!activeWorkout || !activeWorkout.supabase_id) {
        Alert.alert("Error", "No active workout found to complete.");
        return;
      }

      // Calculate workout duration
      const startTime = new Date(activeWorkout.start_time);
      const endTime = new Date();
      const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));

      // Update the existing workout in Supabase to mark it as completed
      const { data: completedWorkout, error: updateError } = await supabase
        .from("workouts")
        .update({
          completed_at: endTime.toISOString(),
          duration_minutes: durationMinutes,
          notes:
            activeWorkout.notes ||
            `Completed workout with ${
              activeWorkout.exercises?.length || 0
            } exercises`
        })
        .eq("id", activeWorkout.supabase_id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error completing workout:", updateError);
        Alert.alert(
          "Error",
          "Failed to save workout completion. Please try again."
        );
        return;
      }

      // Update user stats
      const { data: currentStats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const updatedStats = {
        user_id: user.id,
        total_workouts: (currentStats?.total_workouts || 0) + 1,
        total_duration_minutes:
          (currentStats?.total_duration_minutes || 0) + durationMinutes,
        last_workout_date: endTime.toISOString()
      };

      await supabase.from("user_stats").upsert([updatedStats]);

      // Clear active workout from local storage
      await clearActiveWorkout();

      // Update local state
      setActiveWorkout(null);

      // Reload user data to refresh stats
      await loadUserData();

      Alert.alert(
        "Workout Completed! 🎉",
        `Great job! You completed your workout in ${durationMinutes} minutes.`,
        [
          {
            text: "View History",
            onPress: () => navigation.navigate("Profile")
          },
          {
            text: "OK",
            style: "default"
          }
        ]
      );
    } catch (error) {
      console.error("Error ending workout:", error);
      Alert.alert("Error", "Failed to end workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b46c1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>
          {user?.username || user?.name || "User"}!
        </Text>
      </View>

      {/* User Stats Card */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Your Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {userStats?.total_workouts || 0}
            </Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round((userStats?.total_duration_minutes || 0) / 60)}h
            </Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {userStats?.last_workout_date
                ? new Date(userStats.last_workout_date).toLocaleDateString()
                : "Never"}
            </Text>
            <Text style={styles.statLabel}>Last Workout</Text>
          </View>
        </View>
      </View>

      {/* Active Workout Card */}
      {activeWorkout ? (
        <View style={styles.activeWorkoutCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="fitness" size={24} color="#6b46c1" />
              <Text style={styles.cardTitle}>Active Workout</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate("ConfigureWorkout", {
                  exercises: activeWorkout.exercises || [],
                  workoutName: activeWorkout.name,
                  editingActive: true
                })
              }
            >
              <Ionicons name="create" size={18} color="#6b46c1" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.workoutName}>{activeWorkout.name}</Text>
          <Text style={styles.workoutTime}>
            Started: {new Date(activeWorkout.start_time).toLocaleTimeString()}
          </Text>

          {/* Display configured exercises if available */}
          {activeWorkout.exercises && activeWorkout.exercises.length > 0 && (
            <View style={styles.exercisesList}>
              <Text style={styles.exercisesTitle}>
                Exercises ({activeWorkout.exercises.length}):
              </Text>
              {activeWorkout.exercises.slice(0, 3).map((exercise, index) => (
                <Text key={index} style={styles.exerciseItem}>
                  • {exercise.name}
                </Text>
              ))}
              {activeWorkout.exercises.length > 3 && (
                <Text style={styles.exerciseItem}>
                  • +{activeWorkout.exercises.length - 3} more...
                </Text>
              )}
            </View>
          )}

          {/* Display muscle groups if available */}
          {activeWorkout.muscle_groups &&
            activeWorkout.muscle_groups.length > 0 && (
              <Text style={styles.muscleGroups}>
                Target: {activeWorkout.muscle_groups.join(", ")}
              </Text>
            )}

          <TouchableOpacity style={styles.endButton} onPress={handleEndWorkout}>
            <Text style={styles.endButtonText}>End Workout</Text>
            <Ionicons name="stop" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.startWorkoutCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="add-circle" size={24} color="#6b46c1" />
            <Text style={styles.cardTitle}>Ready to Train?</Text>
          </View>
          <Text style={styles.cardDescription}>
            Start a new workout session and track your progress
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}
            disabled={startingWorkout}
          >
            {startingWorkout ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.startButtonText}>Start Workout</Text>
                <Ionicons name="play" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewHistory}
          >
            <Ionicons name="bar-chart" size={32} color="#6b46c1" />
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRecoveryGuide}
          >
            <Ionicons name="heart" size={32} color="#6b46c1" />
            <Text style={styles.actionText}>Recovery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Motivational Quote */}
      <View style={styles.quoteCard}>
        <Text style={styles.quote}>
          "The groundwork for all happiness is good health."
        </Text>
        <Text style={styles.quoteAuthor}>- Leigh Hunt</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1c2e"
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1c2e"
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16
  },
  header: {
    marginBottom: 30
  },
  welcomeText: {
    fontSize: 18,
    color: "#999",
    marginBottom: 5
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff"
  },
  statsCard: {
    backgroundColor: "#23263a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333"
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  statItem: {
    alignItems: "center",
    flex: 1
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6b46c1",
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    textAlign: "center"
  },
  activeWorkoutCard: {
    backgroundColor: "#23263a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#6b46c1"
  },
  startWorkoutCard: {
    backgroundColor: "#23263a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333"
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  workoutName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 5
  },
  workoutTime: {
    fontSize: 14,
    color: "#999",
    marginBottom: 15
  },
  cardDescription: {
    fontSize: 16,
    color: "#999",
    marginBottom: 20,
    lineHeight: 22
  },
  startButton: {
    backgroundColor: "#6b46c1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 12
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8
  },
  quickActionsCard: {
    backgroundColor: "#23263a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333"
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
    padding: 15
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8
  },
  quoteCard: {
    backgroundColor: "rgba(107, 70, 193, 0.1)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(107, 70, 193, 0.3)"
  },
  quote: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 24
  },
  quoteAuthor: {
    fontSize: 14,
    color: "#6b46c1",
    textAlign: "center",
    fontWeight: "500"
  },
  exercisesList: {
    marginBottom: 20
  },
  exercisesTitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 10
  },
  exerciseItem: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 5
  },
  muscleGroups: {
    fontSize: 14,
    color: "#999",
    marginBottom: 15
  },
  editButton: {
    backgroundColor: "#23263a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6b46c1"
  },
  editButtonText: {
    color: "#6b46c1",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5
  },
  endButton: {
    backgroundColor: "#6b46c1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12
  },
  endButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8
  }
});

export default NewHomeScreen;
