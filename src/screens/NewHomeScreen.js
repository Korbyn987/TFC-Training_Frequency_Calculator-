import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
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
import { LineChart } from "react-native-chart-kit";
import { useTabData } from "../context/TabDataContext";

const { width: screenWidth } = Dimensions.get("window");

const NewHomeScreen = ({ navigation }) => {
  const {
    user,
    userStats,
    activeWorkout,
    loading,
    recentWorkouts,
    setActiveWorkout,
    refreshTabData,
    setMuscleRecoveryData, // Use for optimistic update
    muscleRecoveryData
  } = useTabData();

  const handleStartWorkout = () => {
    navigation.navigate("WorkoutOptions");
  };

  const handleContinueWorkout = async () => {
    if (activeWorkout) {
      try {
        // For local workouts (created from WorkoutOptionsScreen), navigate directly
        if (!activeWorkout.id) {
          console.log("Editing local workout, navigating to WorkoutOptions");
          navigation.navigate("WorkoutOptions", {
            editingWorkout: activeWorkout,
            fromActiveWorkout: true
          });
          return;
        }

        // For database workouts, fetch fresh data first
        console.log("Editing database workout, fetching fresh data");
        const { getWorkoutDetails } = await import(
          "../services/supabaseWorkouts"
        );
        const result = await getWorkoutDetails(activeWorkout.id);

        if (result.success) {
          navigation.navigate("WorkoutOptions", {
            editingWorkout: result.workout,
            fromActiveWorkout: true
          });
        } else {
          console.error("Failed to load workout details:", result.error);
          Alert.alert("Error", "Could not load workout details to edit.");
        }
      } catch (error) {
        console.error("Error in handleContinueWorkout:", error);
        Alert.alert("Error", "Failed to open workout for editing.");
      }
    }
  };

  const handleEndWorkout = async () => {
    if (!activeWorkout) return;

    try {
      const {
        createWorkout,
        addWorkoutExercise,
        addExerciseSet,
        completeWorkout
      } = await import("../services/supabaseWorkouts");

      const muscleGroups = [];
      if (activeWorkout.exercises && activeWorkout.exercises.length > 0) {
        activeWorkout.exercises.forEach((exercise) => {
          const muscleGroup =
            exercise.target_muscle ||
            exercise.muscle_group ||
            (exercise.muscle_groups &&
            typeof exercise.muscle_groups === "string"
              ? exercise.muscle_groups
              : null) ||
            (exercise.muscle_groups &&
            typeof exercise.muscle_groups === "object" &&
            exercise.muscle_groups.name
              ? exercise.muscle_groups.name
              : null);

          if (
            muscleGroup &&
            muscleGroup !== "Unknown" &&
            !muscleGroups.includes(muscleGroup)
          ) {
            muscleGroups.push(muscleGroup);
          }
        });
      }

      const workoutData = {
        name: activeWorkout.name,
        notes: `Workout with ${activeWorkout.exercises?.length || 0} exercises`
      };

      const result = await createWorkout(workoutData);
      if (!result.success) throw new Error(result.error);

      const newWorkoutId = result.workout.id;

      for (let i = 0; i < activeWorkout.exercises.length; i++) {
        const exercise = activeWorkout.exercises[i];
        const exerciseResult = await addWorkoutExercise(newWorkoutId, {
          exercise_id: exercise.id,
          exercise_name: exercise.name,
          target_sets: exercise.sets?.length || 0,
          muscle_group:
            exercise.muscle_groups?.name ||
            exercise.target_muscle ||
            exercise.muscle_group ||
            "Unknown"
        });

        if (!exerciseResult.success) continue;

        const workoutExerciseId = exerciseResult.workoutExercise.id;

        if (exercise.sets && exercise.sets.length > 0) {
          for (let j = 0; j < exercise.sets.length; j++) {
            const set = exercise.sets[j];
            await addExerciseSet(workoutExerciseId, {
              set_number: j + 1,
              set_type: set.set_type || "normal",
              reps: set.reps,
              weight: set.weight
            });
          }
        }
      }

      await completeWorkout(newWorkoutId, {
        duration_minutes: Math.floor(
          (new Date() - new Date(activeWorkout.started_at)) / (1000 * 60)
        ),
        notes: "Workout completed",
        muscle_groups: muscleGroups
      });

      // Optimistic UI update for recovery timers
      if (muscleGroups.length > 0) {
        const newRecoveryData = { ...muscleRecoveryData };
        const currentDate = new Date().toISOString();
        muscleGroups.forEach((muscle) => {
          const normalizedMuscle = muscle.toLowerCase();
          if (newRecoveryData[normalizedMuscle]) {
            newRecoveryData[normalizedMuscle].lastWorkout = currentDate;
          }
        });
        setMuscleRecoveryData(newRecoveryData);
      }

      // Clear from storage and context, then refresh all data
      await AsyncStorage.removeItem("activeWorkout");
      setActiveWorkout(null);
      await refreshTabData();

      Alert.alert("Success", "Workout completed successfully!");
    } catch (error) {
      console.error("NewHomeScreen: Error completing workout:", error);
      Alert.alert("Error", "Failed to complete workout. Please try again.");
    }
  };

  const handleDeleteWorkout = () => {
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
              await AsyncStorage.removeItem("activeWorkout");
              setActiveWorkout(null);
              Alert.alert("Success", "Workout deleted successfully");
            } catch (error) {
              console.error("Error deleting workout:", error);
              Alert.alert("Error", "Failed to delete workout.");
            }
          }
        }
      ]
    );
  };

  const renderChart = () => {
    if (!recentWorkouts || recentWorkouts.length < 1) {
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
            .map((workout) => workout.total_volume_kg || 0),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Training Volume Trend</Text>
        <LineChart
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
        />
      </View>
    );
  };

  const renderStats = () => {
    // This can be enhanced to use userStats from context
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
        <View style={styles.headerTextContainer}>
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
      </View>

      {renderStats()}

      {activeWorkout ? (
        <View style={styles.activeWorkoutContainer}>
          <View style={styles.activeWorkoutCard}>
            <View style={styles.activeWorkoutHeader}>
              <Ionicons name="fitness" size={24} color="#4CAF50" />
              <Text style={styles.activeWorkoutTitle}>Active Workout</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteWorkout}
              >
                <Ionicons name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.activeWorkoutName}>{activeWorkout.name}</Text>
            <Text style={styles.activeWorkoutDetails}>
              {activeWorkout.exercises?.length || 0} exercises
            </Text>

            {activeWorkout.exercises && activeWorkout.exercises.length > 0 && (
              <View style={styles.exercisesList}>
                {activeWorkout.exercises.map((exercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    <View style={styles.exerciseInfo}>
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
                                    set.weight ? "kg" : ""
                                  }`
                              )
                              .join(", ")}
                            )
                          </Text>
                        )}
                      </Text>
                    </View>
                  </View>
                ))}
                {activeWorkout.exercises.length > 3 && (
                  <Text style={styles.moreExercisesText}>
                    + {activeWorkout.exercises.length - 3} more exercises
                  </Text>
                )}
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

      {renderChart()}

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
    paddingTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerTextContainer: {
    flexDirection: "column"
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff"
  },
  dateText: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 4
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
    justifyContent: "space-between",
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
    marginBottom: 8,
    paddingVertical: 4
  },
  exerciseInfo: {
    flex: 1
  },
  exerciseName: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 2,
    fontWeight: "500"
  },
  exerciseSets: {
    fontSize: 14,
    color: "#888",
    lineHeight: 18
  },
  setsDetail: {
    fontSize: 13,
    color: "#666"
  },
  moreExercisesText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#333"
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
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)"
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
