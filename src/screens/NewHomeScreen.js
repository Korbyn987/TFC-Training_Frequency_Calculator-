import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
// import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { resetMuscleRecovery } from "../redux/workoutSlice";
import { getCurrentUser } from "../services/supabaseAuth";
import {
  addExerciseSet,
  addWorkoutExercise,
  completeWorkout,
  createWorkout,
  getUserStats,
  getUserWorkoutHistory
} from "../services/supabaseWorkouts";

const { width: screenWidth } = Dimensions.get("window");

const NewHomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        navigation.navigate("Login");
        return;
      }

      setUser(currentUser);

      // Load user stats
      const statsResult = await getUserStats(currentUser.id);
      const stats = statsResult.success ? statsResult.stats : null;
      setUserStats(stats);

      // Load recent workouts
      const workoutsResult = await getUserWorkoutHistory(currentUser.id, 7);
      const workouts = workoutsResult.success ? workoutsResult.workouts : [];
      setRecentWorkouts(workouts);

      // Check for active workouts with configured exercises
      const storedActiveWorkout = await AsyncStorage.getItem("activeWorkout");
      let hasActiveWorkoutWithExercises = false;

      if (storedActiveWorkout) {
        const parsedWorkout = JSON.parse(storedActiveWorkout);
        // Only consider it active if it has exercises configured
        if (
          parsedWorkout &&
          parsedWorkout.exercises &&
          parsedWorkout.exercises.length > 0
        ) {
          setActiveWorkout(parsedWorkout);
          hasActiveWorkoutWithExercises = true;
        }
      }

      // If no active workout in AsyncStorage, check database for incomplete workouts with exercises
      if (!hasActiveWorkoutWithExercises) {
        const incompleteWorkout = workouts.find((w) => !w.completed_at);
        if (incompleteWorkout) {
          // Check if this workout has exercises configured
          // For now, we'll assume database workouts without exercises are not "active"
          // You may need to add a check here if you store exercise data in the database
          // For this implementation, we'll only show active workout if it has exercises in AsyncStorage
        }
        // Always set to null if no valid active workout with exercises
        setActiveWorkout(null);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = () => {
    navigation.navigate("WorkoutOptions");
  };

  const handleContinueWorkout = () => {
    if (activeWorkout) {
      navigation.navigate("WorkoutOptions", {
        workoutId: activeWorkout.id,
        continue: true
      });
    }
  };

  const handleEndWorkout = async () => {
    if (!activeWorkout) return;

    try {
      console.log("NewHomeScreen: Starting workout completion...");
      console.log(
        "NewHomeScreen: Active workout data:",
        JSON.stringify(activeWorkout, null, 2)
      );

      // Extract muscle groups from exercises for recovery timer reset
      const muscleGroups = [];
      if (activeWorkout.exercises && activeWorkout.exercises.length > 0) {
        console.log("NewHomeScreen: Processing exercises for muscle groups...");
        activeWorkout.exercises.forEach((exercise) => {
          // Try multiple possible muscle group locations in the data structure
          const muscleGroup =
            exercise.target_muscle ||
            exercise.muscle_group ||
            exercise.muscle_groups?.name ||
            (exercise.muscle_groups &&
            typeof exercise.muscle_groups === "string"
              ? exercise.muscle_groups
              : null);

          console.log(
            `NewHomeScreen: Exercise "${exercise.name}" has muscle group: ${muscleGroup}`
          );
          console.log(
            `NewHomeScreen: Exercise data structure:`,
            JSON.stringify(exercise.muscle_groups, null, 2)
          );

          if (
            muscleGroup &&
            muscleGroup !== "Unknown" &&
            !muscleGroups.includes(muscleGroup)
          ) {
            muscleGroups.push(muscleGroup);
            console.log(`NewHomeScreen: Added muscle group: ${muscleGroup}`);
          }
        });
      }

      console.log(
        "NewHomeScreen: Final extracted muscle groups:",
        muscleGroups
      );

      // Create workout in Supabase
      const workoutData = {
        name: activeWorkout.name,
        notes: `Workout with ${activeWorkout.exercises?.length || 0} exercises`
      };

      console.log("NewHomeScreen: Creating workout with data:", workoutData);
      const result = await createWorkout(workoutData);

      if (!result.success) {
        throw new Error(result.error);
      }

      const newWorkoutId = result.workout.id;
      console.log("NewHomeScreen: Created workout with ID:", newWorkoutId);

      // Save individual exercises with their sets
      for (let i = 0; i < activeWorkout.exercises.length; i++) {
        const exercise = activeWorkout.exercises[i];

        console.log(`NewHomeScreen: Adding exercise ${i + 1}:`, exercise.name);
        const exerciseResult = await addWorkoutExercise(newWorkoutId, {
          exercise_id: exercise.id,
          exercise_name: exercise.name,
          muscle_group:
            exercise.muscle_groups?.name ||
            exercise.target_muscle ||
            exercise.muscle_group ||
            "Unknown",
          order_index: i,
          target_sets: exercise.sets?.length || 0
        });

        if (!exerciseResult.success) {
          console.error(
            "NewHomeScreen: Error adding exercise:",
            exerciseResult.error
          );
          continue;
        }

        const workoutExerciseId = exerciseResult.workoutExercise.id;
        console.log(
          `NewHomeScreen: Added exercise with workout_exercise ID:`,
          workoutExerciseId
        );

        // Add sets for this exercise
        if (exercise.sets && exercise.sets.length > 0) {
          for (let j = 0; j < exercise.sets.length; j++) {
            const set = exercise.sets[j];

            await addExerciseSet(workoutExerciseId, {
              set_number: j + 1,
              set_type: set.set_type || "normal",
              reps: set.reps || 0,
              weight: set.weight || 0
            });
          }
        }
      }

      // Complete the workout with muscle groups for recovery timer reset
      console.log(
        "NewHomeScreen: Completing workout with muscle groups:",
        muscleGroups
      );
      await completeWorkout(newWorkoutId, {
        duration_minutes: Math.floor(
          (new Date() - new Date(activeWorkout.started_at)) / (1000 * 60)
        ),
        notes: "Workout completed",
        muscle_groups: muscleGroups // Pass muscle groups for recovery reset
      });

      // Reset muscle recovery timers in Redux
      if (muscleGroups.length > 0) {
        console.log(
          "NewHomeScreen: Dispatching resetMuscleRecovery for:",
          muscleGroups
        );
        dispatch(resetMuscleRecovery({ muscleGroups }));
        console.log(
          "NewHomeScreen: Reset recovery timers for muscle groups:",
          muscleGroups
        );
      } else {
        console.warn(
          "NewHomeScreen: No muscle groups found to reset recovery timers"
        );
      }

      // Clear AsyncStorage and local state
      await AsyncStorage.removeItem("activeWorkout");
      setActiveWorkout(null);

      Alert.alert("Success", "Workout completed successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Stay on home screen to show "Start New Workout" section
          }
        }
      ]);
    } catch (error) {
      console.error("NewHomeScreen: Error completing workout:", error);
      Alert.alert("Error", "Failed to complete workout. Please try again.");
    }
  };

  const handleDeleteActiveWorkout = async () => {
    if (!activeWorkout) return;

    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this active workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // await deleteWorkout(activeWorkout.id);
              setActiveWorkout(null);
              await AsyncStorage.removeItem("activeWorkout");
              Alert.alert("Success", "Workout deleted successfully");
            } catch (error) {
              console.error("Error deleting workout:", error);
              Alert.alert("Error", "Failed to delete workout");
            }
          }
        }
      ]
    );
  };

  const renderChart = () => {
    if (!recentWorkouts || recentWorkouts.length < 2) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Training Volume Trend</Text>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              Complete more workouts to see your progress chart
            </Text>
          </View>
        </View>
      );
    }

    const chartData = {
      labels: recentWorkouts.slice(-6).map((_, index) => `W${index + 1}`),
      datasets: [
        {
          data: recentWorkouts
            .slice(-6)
            .map((workout) => workout.total_volume || 0),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Training Volume Trend</Text>
        {/* <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            backgroundColor: "#23263a",
            backgroundGradientFrom: "#23263a",
            backgroundGradientTo: "#23263a",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#4CAF50"
            }
          }}
          bezier
          style={styles.chart}
        /> */}
      </View>
    );
  };

  const renderStats = () => {
    // TO DO: implement renderStats function
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back,{" "}
          {user?.username ||
            user?.user_metadata?.username ||
            user?.display_name ||
            "User"}
          !
        </Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </Text>
      </View>

      {/* Stats Cards */}
      {renderStats()}

      {/* Active Workout Section */}
      {activeWorkout ? (
        <View style={styles.activeWorkoutContainer}>
          <View style={styles.activeWorkoutCard}>
            <View style={styles.activeWorkoutHeader}>
              <Ionicons name="fitness" size={24} color="#4CAF50" />
              <Text style={styles.activeWorkoutTitle}>Active Workout</Text>
            </View>
            <Text style={styles.activeWorkoutName}>{activeWorkout.name}</Text>
            <Text style={styles.activeWorkoutDetails}>
              {activeWorkout.exercises?.length || 0} exercises
            </Text>

            {/* Exercise List */}
            {activeWorkout.exercises && activeWorkout.exercises.length > 0 && (
              <View style={styles.exercisesList}>
                {activeWorkout.exercises.map((exercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseSets}>
                      {exercise.sets?.length || 0} sets
                      {exercise.sets && exercise.sets.length > 0 && (
                        <Text style={styles.setsDetail}>
                          {" "}
                          (
                          {exercise.sets
                            .map(
                              (set) =>
                                `${set.reps}×${set.weight}${
                                  set.weight ? "lbs" : ""
                                }`
                            )
                            .join(", ")}
                          )
                        </Text>
                      )}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.activeWorkoutActions}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinueWorkout}
              >
                <Ionicons name="create" size={20} color="#fff" />
                <Text style={styles.continueButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.endButton}
                onPress={handleEndWorkout}
              >
                <Ionicons name="stop" size={20} color="#fff" />
                <Text style={styles.endButtonText}>End</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteActiveWorkout}
              >
                <Ionicons name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noWorkoutContainer}>
          <Text style={styles.sectionTitle}>Ready to Train?</Text>
          <TouchableOpacity
            style={styles.startWorkoutButton}
            onPress={handleStartWorkout}
          >
            <Ionicons name="fitness" size={24} color="#fff" />
            <Text style={styles.startWorkoutText}>Start New Workout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progress Chart */}
      {renderChart()}

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate("Calculator")}
          >
            <Ionicons name="calculator" size={32} color="#4CAF50" />
            <Text style={styles.quickActionText}>Frequency Calculator</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate("RecoveryGuide")}
          >
            <Ionicons name="heart" size={32} color="#4CAF50" />
            <Text style={styles.quickActionText}>Recovery Guide</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1c2e"
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
    padding: 20,
    paddingTop: 40
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5
  },
  dateText: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30
  },
  statCard: {
    backgroundColor: "#23263a",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    textAlign: "center"
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    paddingHorizontal: 20
  },
  activeWorkoutContainer: {
    marginBottom: 30
  },
  activeWorkoutCard: {
    backgroundColor: "#23263a",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20
  },
  activeWorkoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  activeWorkoutTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10
  },
  activeWorkoutName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5
  },
  activeWorkoutDetails: {
    fontSize: 14,
    color: "#888",
    marginBottom: 15
  },
  exercisesList: {
    marginBottom: 15
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5
  },
  exerciseName: {
    fontSize: 16,
    color: "#fff"
  },
  exerciseSets: {
    fontSize: 16,
    color: "#888"
  },
  setsDetail: {
    fontSize: 14,
    color: "#888"
  },
  activeWorkoutActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 5
  },
  endButton: {
    backgroundColor: "#f44336",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10
  },
  endButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 5
  },
  deleteButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 8
  },
  noWorkoutContainer: {
    alignItems: "center",
    marginBottom: 30
  },
  startWorkoutButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 20
  },
  startWorkoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10
  },
  chartContainer: {
    marginBottom: 30
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    paddingHorizontal: 20
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    marginHorizontal: 20
  },
  noDataContainer: {
    backgroundColor: "#23263a",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 40,
    alignItems: "center"
  },
  noDataText: {
    color: "#888",
    textAlign: "center",
    fontSize: 16
  },
  quickActionsContainer: {
    marginBottom: 30
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20
  },
  quickActionCard: {
    backgroundColor: "#23263a",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5
  },
  quickActionText: {
    color: "#fff",
    marginTop: 10,
    textAlign: "center",
    fontSize: 14
  }
});

export default NewHomeScreen;
