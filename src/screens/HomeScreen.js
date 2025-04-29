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
import { useFocusEffect } from '@react-navigation/native';
import ButtonStyles from "../styles/Button";
import axios from "axios";

const HomeScreen = ({ route, navigation }) => {
  const { username } = route.params || {};
  const [muscleData, setMuscleData] = useState({});
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [isWorkoutModalVisible, setIsWorkoutModalVisible] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showWorkoutBanner, setShowWorkoutBanner] = useState(false);
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
  const [savedWorkout, setSavedWorkout] = useState(null);
  const [isWorkoutOptionsVisible, setIsWorkoutOptionsVisible] = useState(false);
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
                onPress={handleLogout}
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

  useEffect(() => {
    if (route.params?.workout) {
      setSavedWorkout(route.params.workout);
    }
  }, [route.params?.workout]);

  useFocusEffect(
    React.useCallback(() => {
      const loadSavedWorkout = async () => {
        const workoutStr = await AsyncStorage.getItem('savedWorkout');
        if (workoutStr) {
          setSavedWorkout(JSON.parse(workoutStr));
        } else {
          setSavedWorkout(null);
        }
      };
      loadSavedWorkout();
    }, [])
  );

  useEffect(() => {
    const checkWorkoutStatus = async () => {
      const inProgress = await AsyncStorage.getItem('workoutInProgress');
      if (inProgress === 'true') {
        setWorkoutInProgress(true);
        // Defensive: restore selected muscles if possible
        const musclesStr = await AsyncStorage.getItem('selectedMuscles');
        if (musclesStr) {
          try {
            const muscles = JSON.parse(musclesStr);
            if (Array.isArray(muscles) && muscles.length > 0) {
              setSelectedMuscles(muscles);
            }
          } catch {}
        }
      } else {
        setWorkoutInProgress(false);
      }
    };
    checkWorkoutStatus();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('workoutInProgress', workoutInProgress ? 'true' : 'false');
    if (workoutInProgress) {
      AsyncStorage.setItem('selectedMuscles', JSON.stringify(selectedMuscles));
    } else {
      AsyncStorage.removeItem('selectedMuscles');
    }
  }, [workoutInProgress, selectedMuscles]);

  useEffect(() => {
    console.log('DEBUG: workoutInProgress', workoutInProgress);
    console.log('DEBUG: selectedMuscles', selectedMuscles);
    console.log('DEBUG: workoutHistory', workoutHistory);
    console.log('DEBUG: isTimerRunning', isTimerRunning);
    console.log('DEBUG: muscleData', muscleData);
  }, [workoutInProgress, selectedMuscles, workoutHistory, isTimerRunning, muscleData]);

  useEffect(() => {
    if (workoutInProgress && selectedMuscles.length === 0 && workoutHistory.length > 0) {
      const lastWorkout = workoutHistory[workoutHistory.length - 1];
      if (lastWorkout && Array.isArray(lastWorkout.muscles) && lastWorkout.muscles.length > 0) {
        setSelectedMuscles(lastWorkout.muscles);
        console.log('DEBUG: Restored selectedMuscles from workoutHistory', lastWorkout.muscles);
      }
    }
  }, [workoutInProgress, selectedMuscles, workoutHistory]);

  useEffect(() => {
    if (route.params?.workoutJustSaved) {
      console.log('[HomeScreen] workoutJustSaved param detected');
      // Load the latest saved workout from AsyncStorage
      const loadAndSetWorkout = async () => {
        try {
          const workoutStr = await AsyncStorage.getItem('savedWorkout');
          if (workoutStr) {
            const workout = JSON.parse(workoutStr);
            setSavedWorkout(workout);
            setWorkoutInProgress(true);
            setIsTimerRunning(true);
            setWorkoutTimer(0);
            console.log('[HomeScreen] Workout loaded and started:', workout);
          } else {
            setSavedWorkout(null);
            setWorkoutInProgress(false);
            setIsTimerRunning(false);
            setWorkoutTimer(0);
            console.warn('[HomeScreen] No savedWorkout found in AsyncStorage');
          }
        } catch (e) {
          setSavedWorkout(null);
          setWorkoutInProgress(false);
          setIsTimerRunning(false);
          setWorkoutTimer(0);
          console.error('[HomeScreen] Error loading savedWorkout from AsyncStorage', e);
        }
        // Clean up param so it doesn't retrigger
        navigation.setParams({ workoutJustSaved: undefined });
      };
      loadAndSetWorkout();
    }
  }, [route.params?.workoutJustSaved]);

  useEffect(() => {
    if (route.params?.workoutConfig) {
      setSavedWorkout(route.params.workoutConfig);
      AsyncStorage.setItem('savedWorkout', JSON.stringify(route.params.workoutConfig));
      setWorkoutInProgress(true);
      setIsTimerRunning(true);
      setWorkoutTimer(0);
      console.log('[HomeScreen] Workout configured and started:', route.params.workoutConfig);
      navigation.setParams({ workoutConfig: undefined });
    }
  }, [route.params?.workoutConfig]);

  useEffect(() => {
    if (route.params?.workout) {
      setSavedWorkout(route.params.workout);
      AsyncStorage.setItem('savedWorkout', JSON.stringify(route.params.workout));
      setWorkoutInProgress(true);
      setIsTimerRunning(true);
      setWorkoutTimer(0);
      console.log('[HomeScreen] Workout loaded and started:', route.params.workout);
      navigation.setParams({ workout: undefined });
    }
  }, [route.params?.workout]);

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

  // Start Workout handler
  const startWorkout = async () => {
    console.log("Start Workout button pressed");
    setWorkoutInProgress(true);
    setIsTimerRunning(true);
    setWorkoutTimer(0);
    // Defensive: if no savedWorkout, create a basic one
    if (!savedWorkout) {
      const newWorkout = {
        name: 'Untitled Workout',
        exercises: [],
        startTime: new Date().toISOString(),
        notes: '',
      };
      setSavedWorkout(newWorkout);
      await AsyncStorage.setItem('savedWorkout', JSON.stringify(newWorkout));
      console.log('[HomeScreen] Created and started new workout:', newWorkout);
    } else {
      // Update start time if not set
      if (!savedWorkout.startTime) {
        const updated = { ...savedWorkout, startTime: new Date().toISOString() };
        setSavedWorkout(updated);
        await AsyncStorage.setItem('savedWorkout', JSON.stringify(updated));
        console.log('[HomeScreen] Updated workout with startTime:', updated);
      }
    }
    await AsyncStorage.setItem('workoutInProgress', 'true');
    // Redirect user to ConfigureWorkoutScreen
    navigation.navigate('ConfigureWorkout', {
      exercises: savedWorkout?.exercises || [],
      workoutName: savedWorkout?.name || 'Untitled Workout',
    });
  };

  const endWorkout = async () => {
    console.log("Inside endWorkout function");
    console.log("End Workout button pressed");
    setIsTimerRunning(false);
    setWorkoutInProgress(false);
    setSelectedMuscles([]);
    let workoutToSave = savedWorkout;
    // Defensive: If no savedWorkout in state, try to read from AsyncStorage
    if (!workoutToSave) {
      try {
        const workoutStr = await AsyncStorage.getItem('savedWorkout');
        if (workoutStr) workoutToSave = JSON.parse(workoutStr);
      } catch (e) {
        console.error("Error reading savedWorkout from AsyncStorage", e);
      }
    }
    if (!workoutToSave) {
      Alert.alert("No saved workout", "You must start and save a workout before ending it.");
      console.error("No savedWorkout found in state or AsyncStorage. Cannot end workout.");
      return;
    }
    // --- Get workout details for closed_workouts ---
    const workoutName = workoutToSave?.name || "Untitled Workout";
    let exercises = workoutToSave?.exercises;
    if (!Array.isArray(exercises) || exercises.length === 0) {
      Alert.alert("No exercises found", "Cannot save a workout with no exercises.");
      return;
    }
    const startTime = workoutToSave?.startTime || (workoutToSave?.startedAt || new Date(Date.now() - workoutTimer * 1000).toISOString());
    const endTime = new Date().toISOString();
    const duration = workoutTimer;
    const notes = workoutToSave?.notes || "";
    // Defensive: Get user_id from Redux or AsyncStorage
    let userId = user?.id;
    if (!userId) {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) userId = JSON.parse(userStr).id;
      } catch (e) {
        console.error("Error reading user from AsyncStorage", e);
      }
    }
    if (!userId) {
      Alert.alert("User not found", "You must be logged in to save workouts.");
      console.error("No user_id found in Redux or AsyncStorage. Cannot save workout.");
      return;
    }
    // Log outgoing payload for debugging
    console.log('Saving closed workout with payload:', {
      user_id: userId,
      workout_name: workoutName,
      exercises,
      start_time: startTime,
      end_time: endTime,
      duration,
      notes,
    });
    // Save closed workout to backend
    try {
      const response = await axios.post("http://localhost:5001/api/closed_workouts", {
        user_id: userId,
        workout_name: workoutName,
        exercises,
        start_time: startTime,
        end_time: endTime,
        duration,
        notes,
      });
      console.log('Backend response:', response.data);
      Alert.alert("Workout Saved", "Your workout has been saved to your history.");
      // After saving, navigate to Profile and trigger a refresh
      navigation.navigate('Profile', { refreshHistory: true });
    } catch (err) {
      console.error("Failed to save closed workout:", err?.response?.data || err.message);
      Alert.alert("Error", err?.response?.data?.error || "Failed to save workout to server.");
    }
    // --- Reset workout state ---
    setIsTimerRunning(false);
    setWorkoutInProgress(false);
    setSelectedMuscles([]);
    setWorkoutTimer(0);
    await AsyncStorage.removeItem('savedWorkout');
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

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      dispatch(logout());
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleConfigureWorkout = () => {
    setIsWorkoutOptionsVisible(false);
    navigation.navigate('ConfigureWorkout', {
      exercises: [], // Start with empty or last used
      workoutName: '',
    });
  };

  const handleStartWorkout = () => {
    console.log("Start Workout button pressed");
    setIsWorkoutModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsWorkoutModalVisible(false);
  };

  const handleMuscleSelectModal = (muscles) => {
    setSelectedMuscles(muscles);
  };

  const handleMuscleRemove = (muscle) => {
    console.log("Removing muscle:", muscle);
    setSelectedMuscles(prev => prev.filter(m => m !== muscle));
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
        {isAuthenticated && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>

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

      {/* Current Workout Section */}
      {savedWorkout && (
        <View style={styles.configuredWorkoutSection}>
          <Text style={styles.configuredWorkoutTitle}>Current Workout</Text>
          <View style={{marginBottom: 8}}>
            {savedWorkout.exercises.map((ex, idx) => (
              <View key={idx} style={styles.configuredWorkoutExerciseCard}>
                <Text style={styles.configuredWorkoutExerciseName}>{ex.name}</Text>
                <Text style={styles.configuredWorkoutExerciseDesc}>{ex.description}</Text>
                {ex.sets && ex.sets.length > 0 && (
                  <View style={{marginTop: 4}}>
                    {ex.sets.map((set, setIdx) => (
                      <View key={setIdx} style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2}}>
                        <Text style={styles.configuredWorkoutSetText}>
                          Set {setIdx+1}: {set.setType.charAt(0).toUpperCase() + set.setType.slice(1)} | Reps: {set.reps} {set.weight ? `| Weight: ${set.weight}` : ''}
                        </Text>
                        {set.notes ? <Text style={styles.configuredWorkoutSetNotes}>Notes: {set.notes}</Text> : null}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.configuredWorkoutEditButton}
            onPress={() => navigation.navigate('ConfigureWorkout', {
              exercises: savedWorkout?.exercises || [],
              workoutName: savedWorkout?.name || '',
            })}
          >
            <Text style={styles.configuredWorkoutEditButtonText}>Edit Workout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <View style={[styles.quickActions, { flexDirection: 'row', justifyContent: 'center', marginTop: 32, marginBottom: 24 }]}> 
        <TouchableOpacity
          style={[
            styles.startWorkoutButton,
            { opacity: 1 },
          ]}
          onPress={startWorkout}
        >
          <Ionicons name="barbell-outline" size={24} color="#ffffff" />
          <Text style={styles.buttonText}>Start Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.startWorkoutButton,
            {
              backgroundColor: '#23263a', // App theme: dark card
              borderWidth: 2,
              borderColor: '#4CAF50', // Green border for accent
              marginLeft: 16,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: 1, // Always enabled
            },
          ]}
          onPress={() => {
            console.log("End Workout button was pressed. workoutInProgress:", workoutInProgress);
            if (workoutInProgress) {
              endWorkout();
            } else {
              Alert.alert("No workout in progress", "Start a workout before ending it.");
            }
          }}
          disabled={false} // Always enabled
        >
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={{ marginRight: 10 }} />
          <Text style={styles.buttonText}>End Workout</Text>
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

      <Modal
        visible={isWorkoutOptionsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsWorkoutOptionsVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(20,22,34,0.97)' }}>
          <View style={{ backgroundColor: '#181a24', padding: 36, borderRadius: 22, alignItems: 'center', width: 320, borderWidth: 2, borderColor: '#4b2e83', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 18 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#f2f2f2', marginBottom: 24, letterSpacing: 1 }}>Workout Options</Text>
            <TouchableOpacity style={{ backgroundColor: '#4b2e83', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 38, marginBottom: 18, width: 220, alignItems: 'center', shadowColor: '#4b2e83', shadowOpacity: 0.4, shadowRadius: 6 }} onPress={handleConfigureWorkout}>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 18, letterSpacing: 0.5 }}>Configure Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#4b2e83', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 38, marginBottom: 0, width: 220, alignItems: 'center' }} onPress={() => setIsWorkoutOptionsVisible(false)}>
              <Text style={{ color: '#4b2e83', fontWeight: '600', fontSize: 18, letterSpacing: 0.5 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
