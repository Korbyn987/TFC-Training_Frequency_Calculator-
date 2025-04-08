import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { styles } from "../styles/HomeStyles";
import { MUSCLE_GROUPS } from "../constants/muscleGroups";
import WorkoutBanner from "../components/workoutBanner";
import WorkoutSelectionModal from "../components/workoutSelectionModal";
import { useNavigation } from "@react-navigation/native";
import ButtonStyles from "../styles/Button";

const HomeScreen = ({ navigation }) => {
  const [muscleData, setMuscleData] = useState({});
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [isWorkoutModalVisible, setIsWorkoutModalVisible] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [editDays, setEditDays] = useState("");
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [trainedMuscles, setTrainedMuscles] = useState([]);
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const workoutTimerRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Define muscle groups
  const UPPER_BODY = [
    "Biceps",
    "Triceps",
    "Chest",
    "Shoulders",
    "Traps",
    "Back",
  ];

  const LOWER_BODY = ["Quads", "Hamstrings", "Calves", "Glutes"];

  const MUSCLE_GROUPS = [...UPPER_BODY, ...LOWER_BODY];

  // Function to determine muscle status based on days
  const getStatus = (days) => {
    if (days <= 1) {
      return "red"; // Do not train
    } else if (days <= 3) {
      return "yellow"; // Caution
    } else {
      return "green"; // Safe to train
    }
  };

  // Function to load streak from AsyncStorage
  const loadStreak = async () => {
    try {
      const savedStreak = await AsyncStorage.getItem("streak");
      if (savedStreak !== null) {
        setStreak(parseInt(savedStreak));
      } else {
        setStreak(0);
      }
    } catch (error) {
      console.error("Error loading streak:", error);
      setStreak(0);
    }
  };

  // Function to save streak to AsyncStorage
  const saveStreak = async (value) => {
    try {
      await AsyncStorage.setItem("streak", value.toString());
    } catch (error) {
      console.error("Error saving streak:", error);
    }
  };

  // Function to update streak when a workout is completed
  const updateStreak = async () => {
    const today = new Date().toISOString().split("T")[0];
    const lastWorkout = await AsyncStorage.getItem("lastWorkout");

    if (lastWorkout === today) {
      // Workout already completed today
      return;
    }

    setStreak((prevStreak) => {
      const newStreak = prevStreak + 1;
      saveStreak(newStreak);
      AsyncStorage.setItem("lastWorkout", today);
      return newStreak;
    });

    // Check for achievements
    checkAchievements();
  };

  // Function to load achievements
  const loadAchievements = async () => {
    try {
      const savedAchievements = await AsyncStorage.getItem("achievements");
      if (savedAchievements !== null) {
        setAchievements(JSON.parse(savedAchievements));
      }
    } catch (error) {
      console.error("Error loading achievements:", error);
      setAchievements([]);
    }
  };

  // Function to check for new achievements
  const checkAchievements = async () => {
    const currentStreak = await AsyncStorage.getItem("streak");
    const savedAchievements = await AsyncStorage.getItem("achievements");
    const prevAchievements = savedAchievements
      ? JSON.parse(savedAchievements)
      : [];

    const newAchievements = [];

    // Check for streak achievements
    if (currentStreak >= 7 && !prevAchievements.includes("week")) {
      newAchievements.push("week");
    }
    if (currentStreak >= 30 && !prevAchievements.includes("month")) {
      newAchievements.push("month");
    }
    if (currentStreak >= 90 && !prevAchievements.includes("quarter")) {
      newAchievements.push("quarter");
    }

    if (newAchievements.length > 0) {
      setAchievements([...prevAchievements, ...newAchievements]);
      await AsyncStorage.setItem(
        "achievements",
        JSON.stringify([...prevAchievements, ...newAchievements])
      );
    }
  };

  useEffect(() => {
    loadMuscleData();
    loadStreak();
    loadAchievements();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          {isAuthenticated ? (
            <>
              <TouchableOpacity
                style={[ButtonStyles.headerButton, { marginRight: 8 }]}
                onPress={() => navigation.navigate("Calculator")}
              >
                <Text style={ButtonStyles.headerButtonText}>Calculator</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  ButtonStyles.headerButton,
                  { backgroundColor: "#553c9a" },
                ]}
                onPress={() => {
                  dispatch(logout());
                  navigation.replace("Login");
                }}
              >
                <Text style={ButtonStyles.headerButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={ButtonStyles.headerButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={ButtonStyles.headerButtonText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, isAuthenticated]);

  const loadMuscleData = async () => {
    try {
      const savedData = await AsyncStorage.getItem("muscleData");
      if (savedData !== null) {
        setMuscleData(JSON.parse(savedData));
      } else {
        const initialData = MUSCLE_GROUPS.reduce((acc, muscle) => {
          acc[muscle] = 0;
          return acc;
        }, {});
        setMuscleData(initialData);
        await AsyncStorage.setItem("muscleData", JSON.stringify(initialData));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load muscle data");
    }
  };

  const handleMuscleSelect = (muscle) => {
    setSelectedMuscles((prev) => {
      // If the muscle is already selected, remove it
      if (prev.includes(muscle)) {
        return prev.filter((m) => m !== muscle);
      }
      // Otherwise, add it to the selection
      return [...prev, muscle];
    });
  };

  const clearMuscle = (muscle) => {
    setSelectedMuscles((prev) => prev.filter((m) => m !== muscle));
  };

  const clearAllMuscles = () => {
    setSelectedMuscles([]);
  };

  const startWorkout = () => {
    if (selectedMuscles.length === 0) {
      Alert.alert("Error", "Please select at least one muscle group to train");
      return;
    }
    setIsWorkoutModalVisible(false);
    setWorkoutInProgress(true);
    setIsTimerRunning(true);
    setWorkoutTimer(0);

    // Store the workout in history
    const workoutData = {
      muscles: selectedMuscles,
      startTime: new Date().toISOString(),
      duration: 0,
      userId: user?.id,
    };
    setWorkoutHistory([...workoutHistory, workoutData]);
  };

  const endWorkout = () => {
    setIsTimerRunning(false);
    setWorkoutInProgress(false);

    // Update the last workout time for selected muscles
    const currentTime = new Date().getTime();
    const updatedMuscleData = { ...muscleData };
    selectedMuscles.forEach((muscle) => {
      updatedMuscleData[muscle] = currentTime;
    });
    setMuscleData(updatedMuscleData);

    // Update the workout history with duration
    const lastWorkout = workoutHistory[workoutHistory.length - 1];
    if (lastWorkout) {
      lastWorkout.duration = workoutTimer;
      setWorkoutHistory([...workoutHistory.slice(0, -1), lastWorkout]);
    }
  };

  const handleEdit = (muscle) => {
    setEditMode(true);
    setEditDays(muscleData[muscle].toString());
    setSelectedMuscle(muscle);
  };

  const saveEdit = async () => {
    if (isNaN(editDays) || editDays === "") {
      Alert.alert("Error", "Please enter a valid number");
      return;
    }

    try {
      const newData = { ...muscleData, [selectedMuscle]: parseInt(editDays) };
      setMuscleData(newData);
      await AsyncStorage.setItem("muscleData", JSON.stringify(newData));
      setEditMode(false);
      setSelectedMuscle(null);
    } catch (error) {
      Alert.alert("Error", "Failed to save changes");
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setSelectedMuscle(null);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isTimerRunning) {
      workoutTimerRef.current = setInterval(() => {
        setWorkoutTimer((prev) => prev + 1);
      }, 1000);
    } else if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
    }

    return () => {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
      }
    };
  }, [isTimerRunning]);

  const renderMuscleItem = ({ item: muscle }) => {
    const days = muscleData[muscle] || 0;
    const status = getStatus(days);
    return (
      <TouchableOpacity
        style={styles.muscleButton}
        onPress={() => {
          if (editMode) {
            setEditMode(false);
            setSelectedMuscle(muscle);
            setEditDays(days.toString());
          } else {
            handleMuscleSelect(muscle);
          }
        }}
        onLongPress={() => {
          setEditMode(true);
          setSelectedMuscle(muscle);
          setEditDays(days.toString());
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <View style={styles.muscleStatus(status)}>
            <Text style={styles.muscleName}>{muscle}</Text>
            <View style={styles.daysContainer}>
              <Text style={styles.daysText}>{days} days</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(muscle)}
              >
                <Ionicons name="pencil" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderMuscleSelectionBanner = () => {
    if (!workoutInProgress) return null;

    return (
      <View style={styles.muscleSelectionBanner}>
        <Text style={styles.bannerTitle}>Selected Muscles:</Text>
        <View style={styles.selectedMusclesContainer}>
          {selectedMuscles.map((muscle, index) => (
            <TouchableOpacity
              key={index}
              style={styles.selectedMuscleChip}
              onPress={() => clearMuscle(muscle)}
            >
              <Text style={styles.chipText}>{muscle}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={clearAllMuscles}
        >
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={async () => {
            setIsRefreshing(true);
            await loadMuscleData();
            await loadStreak();
            await loadAchievements();
            setIsRefreshing(false);
          }}
        />
      }
    >
      {renderMuscleSelectionBanner()}
      <View style={styles.header}>
        <Text style={styles.title}>
          Welcome to TFC your Training Frequency Calculator
        </Text>
        {isAuthenticated && user && (
          <Text style={styles.welcomeUser}>Welcome, {user.username}!</Text>
        )}

        {/* Streak Counter */}
        <View style={styles.streakContainer}>
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <Text style={styles.streakText}>{streak} day streak!</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Object.values(muscleData).filter((days) => days >= 48).length}
            </Text>
            <Text style={styles.statLabel}>Ready Muscles</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Object.values(muscleData).filter((days) => days < 48).length}
            </Text>
            <Text style={styles.statLabel}>Resting Muscles</Text>
          </View>
        </View>
      </View>

      <Text style={styles.subtitle}>Tap a muscle to reset its counter</Text>

      <FlatList
        data={
          selectedGroup === null
            ? MUSCLE_GROUPS
            : selectedGroup === "upper"
            ? UPPER_BODY
            : LOWER_BODY
        }
        renderItem={renderMuscleItem}
        keyExtractor={(item) => item}
        style={styles.list}
        contentContainerStyle={styles.listContainer}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickActionItem, styles.startWorkoutButton]}
          onPress={() => setIsWorkoutModalVisible(true)}
        >
          <Ionicons name="play-circle" size={24} color="#2196F3" />
          <Text style={styles.quickActionText}>Start Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionItem, styles.endWorkoutButton]}
          onPress={endWorkout}
          disabled={!workoutInProgress || selectedMuscles.length === 0}
        >
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.quickActionText}>End Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.quickActionItem,
            selectedGroup === "upper" && styles.selectedGroup,
          ]}
          onPress={() => {
            setSelectedGroup("upper");
            UPPER_BODY.forEach((muscle) => handleMuscleSelect(muscle));
          }}
        >
          <Ionicons name="body" size={24} color="#4CAF50" />
          <Text style={styles.quickActionText}>Upper Body</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.quickActionItem,
            selectedGroup === "lower" && styles.selectedGroup,
          ]}
          onPress={() => {
            setSelectedGroup("lower");
            LOWER_BODY.forEach((muscle) => handleMuscleSelect(muscle));
          }}
        >
          <Ionicons name="body" size={24} color="#2196F3" />
          <Text style={styles.quickActionText}>Lower Body</Text>
        </TouchableOpacity>
      </View>

      {/* Reset button to show all muscles */}
      {selectedGroup !== null && (
        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            {
              position: "absolute",
              bottom: 12,
              left: 16,
              right: 16,
            },
          ]}
          onPress={() => setSelectedGroup(null)}
        >
          <Text style={styles.buttonText}>Show All Muscles</Text>
        </TouchableOpacity>
      )}

      <WorkoutSelectionModal
        visible={isWorkoutModalVisible}
        onClose={() => setIsWorkoutModalVisible(false)}
        onMuscleSelect={handleMuscleSelect}
        selectedMuscles={selectedMuscles}
        startWorkout={startWorkout}
        endWorkout={endWorkout}
        workoutTimer={workoutTimer}
        isWorkoutInProgress={workoutInProgress}
      />

      {workoutInProgress && (
        <View style={styles.workoutInProgressContainer}>
          <Text style={styles.workoutInProgressText}>Workout in Progress</Text>
          <TouchableOpacity
            style={styles.endWorkoutButton}
            onPress={endWorkout}
          >
            <Text style={styles.endWorkoutButtonText}>End Workout</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={editMode} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit Days for {selectedMuscle}
            </Text>
            <TextInput
              style={styles.input}
              value={editDays}
              onChangeText={setEditDays}
              keyboardType="numeric"
              placeholder="Enter number of days"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditMode(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEdit}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default HomeScreen;
