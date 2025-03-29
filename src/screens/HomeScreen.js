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
import { styles } from "../styles/homeStyles";
import { MUSCLE_GROUPS } from "../constants/muscleGroups";

const HomeScreen = ({ navigation }) => {
  const [muscleData, setMuscleData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [editDays, setEditDays] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Animation for muscle buttons
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  const loadStreak = async () => {
    try {
      const savedStreak = await AsyncStorage.getItem("streak");
      setStreak(savedStreak ? parseInt(savedStreak) : 0);
    } catch (error) {
      console.error("Failed to load streak", error);
    }
  };

  const loadAchievements = async () => {
    try {
      const savedAchievements = await AsyncStorage.getItem("achievements");
      setAchievements(savedAchievements ? JSON.parse(savedAchievements) : []);
    } catch (error) {
      console.error("Error loading achievements", error);
    }
  };

  const updateMuscle = async (muscle) => {
    try {
      const newData = { ...muscleData, [muscle]: 0 };
      setMuscleData(newData);
      await AsyncStorage.setItem("muscleData", JSON.stringify(newData));

      // update streak
      const now = new Date();
      const lastDate = await AsyncStorage.getItem("lastTrainedDate");
      if (!lastDate || now - new Date(lastDate) <= 24 * 60 * 60 * 1000) {
        setStreak((prev) => prev + 1);
        await AsyncStorage.setItem("streak", (streak + 1).toString());
      } else {
        setStreak(1);
        await AsyncStorage.setItem("streak", "1");
      }
      await AsyncStorage.setItem("lastTrainedDate", now.toString());

      // check for achievements
      checkAchievements();

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

  const checkAchievements = async () => {
    const newAchievements = [...achievements];

    // Check for streak achievements
    if (streak >= 7 && !achievements.includes("weekStreak")) {
      newAchievements.push("weekStreak");
    }
    if (streak >= 30 && !achievements.includes("monthStreak")) {
      newAchievements.push("monthStreak");
    }

    // Check for muscle group achievements
    const readyMuscles = Object.values(muscleData).filter(
      (days) => days >= 48
    ).length;
    if (readyMuscles >= 5 && !achievements.includes("fiveReady")) {
      newAchievements.push("fiveReady");
    }
    if (readyMuscles >= 10 && !achievements.includes("tenReady")) {
      newAchievements.push("tenReady");
    }

    if (newAchievements.length !== achievements.length) {
      setAchievements(newAchievements);
      await AsyncStorage.setItem(
        "achievements",
        JSON.stringify(newAchievements)
      );
      Alert.alert(
        "Achievement Unlocked!",
        "You've unlocked a new achievement!"
      );
    }
  };

  const handleEdit = (muscle) => {
    setSelectedMuscle(muscle);
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
    setEditDays(muscleData[muscle].toString());
    setEditMode(true);
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
    } catch (error) {
      Alert.alert("Error", "Failed to save changes");
    }
  };

  const renderMuscleItem = ({ item: muscle }) => {
    const days = muscleData[muscle] || 0;
    const status = days < 48 ? "rest" : days < 72 ? "caution" : "ready";

    return (
      <TouchableOpacity
        style={styles.muscleItem}
        onPress={() => updateMuscle(muscle)}
        onLongPress={() => handleEdit(muscle)}
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
        data={MUSCLE_GROUPS}
        renderItem={renderMuscleItem}
        keyExtractor={(item) => item}
        style={styles.list}
        contentContainerStyle={styles.listContainer}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => {
            const upperBody = [
              "Biceps",
              "Triceps",
              "Chest",
              "Shoulders",
              "Traps",
              "Back",
            ];
            upperBody.forEach((muscle) => updateMuscle(muscle));
          }}
        >
          <Ionicons name="body" size={24} color="#4CAF50" />
          <Text style={styles.quickActionText}>Upper Body</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => {
            const lowerBody = ["Quads", "Hamstrings", "Glutes", "Calves"];
            lowerBody.forEach((muscle) => updateMuscle(muscle));
          }}
        >
          <Ionicons name="body" size={24} color="#2196F3" />
          <Text style={styles.quickActionText}>Lower Body</Text>
        </TouchableOpacity>
      </View>

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
