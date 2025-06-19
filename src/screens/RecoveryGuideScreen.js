import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import LoginRequiredModal from "../components/LoginRequiredModal";
import { styles } from "../styles/recoveryGuideStyles";
import CircularProgress from 'react-native-circular-progress-indicator';
import { format } from 'date-fns';

const MUSCLE_RECOVERY_TIMES = {
  Biceps: 48,
  Triceps: 72,
  // Forearms: 48, // Removed as per user request
  Chest: 72,
  Shoulders: 48, // Combined all deltoid parts into one
  "Back": 72, // Combined all back muscles
  Glutes: 62,
  Calves: 48,
  Quadriceps: 72,
  Hamstrings: 72,
  Core: 48,
};

const useRecoveryCountdown = (lastWorkout, recoveryTime, muscleName = 'unknown') => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [status, setStatus] = useState('Fully Recovered');
  const [statusDetails, setStatusDetails] = useState('');
  const [nextAvailable, setNextAvailable] = useState(null);

  useEffect(() => {
    if (!lastWorkout) {
      console.log(`Muscle ${muscleName}: No last workout date - considering fully rested`);
      setPercentage(100);
      setTimeLeft(0);
      setStatus('Fully Recovered');
      setStatusDetails('No workout recorded');
      setNextAvailable(new Date());
      return;
    }

    const calculateRecovery = () => {
      const now = new Date();
      const workoutDate = new Date(lastWorkout);
      
      if (isNaN(workoutDate.getTime())) {
        console.warn(`Muscle ${muscleName}: Invalid workout date:`, lastWorkout);
        setPercentage(100);
        setTimeLeft(0);
        setStatus('Fully Recovered');
        setStatusDetails('Invalid workout date');
        setNextAvailable(now);
        return;
      }

      // Calculate time difference in seconds for more precise countdown
      const timeDiffInSeconds = (now - workoutDate) / 1000;
      const recoveryTimeInSeconds = recoveryTime * 3600; // Convert hours to seconds
      const timeLeftInSeconds = Math.max(0, recoveryTimeInSeconds - timeDiffInSeconds);
      const timeLeftInHours = timeLeftInSeconds / 3600; // Convert back to hours for percentage
      const percentage = Math.min(100, ((recoveryTimeInSeconds - timeLeftInSeconds) / recoveryTimeInSeconds) * 100);
      
      // Calculate next available time
      const nextAvailableTime = new Date(workoutDate);
      nextAvailableTime.setHours(nextAvailableTime.getHours() + recoveryTime);
      
      let status, statusDetails;
      
      if (timeLeftInSeconds <= 0) {
        status = 'Fully Recovered';
        statusDetails = 'Ready to train';
      } else {
        status = 'Recovering';
        // Format time left with days, hours, minutes, and seconds
        const days = Math.floor(timeLeftInSeconds / 86400);
        const hours = Math.floor((timeLeftInSeconds % 86400) / 3600);
        const minutes = Math.floor((timeLeftInSeconds % 3600) / 60);
        const seconds = Math.floor(timeLeftInSeconds % 60);
        
        if (days > 0) {
          statusDetails = `Ready in ~${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
          statusDetails = `Ready in ~${hours}h ${minutes}m ${seconds}s`;
        } else {
          statusDetails = `Ready in ~${minutes}m ${seconds}s`;
        }
      }
      
      setTimeLeft(timeLeftInHours);
      setPercentage(percentage);
      setStatus(status);
      setStatusDetails(statusDetails);
      setNextAvailable(nextAvailableTime);
    };

    // Calculate immediately
    calculateRecovery();
    
    // Update every second for smooth countdown
    const interval = setInterval(calculateRecovery, 1000);
    
    return () => clearInterval(interval);
  }, [lastWorkout, recoveryTime, muscleName]);

  return {
    timeLeft,
    percentage,
    status,
    statusDetails,
    nextAvailable
  };
};

const MuscleRecoveryMeter = ({ muscleName, lastWorkout, recoveryTime }) => {
  const { percentage, status, statusDetails, nextAvailable, timeLeft } = useRecoveryCountdown(
    lastWorkout,
    recoveryTime,
    muscleName
  );

  // Format the remaining time for countdown with seconds
  const formatTimeLeft = (hours) => {
    if (hours <= 0) return 'Now';
    
    // Convert hours to seconds for more precise calculation
    const totalSeconds = Math.ceil(hours * 3600);
    const days = Math.floor(totalSeconds / 86400);
    const hoursRemaining = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (days > 0) {
      return `${days}d ${hoursRemaining}h ${minutes}m`;
    } else if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minutes}m ${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  };

  // Determine the color based on status
  const getStatusColor = () => {
    if (status === 'Fully Recovered') return '#10b981'; // Green
    if (status === 'Recovering') return timeLeft < 24 ? '#f59e0b' : '#ef4444'; // Yellow if <24h, else Red
    return '#ef4444'; // Red
  };

  return (
    <View style={styles.muscleCard}>
      <View style={styles.muscleHeader}>
        <Text style={styles.muscleName}>{muscleName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <CircularProgress
          value={percentage}
          radius={48}
          duration={1000}
          progressValueColor={getStatusColor()}
          activeStrokeColor={getStatusColor()}
          inActiveStrokeColor="#e5e7eb"
          maxValue={100}
          title={`${status === 'Fully Recovered' ? 'Ready' : formatTimeLeft(timeLeft)}`}
          titleStyle={[styles.progressTitle, { color: getStatusColor() }]}
          titleFontSize={14}
          progressValueFontSize={16}
          progressValueStyle={{ fontWeight: 'bold' }}
        />
        <View style={styles.recoveryInfo}>
          <Text style={styles.recoveryText}>
            Recovery: {recoveryTime}h
          </Text>
          <Text style={[styles.recoveryText, { color: getStatusColor() }]}>
            {statusDetails}
          </Text>
          {nextAvailable && status !== 'Fully Recovered' && (
            <Text style={[styles.recoveryText, { fontSize: 12, opacity: 0.8 }]}>
              Ready by: {format(nextAvailable, 'MMM d, h:mm a')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const RecoveryGuideScreen = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    }
  }, [user]);
  // Get the muscle status from Redux store
  const muscleStatus = useSelector((state) => state.workout?.muscleStatus) || {};
  const workouts = useSelector((state) => state.workout?.workouts || []);
  
  console.log('RecoveryGuideScreen - Raw muscle status from Redux:', muscleStatus);
  console.log('Total workouts in history:', workouts.length);
  
  // Default muscle groups with their recovery times (in hours)
  const defaultMuscleGroups = {
    'Chest': { recoveryTime: 72 },
    'Biceps': { recoveryTime: 48 },
    'Triceps': { recoveryTime: 48 },
    'Back': { recoveryTime: 72 }, // This covers all back muscles
    'Shoulders': { recoveryTime: 48 },
    'Core': { recoveryTime: 24 }, // Maps to 'abs' in Redux
    // 'Forearms': { recoveryTime: 48 }, // Removed as per user request
    'Quads': { recoveryTime: 72 },
    'Hamstrings': { recoveryTime: 72 },
    'Calves': { recoveryTime: 48 },
    'Glutes': { recoveryTime: 72 }
  };

  // Create a map of muscle display names to their status
  const muscleGroups = { ...defaultMuscleGroups };
  
  // Update with actual data from Redux
  Object.entries(muscleStatus).forEach(([muscleKey, data]) => {
    // Convert the key to display name (capitalized first letter)
    const displayName = muscleKey.charAt(0).toUpperCase() + muscleKey.slice(1);
    
    // Special case for 'abs' which is stored as 'abs' but displayed as 'Core'
    const displayNameToUse = muscleKey === 'abs' ? 'Core' : displayName;
    
    if (muscleGroups[displayNameToUse]) {
      muscleGroups[displayNameToUse] = {
        ...muscleGroups[displayNameToUse],
        lastWorkout: data.lastWorkout,
        recoveryTime: data.recoveryTime || defaultMuscleGroups[displayNameToUse]?.recoveryTime || 48
      };
      console.log(`Updated muscle group ${displayNameToUse} with data:`, data);
    } else {
      console.warn(`No matching display name for muscle key: ${muscleKey} (tried ${displayName} and ${displayNameToUse})`);
    }
  });
  
  // Log the final processed data for debugging
  console.log('Final muscle groups with recovery data:', muscleGroups);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recovery Guide</Text>
        <Text style={styles.subtitle}>Track your muscle recovery status</Text>
        <Text style={styles.workoutCount}>Total Workouts: {workouts.length}</Text>
      </View>

      <View style={styles.content}>
        {Object.entries(muscleGroups)
          .filter(([muscle]) => !['Traps', 'Trapezius'].includes(muscle)) // Exclude Traps/Trapezius
          .map(([muscle, data]) => {
            const recoveryTime = data.recoveryTime || 48; // Default to 48 hours if not set
            return (
              <MuscleRecoveryMeter
                key={muscle}
                muscleName={muscle}
                lastWorkout={data.lastWorkout}
                recoveryTime={recoveryTime}
              />
            );
          })}
      </View>
    </ScrollView>
  );
};

export default RecoveryGuideScreen;
