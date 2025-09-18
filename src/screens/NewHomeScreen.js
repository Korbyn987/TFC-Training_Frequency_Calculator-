import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import WorkoutPresets from "../components/WorkoutPresets";
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

  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Check if user has premium access (placeholder - implement based on your premium system)
  const isPremiumUser = () => {
    // For now, return true to show all users the premium features
    // In production, check user.subscription_status or similar
    return user?.subscription_status === "premium" || user?.is_premium || true;
  };

  const handlePremiumFeature = (action) => {
    if (isPremiumUser()) {
      action();
    } else {
      setShowPremiumModal(true);
    }
  };

  const handleCreateTemplate = () => {
    handlePremiumFeature(() => {
      setShowPresetsModal(true);
    });
  };

  const handleLoadTemplate = async () => {
    handlePremiumFeature(async () => {
      try {
        const presetsData = await AsyncStorage.getItem("workout_presets");
        const presets = presetsData ? JSON.parse(presetsData) : [];

        if (presets.length === 0) {
          Alert.alert(
            "No Templates Found",
            "You haven't created any workout templates yet. Create one to get started!",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Create Template", onPress: handleCreateTemplate }
            ]
          );
          return;
        }

        // Show preset selection modal
        setShowPresetsModal(true);
      } catch (error) {
        console.error("Error loading templates:", error);
        Alert.alert("Error", "Failed to load workout templates.");
      }
    });
  };

  const handleSaveCurrentAsTemplate = () => {
    handlePremiumFeature(() => {
      if (
        !activeWorkout ||
        !activeWorkout.exercises ||
        activeWorkout.exercises.length === 0
      ) {
        Alert.alert(
          "No Active Workout",
          "You need an active workout with exercises to save it as a template.",
          [
            { text: "OK" },
            { text: "Start Workout", onPress: handleStartWorkout }
          ]
        );
        return;
      }

      Alert.alert(
        "Save as Template",
        `Do you want to save "${activeWorkout.name}" as a new workout template?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save Template",
            onPress: async () => {
              try {
                const presetsData = await AsyncStorage.getItem(
                  "workout_presets"
                );
                const presets = presetsData ? JSON.parse(presetsData) : [];

                const newTemplate = {
                  id: Date.now(),
                  name: `${activeWorkout.name} Template`,
                  exercises: activeWorkout.exercises.map((exercise) => ({
                    id: exercise.id,
                    name: exercise.name,
                    muscle_groups: exercise.muscle_groups,
                    target_muscle: exercise.target_muscle,
                    muscle_group: exercise.muscle_group,
                    sets: exercise.sets || [],
                    rest_seconds: exercise.rest_seconds || 60
                  })),
                  created_at: new Date().toISOString()
                };

                const updatedPresets = [...presets, newTemplate];
                await AsyncStorage.setItem(
                  "workout_presets",
                  JSON.stringify(updatedPresets)
                );

                Alert.alert(
                  "Success!",
                  "Your workout has been saved as a template."
                );
              } catch (error) {
                console.error("Error saving template:", error);
                Alert.alert(
                  "Error",
                  "Could not save the workout as a template."
                );
              }
            }
          }
        ]
      );
    });
  };

  const handleUpgradeToPremium = () => {
    setShowPremiumModal(false);
    Alert.alert(
      "Upgrade to Premium",
      "Unlock workout templates, advanced analytics, and more!",
      [
        { text: "Maybe Later", style: "cancel" },
        {
          text: "Upgrade Now",
          onPress: () => {
            // You can navigate to your premium upgrade screen here
            console.log("Navigate to premium upgrade screen");
          }
        }
      ]
    );
  };

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
            onPress={handleLoadTemplate}
          >
            <Ionicons name="add-circle" size={32} color="#4CAF50" />
            <Text style={styles.quickActionText}>Create Preset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate("RecoveryGuide")}
          >
            <Ionicons name="heart" size={32} color="#4CAF50" />
            <Text style={styles.quickActionText}>Recovery Guide</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Template Features */}
        <View style={styles.premiumSection}>
          {activeWorkout && (
            <TouchableOpacity
              style={[
                styles.quickActionCard,
                styles.premiumActionCard,
                styles.fullWidthCard
              ]}
              onPress={handleSaveCurrentAsTemplate}
            >
              <Ionicons name="bookmark" size={32} color="#fff" />
              <Text style={styles.quickActionText}>
                Save Current as Template
              </Text>
              {!isPremiumUser() && (
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color="#FFD700"
                  style={styles.lockIcon}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Workout Presets Modal */}
      <Modal
        visible={showPresetsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPresetsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Workout Templates</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPresetsModal(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          <WorkoutPresets />
        </View>
      </Modal>

      {/* Premium Upgrade Modal */}
      <Modal
        visible={showPremiumModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPremiumModal(false)}
      >
        <View style={styles.premiumModalOverlay}>
          <View style={styles.premiumModalContent}>
            <View style={styles.premiumModalHeader}>
              <Ionicons name="star" size={48} color="#FFD700" />
              <Text style={styles.premiumModalTitle}>Unlock Premium</Text>
            </View>
            <Text style={styles.premiumModalText}>
              Create, save, and load custom workout templates to streamline your
              training and reach your goals faster!
            </Text>
            <View style={styles.premiumFeaturesList}>
              <View style={styles.premiumFeatureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.premiumFeatureText}>
                  Unlimited workout templates
                </Text>
              </View>
              <View style={styles.premiumFeatureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.premiumFeatureText}>
                  Save active workouts as templates
                </Text>
              </View>
              <View style={styles.premiumFeatureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.premiumFeatureText}>
                  Load templates in one tap
                </Text>
              </View>
            </View>
            <View style={styles.premiumModalButtons}>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgradeToPremium}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPremiumModal(false)}
              >
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  premiumSection: {
    marginTop: 30
  },
  premiumHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 20
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  premiumBadgeText: {
    fontSize: 10,
    color: "#000",
    fontWeight: "bold",
    marginLeft: 4
  },
  premiumActionCard: {
    backgroundColor: "#2a2d40",
    borderColor: "#6b46c1",
    borderWidth: 1
  },
  lockIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    opacity: 0.7
  },
  fullWidthCard: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: 20
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#1a1c2e"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2d40"
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff"
  },
  closeButton: {
    padding: 8
  },
  premiumModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)"
  },
  premiumModalContent: {
    backgroundColor: "#23263a",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#FFD700"
  },
  premiumModalHeader: {
    alignItems: "center",
    marginBottom: 16
  },
  premiumModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 12
  },
  premiumModalText: {
    fontSize: 16,
    color: "#b0b3c2",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 24
  },
  premiumFeaturesList: {
    marginBottom: 24,
    alignItems: "flex-start"
  },
  premiumFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  premiumFeatureText: {
    fontSize: 15,
    color: "#e2e8f0",
    marginLeft: 12,
    flex: 1
  },
  premiumModalButtons: {
    gap: 12
  },
  upgradeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 8
  },
  upgradeButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center"
  },
  cancelButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4b5563"
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#b0b3c2",
    fontWeight: "500",
    textAlign: "center"
  }
});

export default NewHomeScreen;
