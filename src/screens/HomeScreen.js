import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
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
  StyleSheet,
  ActivityIndicator,
  Platform,
  InteractionManager
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { addWorkout } from "../redux/workoutSlice";
import { styles as baseStyles } from "../styles/HomeStyles";
import { MUSCLE_GROUPS } from "../constants/muscleGroups";
import WorkoutBanner from "../components/workoutBanner";
import WorkoutSelectionModal from "../components/workoutSelectionModal";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from '@react-navigation/native';
import ButtonStyles from "../styles/Button";
import axios from "axios";
import { safeNavigate, safePush } from '../shims/NavigationWeb';

// Memoize the muscle group components to prevent unnecessary re-renders
const MuscleGroupItem = memo(({ group, onPress, isSelected, style }) => (
  <TouchableOpacity
    style={[
      styles.muscleGroup,
      style,
      isSelected && styles.selectedMuscleGroup
    ]}
    onPress={onPress}
  >
    <Text style={styles.muscleGroupText}>{group}</Text>
  </TouchableOpacity>
));

const HomeScreen = ({ route, navigation }) => {
  const handleCancelWorkout = async () => {
    try {
      // Clear the workout data
      await AsyncStorage.removeItem('savedWorkout');
      await AsyncStorage.removeItem('workoutInProgress');
      await AsyncStorage.removeItem('selectedMuscles');
      
      // Update local state
      setSavedWorkout(null);
      setWorkoutInProgress(false);
      setSelectedMuscles([]);
      
      console.log('Workout cancelled successfully');
    } catch (error) {
      console.error('Error cancelling workout:', error);
      Alert.alert('Error', 'Failed to cancel workout. Please try again.');
    }
  };

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
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [completedMuscles, setCompletedMuscles] = useState([]);
  const [affectedMuscles, setAffectedMuscles] = useState([]);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Set up header with login/logout button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        isAuthenticated ? (
          <TouchableOpacity
            style={[ButtonStyles.headerButton, { 
              marginRight: 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
              backgroundColor: '#dc3545'
            }]}
            onPress={async () => {
              try {
                await dispatch(logout()).unwrap();
                navigation.navigate('Login');
              } catch (error) {
                console.error('Logout failed:', error);
              }
            }}
          >
            <Text style={[ButtonStyles.headerButtonText, { fontSize: 12 }]}>
              Logout
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[ButtonStyles.headerButton, { 
              marginRight: 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
              backgroundColor: '#6b46c1'
            }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[ButtonStyles.headerButtonText, { fontSize: 12 }]}>
              Login
            </Text>
          </TouchableOpacity>
        )
      ),
    });
  }, [navigation, isAuthenticated, dispatch]);
  const workoutTimerRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Memoize muscle groups to prevent recreation on every render
  const { UPPER_BODY, LOWER_BODY, ALL_MUSCLE_GROUPS } = useMemo(() => ({
    UPPER_BODY: ["Biceps", "Triceps", "Chest", "Shoulders", "Back"],
    LOWER_BODY: ["Quads", "Hamstrings", "Calves", "Glutes"],
    ALL_MUSCLE_GROUPS: ["Biceps", "Triceps", "Chest", "Shoulders", "Back", "Quads", "Hamstrings", "Calves", "Glutes"]
  }), []);

  // Memoize the getStatus function to prevent recreation on every render
  const getStatus = useCallback((days) => {
    if (days === 0) return "red";
    if (days < 3) return "yellow";
    return "green";
  }, []);

  // Memoize the muscle group list components
  const renderMuscleGroupSection = useCallback((muscles, title) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={muscles}
        renderItem={({ item }) => (
          <MuscleGroupItem
            group={item}
            isSelected={selectedMuscles.includes(item)}
            onPress={() => handleMusclePress(item)}
            style={[styles[`${getStatus(muscleData[item]?.days || 0)}Status`], selectedMuscles.includes(item) && styles.selectedMuscleGroup]}
          />
        )}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.muscleGroupList}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        initialNumToRender={5}
      />
    </View>
  ), [getStatus, muscleData, selectedMuscles, handleMusclePress]);

  // Optimize the muscle press handler with useCallback
  const handleMusclePress = useCallback((muscle) => {
    setSelectedMuscles(prev => {
      if (prev.includes(muscle)) {
        return prev.filter(m => m !== muscle);
      } else {
        return [...prev, muscle];
      }
    });
  }, []);

  useEffect(() => {
    if (!isTimerRunning) return;
    
    // Use requestAnimationFrame for smoother timer updates
    let animationFrameId;
    let lastUpdateTime = Date.now();
    
    const updateTimer = () => {
      const now = Date.now();
      const delta = now - lastUpdateTime;
      
      // Only update the timer every second, not on every frame
      if (delta >= 1000) {
        setWorkoutTimer(prev => {
          const newTime = prev + Math.floor(delta / 1000);
          lastUpdateTime = now - (delta % 1000); // Account for any extra milliseconds
          return newTime;
        });
      }
      
      if (isTimerRunning) {
        animationFrameId = requestAnimationFrame(updateTimer);
      }
    };
    
    // Start the animation loop
    animationFrameId = requestAnimationFrame(updateTimer);
    
    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isTimerRunning]);

  // Function to determine muscle status based on days
  // const getStatus = (days) => {
  //   if (days <= 1) {
  //     return "red"; // Do not train
  //   } else if (days <= 3) {
  //     return "yellow"; // Caution
  //   } else {
  //     return "green"; // Safe to train
  //   }
  // };

  // Get muscle status from Redux store
  const muscleStatus = useSelector((state) => state.workout?.muscleStatus) || {};
  const workouts = useSelector((state) => state.workout?.workouts || []);

  // Function to format time in a user-friendly way
  const formatTimeLeft = (hours) => {
    if (hours <= 0) return 'now';
    
    const days = Math.floor(hours / 24);
    const remainingHours = Math.ceil(hours % 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` and ${remainingHours} hour${remainingHours > 1 ? 's' : ''}` : ''}`;
    }
    return `${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
  };

  // Function to get next recommended workout time
  const getNextWorkoutTime = () => {
    // First check if there's a workout in progress and it has exercises
    if (workoutInProgress && savedWorkout?.exercises?.length > 0) {
      return {
        message: 'Workout currently in progress',
        timeLeft: 0,
        status: 'inProgress'
      };
    }

    // Check if any muscles in local muscleData have 0 days (just worked out)
    const recentlyWorkedMuscles = Object.entries(muscleData)
      .filter(([muscle, days]) => days === 0)
      .map(([muscle]) => muscle);
      
    // If we have muscles that were just worked out, show them as ready
    if (recentlyWorkedMuscles.length > 0) {
      return {
        message: 'Ready for your next workout!',
        timeLeft: 0,
        status: 'ready',
        muscles: recentlyWorkedMuscles
      };
    }
    
    // Original logic for other cases
    if (!workouts || workouts.length === 0) {
      return { 
        message: 'Ready for your first workout!', 
        timeLeft: 0,
        status: 'ready'
      };
    }

    // Get the most recent workout
    const latestWorkout = [...workouts].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )[0];

    if (!latestWorkout || !latestWorkout.muscles || latestWorkout.muscles.length === 0) {
      return { 
        message: 'No muscle data in latest workout', 
        timeLeft: 0,
        status: 'ready'
      };
    }

    // Find the muscle group with the longest recovery time
    let longestRecovery = { timeLeft: 0, muscle: '', recoveryTime: 0 };
    
    latestWorkout.muscles.forEach(muscleName => {
      const muscleKey = muscleName.toLowerCase();
      const muscleData = muscleStatus[muscleKey];
      
      if (muscleData && muscleData.lastWorkout) {
        const recoveryTime = muscleData.recoveryTime || 72; // Default to 72 hours if not set
        const lastWorkout = new Date(muscleData.lastWorkout);
        const now = new Date();
        const hoursSinceWorkout = (now - lastWorkout) / (1000 * 60 * 60);
        const timeLeft = Math.max(0, recoveryTime - hoursSinceWorkout);
        
        if (timeLeft > longestRecovery.timeLeft) {
          longestRecovery = {
            timeLeft,
            muscle: muscleName,
            recoveryTime,
            lastWorkout: muscleData.lastWorkout
          };
        }
      }
    });

    if (longestRecovery.timeLeft > 0) {
      const timeLeftFormatted = formatTimeLeft(longestRecovery.timeLeft);
      const recoveryTimeFormatted = formatTimeLeft(longestRecovery.recoveryTime);
      
      return {
        message: `Next workout in ~${timeLeftFormatted} (${longestRecovery.muscle} recovery: ${recoveryTimeFormatted})`,
        timeLeft: longestRecovery.timeLeft,
        muscle: longestRecovery.muscle,
        status: longestRecovery.timeLeft < 24 ? 'soon' : 'wait',
        lastWorkout: longestRecovery.lastWorkout
      };
    }
    
    return { 
      message: 'Ready for your next workout!', 
      timeLeft: 0,
      status: 'ready'
    };
  };

  // Get next workout information
  const nextWorkoutInfo = getNextWorkoutTime();

  // Use existing muscle status from Redux store (same as Calculator page)

  // Helper function to calculate hours since last workout
  const getHoursSinceWorkout = (lastWorkout) => {
    if (!lastWorkout) return Infinity; // No workout = fully recovered
    const now = new Date();
    const workoutDate = new Date(lastWorkout);
    return (now - workoutDate) / (1000 * 60 * 60); // Convert to hours
  };

  // Memoized live counters using Redux data (same as Calculator page)
  const readyMusclesCount = useMemo(() => {
    const muscleGroups = ['chest', 'biceps', 'triceps', 'back', 'shoulders', 'quads', 'hamstrings', 'calves', 'glutes', 'abs'];
    const recoveryTimes = {
      chest: 72, biceps: 48, triceps: 48, back: 72, shoulders: 48,
      quads: 72, hamstrings: 72, calves: 48, glutes: 72, abs: 24
    };
    
    return muscleGroups.filter(muscle => {
      const muscleData = muscleStatus[muscle];
      const hoursSince = getHoursSinceWorkout(muscleData?.lastWorkout);
      const recoveryTime = muscleData?.recoveryTime || recoveryTimes[muscle] || 48;
      return hoursSince >= recoveryTime; // Fully recovered
    }).length;
  }, [muscleStatus]);

  const restingMusclesCount = useMemo(() => {
    const muscleGroups = ['chest', 'biceps', 'triceps', 'back', 'shoulders', 'quads', 'hamstrings', 'calves', 'glutes', 'abs'];
    const recoveryTimes = {
      chest: 72, biceps: 48, triceps: 48, back: 72, shoulders: 48,
      quads: 72, hamstrings: 72, calves: 48, glutes: 72, abs: 24
    };
    
    return muscleGroups.filter(muscle => {
      const muscleData = muscleStatus[muscle];
      const hoursSince = getHoursSinceWorkout(muscleData?.lastWorkout);
      const recoveryTime = muscleData?.recoveryTime || recoveryTimes[muscle] || 48;
      return hoursSince < recoveryTime; // Still recovering
    }).length;
  }, [muscleStatus]);

  const musclesReadyToTrainCount = useMemo(() => {
    return Object.values(muscleData).filter((days) => days >= 72).length;
  }, [muscleData]);

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

  // Load data when the component mounts
  useEffect(() => {
    loadMuscleData();
    loadStreak();
    loadAchievements();
  }, []);
  
  // Refresh data when screen comes into focus or gets a refresh parameter
  useFocusEffect(
    React.useCallback(() => {
      console.log('Home screen focused - refreshing muscle data from workout history');
      loadMuscleData();
      return () => {};
    }, [route.params?.refresh]) // Refresh when the refresh parameter changes
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={[ButtonStyles.headerButton, { 
            marginRight: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
            backgroundColor: isAuthenticated ? '#dc3545' : '#6b46c1'
          }]}
          onPress={() => {
            if (isAuthenticated) {
              dispatch(logout());
              navigation.navigate('Home');
            } else {
              navigation.navigate('Login');
            }
          }}
        >
          <Text style={[ButtonStyles.headerButtonText, { fontSize: 12 }]}>
            {isAuthenticated ? 'Logout' : 'Login'}
          </Text>
        </TouchableOpacity>
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

  // Function to load workout history from API
  const loadWorkoutHistory = async () => {
    if (!user || !user.id) {
      console.log("User not authenticated, can't load workout history");
      return [];
    }
    
    try {
      const response = await axios.get(
        `http://localhost:5001/api/closed_workouts?user_id=${user.id}`
      );
      
      if (response.data && Array.isArray(response.data.workouts)) {
        // Sort workouts by date (newest first)
        const sortedWorkouts = response.data.workouts.sort((a, b) => 
          new Date(b.end_time) - new Date(a.end_time)
        );
        
        setWorkoutHistory(sortedWorkouts);
        return sortedWorkouts;
      }
      
      return [];
    } catch (error) {
      console.error("Failed to load workout history:", error);
      return [];
    }
  };

  // Enhanced function to load muscle data with history integration
  const loadMuscleData = async () => {
    try {
      // First load existing muscle data from AsyncStorage
      const savedData = await AsyncStorage.getItem("muscleData");
      let muscleDataObj = {};
      
      if (savedData !== null) {
        muscleDataObj = JSON.parse(savedData);
      } else {
        // Initialize with default values if no saved data
        muscleDataObj = MUSCLE_GROUPS.reduce((acc, muscle) => {
          acc[muscle] = 0;
          return acc;
        }, {});
      }
      
      // Load workout history to calculate accurate recovery times
      const workoutHistory = await loadWorkoutHistory();
      
      if (workoutHistory.length > 0) {
        // Create a map to track the most recent workout for each muscle group
        const muscleLastWorkout = {};
        
        // Process all workouts to find the most recent one for each muscle
        workoutHistory.forEach(workout => {
          if (Array.isArray(workout.exercises)) {
            // Set to collect all muscles worked in this workout
            const workoutMuscles = new Set();
            
            workout.exercises.forEach(exercise => {
              // Method 1: Directly from muscleGroups array
              if (exercise.muscleGroups && Array.isArray(exercise.muscleGroups)) {
                exercise.muscleGroups.forEach(muscle => workoutMuscles.add(muscle));
              }
              
              // Method 2: From exercise ID using the mapping
              if (exercise.id) {
                const id = parseInt(exercise.id);
                if (!isNaN(id)) {
                  if (id >= 1 && id <= 27) workoutMuscles.add('Chest');
                  else if (id >= 28 && id <= 39) workoutMuscles.add('Biceps');
                  else if (id >= 40 && id <= 51) workoutMuscles.add('Triceps');
                  else if (id >= 52 && id <= 76) workoutMuscles.add('Back');
                  else if (id >= 77 && id <= 98) workoutMuscles.add('Shoulders');
                  else if (id >= 99 && id <= 118) workoutMuscles.add('Legs');
                }
              }
              
              // Method 3: From exercise name
              if (exercise.name) {
                const name = exercise.name.toLowerCase();
                if (name.includes('chest') || name.includes('bench') || name.includes('pec')) {
                  workoutMuscles.add('Chest');
                }
                if (name.includes('bicep') || name.includes('curl')) {
                  workoutMuscles.add('Biceps');
                }
                if (name.includes('tricep') || name.includes('extension') || name.includes('pushdown')) {
                  workoutMuscles.add('Triceps');
                }
                if (name.includes('shoulder') || name.includes('delt') || name.includes('press')) {
                  workoutMuscles.add('Shoulders');
                }
                if (name.includes('back') || name.includes('row') || name.includes('pull')) {
                  workoutMuscles.add('Back');
                }
                if (name.includes('leg') || name.includes('quad') || name.includes('squat')) {
                  workoutMuscles.add('Legs');
                }
              }
            });
            
            // Now update the muscle last workout timestamps
            workoutMuscles.forEach(muscleGroup => {
              // Format muscle name to match keys in muscleData
              const muscleKey = muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1).toLowerCase();
              
              // If this is the first or more recent workout for this muscle, update the timestamp
              if (!muscleLastWorkout[muscleKey] || 
                  new Date(workout.end_time) > new Date(muscleLastWorkout[muscleKey].timestamp)) {
                muscleLastWorkout[muscleKey] = {
                  timestamp: workout.end_time,
                  workoutName: workout.workout_name
                };
                console.log(`Found ${muscleKey} workout on ${new Date(workout.end_time).toLocaleDateString()} in workout: ${workout.workout_name}`);
              }
            });
          }
        });
        
        // Calculate days since last workout for each muscle group
        const now = new Date();
        Object.keys(muscleLastWorkout).forEach(muscle => {
          const lastWorkoutDate = new Date(muscleLastWorkout[muscle].timestamp);
          const diffTime = Math.abs(now - lastWorkoutDate);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          // Update the days value in muscleDataObj
          if (muscleDataObj.hasOwnProperty(muscle)) {
            muscleDataObj[muscle] = diffDays;
            console.log(`Updated ${muscle} to ${diffDays} days based on workout history`); 
          }
        });
        
        // Save the updated data
        await AsyncStorage.setItem("muscleData", JSON.stringify(muscleDataObj));
      }
      
      // Update state with the calculated data
      setMuscleData(muscleDataObj);
      
    } catch (error) {
      console.error("Error loading muscle data:", error);
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

  // Clear selected muscles
  const clearAllMuscles = useCallback(() => {
    setSelectedMuscles([]);
  }, []);

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
    // Redirect user to ConfigureWorkoutScreen using safe navigation
    try {
      console.log('[HomeScreen] Safely navigating to ConfigureWorkout');
      const handleConfigureWorkout = () => {
        safeNavigate(navigation, 'ConfigureWorkout');
      };

      const handleCancelWorkout = async () => {
        try {
          // Clear the workout data
          await AsyncStorage.removeItem('savedWorkout');
          await AsyncStorage.removeItem('workoutInProgress');
          await AsyncStorage.removeItem('selectedMuscles');
          
          // Update local state
          setSavedWorkout(null);
          setWorkoutInProgress(false);
          setSelectedMuscles([]);
          
          console.log('Workout cancelled successfully');
        } catch (error) {
          console.error('Error cancelling workout:', error);
          Alert.alert('Error', 'Failed to cancel workout. Please try again.');
        }
      };
      handleConfigureWorkout();
    } catch (e) {
      console.error('[HomeScreen] Navigation error:', e);
      Alert.alert('Navigation Error', 'Unable to navigate to the workout configuration screen. Please try again.');
    }
  };

  const endWorkout = async () => {
    console.log("Inside endWorkout function");
    console.log("End Workout button pressed");
    // Stop timer but don't reset other states until we've processed everything
    setIsTimerRunning(false);
    
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
    
    // Prepare workout data
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

    // --- Expanded: Robust muscle group extraction and mapping ---
    // Utility to extract detailed muscle groups from exercise
    function extractMuscleKeysFromExercise(exercise) {
      const keys = new Set();
      const name = (exercise.name || '').toLowerCase();
      const desc = (exercise.description || '').toLowerCase();
      
      // MODIFIED: Only detect calf exercises specifically
      // Check for calf-specific terms in name or description
      const isCalfExercise = 
        name.includes('calf') || 
        name.includes('calves') || 
        desc.includes('calf') || 
        desc.includes('calves') ||
        (name.includes('raise') && (name.includes('heel') || name.includes('toe')));
      
      if (isCalfExercise) {
        keys.add('calves');
        console.log('Detected calf exercise:', exercise.name);
        return Array.from(keys);
      }
      
      // For all other exercises, we don't track them for muscle recovery purposes
      // but we still identify them for display purposes
      
      // First try to map by muscle group ID
      if (exercise.muscle_group_id) {
        switch (parseInt(exercise.muscle_group_id)) {
          case 1: keys.add('chest'); break;
          case 2: keys.add('biceps'); break;
          case 3: keys.add('triceps'); break;
          case 4: // BACK
            keys.add('back');  // All back exercises go to one category
            break;
          case 5: // SHOULDERS
            keys.add('shoulders');
            break;
          case 6: // LEGS
            // Only add specific leg muscles based on exercise name/description
            if (name.includes('quad') || desc.includes('quad') || name.includes('extension')) keys.add('quads');
            if (name.includes('hamstring') || desc.includes('hamstring') || name.includes('leg curl')) keys.add('hamstrings');
            if (name.includes('glute') || desc.includes('glute') || name.includes('hip thrust') || name.includes('bridge')) keys.add('glutes');
            break;
          case 7: // CORE
            keys.add('abs');
            break;
          default:
            break;
        }
      }
      
      // Fallback: check for muscleGroups array
      if (exercise.muscleGroups && Array.isArray(exercise.muscleGroups)) {
        exercise.muscleGroups.forEach(muscle => {
          if (muscle.toLowerCase() !== 'calves') {
            keys.add(muscle.toLowerCase());
          }
        });
      }
      
      return Array.from(keys);
    }
    // ---
    const musclesWorked = new Set();
    if (workoutToSave && Array.isArray(workoutToSave.exercises)) {
      workoutToSave.exercises.forEach(exercise => {
        extractMuscleKeysFromExercise(exercise).forEach(muscle => musclesWorked.add(muscle));
      });
    }
    // If no muscles were detected, add any explicitly selected muscles
    if (selectedMuscles && selectedMuscles.length > 0) {
      selectedMuscles.forEach(muscle => musclesWorked.add(muscle.toLowerCase()));
    }
    const muscleArray = Array.from(musclesWorked);
    console.log('Muscles worked in this workout (Redux keys):', muscleArray);

    // STEP 1: Save to backend first
    let savedToBackend = false;
    try {
      console.log('Attempting to save workout to backend...');
      const response = await axios.post("http://localhost:5001/api/closed_workouts", {
        user_id: userId,
        workout_name: workoutName,
        exercises,
        start_time: startTime,
        end_time: endTime,
        duration,
        notes,
      }, { timeout: 3000 }); // Add a timeout to fail faster if server is unreachable
      
      console.log('Backend response:', response.data);
      savedToBackend = true;
    } catch (err) {
      console.error("Failed to save closed workout:", err?.response?.data || err.message);
      // Don't alert here, we'll handle it below
    }

    // STEP 2: Update Redux state for muscle recovery tracking
    // --- Ensure 'core' is included if any core/abs exercise is present ---
    const reduxCoreExercise = workoutToSave.exercises && Array.isArray(workoutToSave.exercises) && workoutToSave.exercises.some(
      (ex) => ex.name && (
        ex.name.toLowerCase().includes('core') ||
        ex.name.toLowerCase().includes('abs') ||
        ex.name.toLowerCase().includes('abdominal')
      )
    );
    let muscleArrayFinal = [...muscleArray];
    const muscleArrayLower = muscleArrayFinal.map(m => m.toLowerCase());
    if (reduxCoreExercise && !muscleArrayLower.includes('core') && !muscleArrayLower.includes('abs')) {
      muscleArrayFinal.push('core');
      console.log('Added "core" to muscle list for Redux timer update.');
    }
    if (muscleArrayFinal.length > 0) {
      // Dispatch action to update muscle status in Redux
      dispatch(addWorkout({
        date: endTime || new Date().toISOString(),
        muscles: muscleArrayFinal,
        intensity: workoutToSave.intensity || 'medium', // Default intensity
        name: workoutToSave.name || 'Unnamed Workout',
        exercises: workoutToSave.exercises
      }));

      // --- NEW: If workout contains core/abs exercises, update core timer in Redux only if not already present in muscleArray ---
      const hasCoreExercise = workoutToSave.exercises && Array.isArray(workoutToSave.exercises) && workoutToSave.exercises.some(
        (ex) => ex.name && (
          ex.name.toLowerCase().includes('core') ||
          ex.name.toLowerCase().includes('abs') ||
          ex.name.toLowerCase().includes('abdominal')
        )
      );
      const muscleArrayLower = muscleArray.map(m => m.toLowerCase());
      if (hasCoreExercise && !muscleArrayLower.includes('core') && !muscleArrayLower.includes('abs')) {
        dispatch(addWorkout({
          date: endTime || new Date().toISOString(),
          muscles: ['core'], // This will be mapped to 'abs' in Redux
          intensity: workoutToSave.intensity || 'unknown',
          name: workoutToSave.name || 'Core Workout',
          exercises: workoutToSave.exercises
        }));
        console.log('Core/abs workout detected: triggering core timer update in Redux with endTime:', endTime);
      }
      // --- END NEW ---
      
      // STEP 3: Immediately reset the visual display for worked muscles in local state
      // This ensures that the calculator page updates right away, regardless of API calls
      const newMuscleData = { ...muscleData };
      
      // Debug log to help diagnose the issue
      console.log('Current muscle data before reset:', JSON.stringify(newMuscleData));
      console.log('Muscles to reset:', muscleArray);
      
      // Check if workout contains calf exercises before updating calf muscle recovery meter
      const hasCalfExercise = workoutToSave.exercises && Array.isArray(workoutToSave.exercises) && workoutToSave.exercises.some(
        (ex) => {
          // Check exercise name and description for calf-specific terms
          const name = (ex.name || '').toLowerCase();
          const desc = (ex.description || '').toLowerCase();
          return name.includes('calf') || name.includes('calves') || 
                 desc.includes('calf') || desc.includes('calves') ||
                 name.includes('raise') && (name.includes('heel') || name.includes('toe'));
        }
      );
      
      console.log('Has calf exercise?', hasCalfExercise);
      
      // Only update calf muscle if calf exercises were performed
      if (hasCalfExercise) {
        const muscleKey = 'Calves';
        if (newMuscleData.hasOwnProperty(muscleKey)) {
          console.log(`Resetting ${muscleKey} from ${newMuscleData[muscleKey]} days to 0 days`);
          newMuscleData[muscleKey] = 0; // Reset to 0 days - just worked out!
        }
      }
      
      // Directly update the UI state first for immediate feedback
      setMuscleData(newMuscleData);
      
      // Then save to persistent storage
      await AsyncStorage.setItem("muscleData", JSON.stringify(newMuscleData));
      
      // Log the updated state for verification
      console.log('Updated muscle data after reset:', JSON.stringify(newMuscleData));
    }
    
    // STEP 4: Reset workout state AFTER everything is saved
    setWorkoutInProgress(false);
    setSelectedMuscles([]);
    setWorkoutTimer(0);
    setSavedWorkout(null);
    await AsyncStorage.removeItem('savedWorkout');
    await AsyncStorage.removeItem('workoutInProgress');
    await AsyncStorage.removeItem('selectedMuscles');

    // STEP 5: Immediately refresh data and show alert
    await loadWorkoutHistory();
    await loadMuscleData();

    // Force an immediate refresh by updating route params
    navigation.setParams({ refresh: Date.now() });

    // Get list of muscles that were worked
    const musclesWorkedList = Array.from(musclesWorked);
    setCompletedMuscles(musclesWorkedList);
    
    // Get the affected muscle recovery meters
    const affectedMuscles = [];
    
    // Check for calf exercises
    const workoutHasCalfExercise = workoutToSave.exercises && Array.isArray(workoutToSave.exercises) && workoutToSave.exercises.some(
      (ex) => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('calf') || name.includes('calves') || 
               desc.includes('calf') || desc.includes('calves') ||
               name.includes('raise') && (name.includes('heel') || name.includes('toe'));
      }
    );
    if (workoutHasCalfExercise) affectedMuscles.push('Calves');
    
    // Check for core exercises - use a different variable name to avoid conflicts
    const workoutHasCoreExercise = workoutToSave.exercises && Array.isArray(workoutToSave.exercises) && workoutToSave.exercises.some(
      (ex) => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('core') || name.includes('abs') || name.includes('abdominal') ||
               desc.includes('core') || desc.includes('abs') || desc.includes('abdominal') ||
               name.includes('crunch') || name.includes('plank') || name.includes('sit-up') ||
               desc.includes('crunch') || desc.includes('plank') || desc.includes('sit-up');
      }
    );
    if (workoutHasCoreExercise) affectedMuscles.push('Abs');
    
    // Check for compound leg exercises
    const hasCompoundLegExercise = workoutToSave.exercises && Array.isArray(workoutToSave.exercises) && workoutToSave.exercises.some(
      (ex) => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('squat') || desc.includes('squat') ||
               name.includes('leg press') || desc.includes('leg press') ||
               name.includes('hack squat') || desc.includes('hack squat') ||
               name.includes('lunge') || desc.includes('lunge') ||
               name.includes('step up') || desc.includes('step up') ||
               name.includes('deadlift') || desc.includes('deadlift') ||
               name.includes('bulgarian split') || desc.includes('bulgarian split') ||
               name.includes('leg day') || desc.includes('leg day');
      }
    );
    if (hasCompoundLegExercise) {
      affectedMuscles.push('Quads');
      affectedMuscles.push('Hamstrings');
      affectedMuscles.push('Glutes');
    }
    
    // Check for quad-only exercises
    const hasQuadOnlyExercise = workoutToSave.exercises && Array.isArray(workoutToSave.exercises) && workoutToSave.exercises.some(
      (ex) => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return (name.includes('quad') || desc.includes('quad') ||
                name.includes('leg extension') || desc.includes('leg extension') ||
                name.includes('sissy squat') || desc.includes('sissy squat')) &&
               !hasCompoundLegExercise; // Don't double count if compound exercises exist
      }
    );
    if (hasQuadOnlyExercise) affectedMuscles.push('Quads');
    
    // Check for chest exercises
    const hasChestExercise = workoutToSave.exercises && Array.isArray(workoutToSave.exercises) && workoutToSave.exercises.some(
      (ex) => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('chest') || desc.includes('chest') ||
               name.includes('pec') || desc.includes('pec') ||
               name.includes('bench press') || desc.includes('bench press') ||
               name.includes('push-up') || name.includes('pushup') ||
               desc.includes('push-up') || desc.includes('pushup') ||
               name.includes('fly') || desc.includes('fly') ||
               name.includes('dip') || desc.includes('dip') ||
               name.includes('decline') || name.includes('incline');
      }
    );
    if (hasChestExercise) affectedMuscles.push('Chest');
    
    // Check for back exercises
    const hasBackExercise = workoutToSave.exercises && Array.isArray(workoutToSave.exercises) && workoutToSave.exercises.some(
      (ex) => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('back') || desc.includes('back') ||
               name.includes('lat') || desc.includes('lat') ||
               name.includes('row') || desc.includes('row') ||
               name.includes('pull') || desc.includes('pull') ||
               name.includes('pulldown') || desc.includes('pulldown') ||
               name.includes('pullup') || desc.includes('pullup') ||
               name.includes('chin up') || desc.includes('chin up') ||
               name.includes('deadlift') || desc.includes('deadlift');
      }
    );
    if (hasBackExercise) affectedMuscles.push('Back');
    
    // Check for shoulder exercises
    const hasShoulderExercise = workoutToSave.exercises && Array.isArray(workoutToSave.exercises) && workoutToSave.exercises.some(
      (ex) => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('shoulder') || desc.includes('shoulder') ||
               name.includes('delt') || desc.includes('delt') ||
               name.includes('press') || desc.includes('press') ||
               name.includes('military') || desc.includes('military') ||
               name.includes('lateral raise') || desc.includes('lateral raise') ||
               name.includes('front raise') || desc.includes('front raise') ||
               name.includes('rear delt') || desc.includes('rear delt') ||
               name.includes('face pull') || desc.includes('face pull') ||
               name.includes('upright row') || desc.includes('upright row');
      }
    );
    if (hasShoulderExercise) affectedMuscles.push('Shoulders');
    
    // Check for biceps exercises
    const hasBicepsExercise = workoutToSave.exercises && Array.isArray(workoutToSave.exercises) && workoutToSave.exercises.some(
      (ex) => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('bicep') || desc.includes('bicep') ||
               name.includes('curl') || desc.includes('curl') ||
               name.includes('preacher') || desc.includes('preacher') ||
               name.includes('hammer') || desc.includes('hammer') ||
               name.includes('concentration') || desc.includes('concentration') ||
               name.includes('drag') || desc.includes('drag');
      }
    );
    if (hasBicepsExercise) affectedMuscles.push('Biceps');
    
    // Check for triceps exercises
    const hasTricepsExercise = workoutToSave.exercises && Array.isArray(workoutToSave.exercises) && workoutToSave.exercises.some(
      (ex) => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('tricep') || desc.includes('tricep') ||
               name.includes('extension') || desc.includes('extension') ||
               name.includes('pushdown') || desc.includes('pushdown') ||
               name.includes('kickback') || desc.includes('kickback') ||
               name.includes('skull crusher') || desc.includes('skull crusher') ||
               name.includes('close grip') || desc.includes('close grip') ||
               name.includes('overhead extension') || desc.includes('overhead extension');
      }
    );
    if (hasTricepsExercise) affectedMuscles.push('Triceps');
    
    // Set the affected muscles for the celebration modal
    setAffectedMuscles(affectedMuscles);
    setShowCelebrationModal(true);
    
    // CRITICAL: Update local muscle data to reset recovery timers
    const updatedMuscleData = { ...muscleData };
    affectedMuscles.forEach(muscle => {
      // Reset the muscle to 0 days (just worked out)
      updatedMuscleData[muscle] = 0;
      console.log(`Reset ${muscle} recovery timer to 0 days`);
    });
    
    // Update state immediately for live counter refresh
    setMuscleData(updatedMuscleData);
    
    // Save updated muscle data to AsyncStorage
    try {
      await AsyncStorage.setItem("muscleData", JSON.stringify(updatedMuscleData));
      console.log('Updated muscle data saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving updated muscle data:', error);
    }
    
    // Show appropriate alert with muscles worked
    // Removed Alert.alert calls to ensure only the celebration modal is shown
    if (savedToBackend) {
      console.log('Workout saved to backend successfully');
    } else {
      console.log('Workout saved locally only');
    }
    
    // Clean up workout state
    setSavedWorkout(null);
    setWorkoutInProgress(false);
    setSelectedMuscles([]);
    setWorkoutTimer(0);
    
    // Clear workout from AsyncStorage
    try {
      await AsyncStorage.removeItem('savedWorkout');
      await AsyncStorage.removeItem('workoutInProgress');
      await AsyncStorage.removeItem('selectedMuscles');
    } catch (error) {
      console.error('Error clearing workout data:', error);
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
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Memoize the quick actions
  const quickActions = useMemo(() => {
    const handleStartWorkout = () => {
      try {
        console.log('[HomeScreen] Start Workout button pressed - calling startWorkout function');
        startWorkout();
      } catch (e) {
        console.error('[HomeScreen] Start Workout button error:', e);
        Alert.alert('Error', 'There was an error starting the workout. Please try again.');
      }
    };

    return (
      <View style={[styles.quickActions, { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginTop: 24, 
        marginBottom: 20 
      }]}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 1,
            paddingVertical: 10,
            paddingHorizontal: 16,
            width: '45%',
            backgroundColor: '#6b46c1',
            borderRadius: 8,
          }}
          onPress={handleStartWorkout}
        >
          <Ionicons name="barbell-outline" size={20} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 15, marginLeft: 6, fontWeight: '600' }}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    );
  }, [startWorkout]);

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

  // Render muscle selection banner
  const renderMuscleSelectionBanner = () => {
    if (selectedMuscles.length === 0) return null;
    
    return (
      <View style={styles.muscleSelectionBanner}>
        <Text style={styles.bannerTitle}>Selected Muscles ({selectedMuscles.length})</Text>
        <View style={styles.selectedMusclesList}>
          {selectedMuscles.map((muscle) => (
            <TouchableOpacity
              key={muscle}
              style={styles.selectedMuscleItem}
              onPress={() => handleMuscleRemove(muscle)}
            >
              <Text style={styles.selectedMuscleText}>{muscle}</Text>
              <Ionicons name="close-circle" size={16} color="#ff4444" />
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
      </View>

      {/* Streak Counter */}
      <View style={styles.streakContainer}>
        <Ionicons name="trophy" size={24} color="#FFD700" />
        <Text style={styles.streakText}>{streak} day streak!</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => {
            try {
              safeNavigate(navigation, 'Calculator', { 
                filterType: 'ready',
                highlightReady: true 
              });
            } catch (e) {
              console.error('Navigation error to Calculator (ready muscles):', e);
            }
          }}
        >
          <Text style={styles.statNumber}>
            {readyMusclesCount}
          </Text>
          <Text style={styles.statLabel}>Ready Muscles</Text>
          <Ionicons name="chevron-forward" size={16} color="#6b46c1" style={{ marginTop: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => {
            try {
              safeNavigate(navigation, 'Calculator', { 
                filterType: 'resting',
                highlightResting: true 
              });
            } catch (e) {
              console.error('Navigation error to Calculator (resting muscles):', e);
            }
          }}
        >
          <Text style={styles.statNumber}>
            {restingMusclesCount}
          </Text>
          <Text style={styles.statLabel}>Resting Muscles</Text>
          <Ionicons name="chevron-forward" size={16} color="#6b46c1" style={{ marginTop: 4 }} />
        </TouchableOpacity>
      </View>

      {/* Next Workout Indicator */}
      <View style={[
        styles.nextWorkoutContainer, 
        { 
          backgroundColor: nextWorkoutInfo.status === 'ready' ? '#6b46c1' : 
                         nextWorkoutInfo.status === 'soon' ? '#f59e0b' : 
                         nextWorkoutInfo.status === 'inProgress' ? '#f59e0b' : '#ef4444',
          borderLeftWidth: 6,
          borderLeftColor: nextWorkoutInfo.status === 'ready' ? '#553c9a' : 
                          nextWorkoutInfo.status === 'soon' ? '#b45309' : 
                          nextWorkoutInfo.status === 'inProgress' ? '#b45309' : '#b91c1c'
        }
      ]}>
        <Text style={styles.nextWorkoutText}>
          {nextWorkoutInfo.status === 'ready' ? '🏋️ ' : 
           nextWorkoutInfo.status === 'soon' ? '⏳ ' : '⏳ '}
          {nextWorkoutInfo.message}
        </Text>
        {nextWorkoutInfo.lastWorkout && (
          <Text style={styles.lastWorkoutText}>
            Last workout: {new Date(nextWorkoutInfo.lastWorkout).toLocaleString()}
          </Text>
        )}
      </View>

      {/* Current Workout Section */}
      {savedWorkout && savedWorkout.exercises && savedWorkout.exercises.length > 0 && (
        <View style={styles.configuredWorkoutSection}>
          <View style={styles.workoutHeaderRow}>
            <Text style={styles.configuredWorkoutTitle}>Current Workout</Text>
            <TouchableOpacity
              style={styles.cancelWorkoutButton}
              onPress={handleCancelWorkout}
            >
              <Ionicons name="close-circle-outline" size={24} color="#e53e3e" />
              <Text style={styles.cancelWorkoutText}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
                        {set.notes && (
                          <Text style={styles.configuredWorkoutSetNotes}>Notes: {set.notes}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.configuredWorkoutEditButton}
            onPress={() => {
              try {
                console.log('[HomeScreen] Safely navigating to ConfigureWorkout from Edit button');
                safeNavigate(navigation, 'ConfigureWorkout', {
                  exercises: savedWorkout?.exercises || [],
                  workoutName: savedWorkout?.name || '',
                });
              } catch (e) {
                console.error('[HomeScreen] Edit button navigation error:', e);
                Alert.alert('Navigation Error', 'Unable to navigate to the workout configuration screen. Please try again.');
              }
            }}
          >
            <Text style={styles.configuredWorkoutEditButtonText}>Edit Workout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <View style={[styles.quickActions, { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 20 }]}> 
        <TouchableOpacity
          style={[
            styles.startWorkoutButton,
            { 
              opacity: 1,
              paddingVertical: 10,
              paddingHorizontal: 16,
              width: '45%', // Make button narrower
            },
          ]}
          onPress={() => {
            try {
              console.log('[HomeScreen] Start Workout button pressed - calling startWorkout function');
              startWorkout();
            } catch (e) {
              console.error('[HomeScreen] Start Workout button error:', e);
              Alert.alert('Error', 'There was an error starting the workout. Please try again.');
            }
          }}
        >
          <Ionicons name="barbell-outline" size={20} color="#ffffff" />
          <Text style={[styles.buttonText, {fontSize: 15, marginLeft: 6}]}>Start Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.startWorkoutButton,
            {
              backgroundColor: '#23263a', // App theme: dark card
              borderWidth: 2,
              borderColor: '#4CAF50', // Green border for accent
              marginLeft: 12,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: 1, // Always enabled
              paddingVertical: 10,
              paddingHorizontal: 16,
              width: '45%', // Make button narrower
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
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={{ marginRight: 6 }} />
          <Text style={[styles.buttonText, {fontSize: 15}]}>End Workout</Text>
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

      {/* Workout Completion Celebration Modal (only modal kept, updated style/text) */}
      <Modal
        visible={showCelebrationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCelebrationModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(20,22,34,0.0)' }}>
          <View style={{ backgroundColor: '#6b46c1', padding: 36, borderTopLeftRadius: 22, borderTopRightRadius: 22, alignItems: 'center', width: '100%', borderWidth: 0, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 18 }}>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 16, letterSpacing: 1, textAlign: 'center' }}>
              🎉 Workout Complete! 🎉
            </Text>
            <Text style={{ fontSize: 17, color: '#fff', marginBottom: 16, textAlign: 'center' }}>
              Great job! You've completed your workout for:
            </Text>
            {affectedMuscles.length > 0 && (
              <View style={{ width: '100%', marginBottom: 18 }}>
                {affectedMuscles.map((muscle, index) => (
                  <Text key={index} style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: 2 }}>
                    {muscle}
                  </Text>
                ))}
              </View>
            )}
            <Text style={{ fontSize: 16, color: '#fff', marginBottom: 22, textAlign: 'center' }}>
              Your recovery timers have been reset.
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 38, width: 220, alignItems: 'center' }}
              onPress={() => {
                setShowCelebrationModal(false);
              }}
            >
              <Text style={{ color: '#6b46c1', fontWeight: '600', fontSize: 18 }}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isWorkoutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <WorkoutSelectionModal
          onClose={handleCloseModal}
          onMuscleSelect={handleMuscleSelectModal}
          onMuscleRemove={handleMuscleRemove}
          selectedMuscles={selectedMuscles}
        />
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

const styles = StyleSheet.create({
  ...baseStyles,
  workoutHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cancelWorkoutText: {
    color: '#e53e3e',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  muscleSelectionBanner: {
    backgroundColor: '#2a2d47',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6b46c1',
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedMusclesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  selectedMuscleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3d4066',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  selectedMuscleText: {
    color: '#ffffff',
    fontSize: 12,
    marginRight: 4,
  },
  clearAllButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearAllText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HomeScreen;
