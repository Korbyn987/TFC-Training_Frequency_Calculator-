import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import LoginRequiredModal from "../components/LoginRequiredModal";
import { MUSCLE_GROUPS } from "../constants/muscleGroups";
import { addWorkout } from "../redux/workoutSlice";
import { getCurrentUser } from "../services/supabaseAuth";

const CalculatorScreen = ({ navigation }) => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [muscleData, setMuscleData] = useState({});
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();
  const muscleStatus =
    useSelector((state) => state.workout?.muscleStatus) || {};

  useEffect(() => {
    checkAuthentication();
  }, []);

  // Re-check authentication when screen comes into focus (e.g., returning from login)
  useFocusEffect(
    useCallback(() => {
      checkAuthentication();
    }, [])
  );

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadMuscleData();
        loadWorkoutHistory();
      }
    }, [userId])
  );

  const checkAuthentication = async () => {
    try {
      setIsLoading(true);

      const user = await getCurrentUser();

      if (!user) {
        console.log(
          "Calculator: No valid user data found, showing login modal"
        );
        setShowLoginModal(true);
        setIsLoading(false);
        return;
      }

      console.log(
        "Calculator: Authentication successful for user:",
        user.username || user.name
      );
      setUserId(user.id);
      setUsername(user.username || user.name || "User");
      setShowLoginModal(false); // Hide modal if user is authenticated
      setIsLoading(false);
    } catch (error) {
      console.error("Calculator: Error checking authentication:", error);
      setShowLoginModal(true);
      setIsLoading(false);
    }
  };

  const loadWorkoutHistory = async () => {
    try {
      const historyStr = await AsyncStorage.getItem("workoutHistory");
      if (historyStr) {
        const history = JSON.parse(historyStr);
        setWorkoutHistory(history);
      }
    } catch (error) {
      console.error("Error loading workout history:", error);
    }
  };

  const loadMuscleData = async () => {
    try {
      const savedData = await AsyncStorage.getItem("muscleData");
      let muscleDataObj = {};

      if (savedData !== null) {
        muscleDataObj = JSON.parse(savedData);
      } else {
        // Initialize with default values
        muscleDataObj = MUSCLE_GROUPS.reduce((acc, muscle) => {
          acc[muscle] = 0;
          return acc;
        }, {});
      }

      // Update muscle data based on recent workouts
      await updateMuscleDataFromWorkouts(muscleDataObj);
      setMuscleData(muscleDataObj);
    } catch (error) {
      console.error("Error loading muscle data:", error);
    }
  };

  const updateMuscleDataFromWorkouts = async (muscleDataObj) => {
    try {
      // Check for recent workout completions
      const recentWorkouts = await AsyncStorage.getItem("recentWorkouts");
      if (recentWorkouts) {
        const workouts = JSON.parse(recentWorkouts);
        const now = new Date();

        workouts.forEach((workout) => {
          if (workout.muscles && Array.isArray(workout.muscles)) {
            workout.muscles.forEach((muscle) => {
              const workoutDate = new Date(workout.date);
              const daysSince = Math.floor(
                (now - workoutDate) / (1000 * 60 * 60 * 24)
              );

              // Reset timer for this muscle group
              if (muscleDataObj.hasOwnProperty(muscle)) {
                muscleDataObj[muscle] = daysSince;
              }
            });
          }
        });

        // Save updated muscle data
        await AsyncStorage.setItem("muscleData", JSON.stringify(muscleDataObj));
      }
    } catch (error) {
      console.error("Error updating muscle data from workouts:", error);
    }
  };

  const getStatus = (days) => {
    if (days === 0) return "ready";
    if (days <= 1) return "soon";
    if (days <= 3) return "wait";
    return "notReady";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ready":
        return "#38a169";
      case "soon":
        return "#d69e2e";
      case "wait":
        return "#e53e3e";
      case "notReady":
        return "#718096";
      default:
        return "#718096";
    }
  };

  const getStatusText = (days) => {
    if (days === 0) return "Ready to train!";
    if (days === 1) return "1 day since last workout";
    return `${days} days since last workout`;
  };

  const handleMusclePress = (muscle) => {
    setSelectedMuscles((prev) => {
      if (prev.includes(muscle)) {
        return prev.filter((m) => m !== muscle);
      }
      return [...prev, muscle];
    });
  };

  const handleStartWorkout = async () => {
    if (selectedMuscles.length === 0) {
      Alert.alert(
        "No Muscles Selected",
        "Please select at least one muscle group to train."
      );
      return;
    }

    try {
      // Navigate to ConfigureWorkout with selected muscles
      navigation.navigate("ConfigureWorkout", {
        selectedMuscles: selectedMuscles,
        fromCalculator: true
      });
    } catch (error) {
      console.error("Error starting workout:", error);
      Alert.alert("Error", "Failed to start workout configuration.");
    }
  };

  const resetMuscleTimer = async (muscle) => {
    try {
      const updatedMuscleData = { ...muscleData };
      updatedMuscleData[muscle] = 0;

      setMuscleData(updatedMuscleData);
      await AsyncStorage.setItem(
        "muscleData",
        JSON.stringify(updatedMuscleData)
      );

      // Add to Redux store for synchronization
      dispatch(
        addWorkout({
          date: new Date().toISOString(),
          muscles: [muscle.toLowerCase()],
          intensity: "manual_reset",
          name: `${muscle} Timer Reset`,
          exercises: []
        })
      );

      Alert.alert(
        "Timer Reset",
        `${muscle} recovery timer has been reset to 0 days.`
      );
    } catch (error) {
      console.error("Error resetting muscle timer:", error);
      Alert.alert("Error", "Failed to reset timer.");
    }
  };

  const getRecommendation = () => {
    if (selectedMuscles.length === 0) {
      return "Select muscle groups to get training recommendations";
    }

    const selectedData = selectedMuscles.map((muscle) => ({
      muscle,
      days: muscleData[muscle] || 0
    }));

    const readyMuscles = selectedData.filter((m) => m.days === 0);
    const soonMuscles = selectedData.filter((m) => m.days === 1);
    const waitMuscles = selectedData.filter((m) => m.days > 1);

    if (readyMuscles.length === selectedMuscles.length) {
      return "✅ All selected muscles are ready to train!";
    }

    if (readyMuscles.length > 0) {
      return `✅ ${readyMuscles.length} muscle(s) ready, ${waitMuscles.length} still recovering`;
    }

    if (soonMuscles.length > 0) {
      return `⏰ ${soonMuscles.length} muscle(s) ready soon, wait ${Math.max(
        ...waitMuscles.map((m) => m.days)
      )} more day(s)`;
    }

    return `⏳ Wait ${Math.min(
      ...waitMuscles.map((m) => m.days)
    )} more day(s) before training`;
  };

  const renderMuscleGroup = ({ item: muscle }) => {
    const days = muscleData[muscle] || 0;
    const status = getStatus(days);
    const isSelected = selectedMuscles.includes(muscle);

    return (
      <TouchableOpacity
        style={[
          styles.muscleGroup,
          { borderColor: getStatusColor(status) },
          isSelected && styles.selectedMuscleGroup
        ]}
        onPress={() => handleMusclePress(muscle)}
        onLongPress={() => resetMuscleTimer(muscle)}
      >
        <View style={styles.muscleHeader}>
          <Text style={styles.muscleGroupText}>{muscle}</Text>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color="#6b46c1" />
          )}
        </View>
        <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
          {getStatusText(days)}
        </Text>
        <Text style={styles.resetHint}>Long press to reset</Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.container}>
        <LoginRequiredModal
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Frequency Calculator</Text>
        <Text style={styles.subtitle}>Welcome back, {username}!</Text>
      </View>

      <View style={styles.recommendationCard}>
        <Text style={styles.recommendationTitle}>Recommendation</Text>
        <Text style={styles.recommendationText}>{getRecommendation()}</Text>
      </View>

      {selectedMuscles.length > 0 && (
        <View style={styles.selectedMusclesCard}>
          <Text style={styles.selectedTitle}>
            Selected Muscles ({selectedMuscles.length})
          </Text>
          <View style={styles.selectedMusclesList}>
            {selectedMuscles.map((muscle) => (
              <TouchableOpacity
                key={muscle}
                style={styles.selectedMuscleChip}
                onPress={() => handleMusclePress(muscle)}
              >
                <Text style={styles.selectedMuscleText}>{muscle}</Text>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.startWorkoutButton}
              onPress={handleStartWorkout}
            >
              <Text style={styles.startWorkoutButtonText}>
                Configure Workout
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSelectedMuscles([])}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.muscleGroupsSection}>
        <Text style={styles.sectionTitle}>Muscle Groups</Text>
        <FlatList
          data={MUSCLE_GROUPS.sort()}
          renderItem={renderMuscleGroup}
          keyExtractor={(item) => item}
          numColumns={2}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1c2e"
  },
  header: {
    padding: 20,
    alignItems: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center"
  },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 5
  },
  recommendationCard: {
    backgroundColor: "#2d3748",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4a5568"
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8
  },
  recommendationText: {
    fontSize: 16,
    color: "#e2e8f0",
    lineHeight: 24
  },
  selectedMusclesCard: {
    backgroundColor: "#2d3748",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6b46c1"
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12
  },
  selectedMusclesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12
  },
  selectedMuscleChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6b46c1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8
  },
  selectedMuscleText: {
    color: "#fff",
    fontSize: 14,
    marginRight: 6
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  startWorkoutButton: {
    backgroundColor: "#38a169",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8
  },
  startWorkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center"
  },
  clearButton: {
    backgroundColor: "#e53e3e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold"
  },
  muscleGroupsSection: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16
  },
  row: {
    justifyContent: "space-between"
  },
  muscleGroup: {
    flex: 0.48,
    backgroundColor: "#2d3748",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2
  },
  selectedMuscleGroup: {
    backgroundColor: "#3d4066",
    borderColor: "#6b46c1"
  },
  muscleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  muscleGroupText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff"
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500"
  },
  resetHint: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
    marginTop: 4
  },
  loadingText: {
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    padding: 20
  }
});

export default CalculatorScreen;
