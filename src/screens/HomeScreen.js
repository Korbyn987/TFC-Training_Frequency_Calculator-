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

const HomeScreen = ({ navigation }) => {
  const [muscleData, setMuscleData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [editDays, setEditDays] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const [trainedMuscles, setTrainedMuscles] = useState([]);
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Animation for muscle buttons
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
  const LOWER_BODY = ["Quads", "Hamstrings", "Glutes", "Calves"];

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

  const startWorkout = () => {
    setWorkoutInProgress(true);
    setSelectedMuscles([]);
    navigation.navigate("WorkoutTracking");
  };

  const addMuscleToSelection = (muscle) => {
    if (!selectedMuscles.includes(muscle)) {
      setSelectedMuscles([...selectedMuscles, muscle]);
    }
  };

  const removeMuscleFromSelection = (muscle) => {
    setSelectedMuscles(selectedMuscles.filter((m) => m !== muscle));
  };

  const updateMuscle = async (muscle) => {
    try {
      const newData = { ...muscleData, [muscle]: 0 };
      setMuscleData(newData);
      await AsyncStorage.setItem("muscleData", JSON.stringify(newData));

      // Update the recovery timer for this muscle
      await AsyncStorage.setItem(
        `recoveryTimer_${muscle}`,
        new Date().toString()
      );

      // Track trained muscles for this workout
      if (!trainedMuscles.includes(muscle)) {
        setTrainedMuscles([...trainedMuscles, muscle]);
      }

      // Trigger animation
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }).start();
      });
    } catch (error) {
      Alert.alert("Error", "Failed to update muscle data");
    }
  };

  const endWorkout = async () => {
    try {
      if (trainedMuscles.length === 0) {
        Alert.alert(
          "No Muscles Trained",
          "Please train at least one muscle before ending your workout"
        );
        return;
      }

      const now = new Date();
      const lastDate = await AsyncStorage.getItem("lastTrainedDate");
      let newStreak = 1;

      if (lastDate) {
        const lastDateObj = new Date(lastDate);
        const daysSinceLastWorkout = Math.floor(
          (now - lastDateObj) / (24 * 60 * 60 * 1000)
        );

        if (daysSinceLastWorkout < 2) {
          newStreak = streak + 1;
        } else if (daysSinceLastWorkout >= 2) {
          newStreak = 1;
        }
      }

      setStreak(newStreak);
      await AsyncStorage.setItem("streak", newStreak.toString());

      await AsyncStorage.setItem("lastTrainedDate", now.toString());
      await AsyncStorage.setItem("trainedMuscles", JSON.stringify([]));

      // Reset workout state
      setWorkoutInProgress(false);
      setTrainedMuscles([]);
      setSelectedMuscles([]);

      // Check for achievements
      checkAchievements();

      Alert.alert(
        "Workout Complete!",
        `Great job! Your streak is now ${newStreak} days. Keep it up!`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to end workout");
    }
  };

  const handleEdit = (muscle) => {
    setEditMode(true);
    setEditDays(muscleData[muscle].toString());
    setEditMode(true);
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
            handleMusclePress(muscle);
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
              onPress={() => removeMuscleFromSelection(muscle)}
            >
              <Text style={styles.chipText}>{muscle}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
          onPress={startWorkout}
          disabled={workoutInProgress}
        >
          <Ionicons name="play-circle" size={24} color="#2196F3" />
          <Text style={styles.quickActionText}>Start Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionItem, styles.endWorkoutButton]}
          onPress={endWorkout}
          disabled={!workoutInProgress || trainedMuscles.length === 0}
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
            UPPER_BODY.forEach((muscle) => updateMuscle(muscle));
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
            LOWER_BODY.forEach((muscle) => updateMuscle(muscle));
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
