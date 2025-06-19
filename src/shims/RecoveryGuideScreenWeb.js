/**
 * Web-specific wrapper for RecoveryGuideScreen
 * This ensures all components and styles are compatible with web DOM
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView } from "react-native-web";
import { useSelector } from "react-redux";
import { styles } from "../styles/recoveryGuideStyles";
import CircularProgressWeb from "./CircularProgressWeb";
import { format } from 'date-fns';
import { createSelector } from 'reselect';

// Comprehensive mapping of muscle groups to their display names and related terms
const MUSCLE_GROUPS = {
  // Upper Body - Push
  chest: {
    displayName: 'Chest',
    relatedTerms: ['chest', 'pec', 'pectoral', 'pushup', 'bench', 'fly', 'dip'],
    recoveryTime: 72 // hours
  },
  // Upper Body - Pull
  back: {
    displayName: 'Back',
    relatedTerms: ['back', 'lat', 'rhomboid', 'row', 'pullup', 'pulldown', 't-bar', 'deadlift', 'lower back', 'hyperextension'],
    recoveryTime: 72
  },
  // Shoulders - combined all deltoid parts into one
  shoulders: {
    displayName: 'Shoulders',
    relatedTerms: [
      // Front deltoid terms
      'front delt', 'shoulder press', 'military press', 'front raise', 'arnold press',
      // Side deltoid terms
      'lateral raise', 'side delt', 'upright row', 'shoulder fly',
      // Rear deltoid terms
      'rear delt', 'face pull', 'bent over raise', 'reverse fly',
      // General shoulder terms
      'shoulder', 'deltoid', 'delt', 'press', 'overhead'
    ],
    recoveryTime: 48
  },
  // Arms
  biceps: {
    displayName: 'Biceps',
    relatedTerms: ['bicep', 'curl', 'chinup', 'hammer curl', 'preacher curl'],
    recoveryTime: 48
  },
  triceps: {
    displayName: 'Triceps',
    relatedTerms: ['tricep', 'extension', 'pushdown', 'skullcrusher', 'dip', 'close grip'],
    recoveryTime: 48
  },
  // Forearms removed as per user request
  // forearms: {
  //   displayName: 'Forearms',
  //   relatedTerms: ['wrist curl', 'reverse curl', 'grip', 'farmer\'s walk', 'plate pinch'],
  //   recoveryTime: 48
  // },
  // Core
  core: {
    displayName: 'Core',
    relatedTerms: ['core', 'ab', 'abs', 'abdominal', 'six pack', 'crunch', 'situp', 'plank'],
    recoveryTime: 48
  },
  abs: {
    displayName: 'Core',  // Map to the same display name for UI consistency
    relatedTerms: ['ab', 'abs', 'crunch', 'situp', 'leg raise', 'plank', 'russian twist', 'hanging knee raise'],
    recoveryTime: 48
  },
  obliques: {
    displayName: 'Core',  // Map to the same display name for UI consistency
    relatedTerms: ['oblique', 'side bend', 'woodchopper', 'russian twist', 'side abs'],
    recoveryTime: 48
  },

  // Lower Body
  quads: {
    displayName: 'Quadriceps',
    relatedTerms: ['quad', 'leg extension', 'squat', 'lunge', 'leg press', 'step up', 'hack squat'],
    recoveryTime: 72
  },
  hamstrings: {
    displayName: 'Hamstrings',
    relatedTerms: ['hamstring', 'leg curl', 'romanian deadlift', 'stiff leg', 'good morning'],
    recoveryTime: 72
  },
  glutes: {
    displayName: 'Glutes',
    relatedTerms: ['glute', 'butt', 'hip thrust', 'donkey kick', 'frog pump', 'squat', 'lunge'],
    recoveryTime: 72
  },
  calves: {
    displayName: 'Calves',
    relatedTerms: ['calf', 'raise', 'donkey', 'seated calf'],
    recoveryTime: 48
  },
  // Other muscle groups can be added here
};

// Generate recovery times from MUSCLE_GROUPS with special handling for duplicates
const MUSCLE_RECOVERY_TIMES = Object.entries(MUSCLE_GROUPS).reduce((acc, [_, { displayName, recoveryTime }]) => {
  // Only add a muscle group if it doesn't already exist or has a higher recovery time
  if (!acc[displayName] || recoveryTime > acc[displayName]) {
    acc[displayName] = recoveryTime;
  }
  return acc;
}, {});

// Ensure we have a Core entry with the correct recovery time
MUSCLE_RECOVERY_TIMES['Core'] = 48;

// Clean implementation of the recovery countdown hook
const useRecoveryCountdown = (lastWorkout, recoveryTime, muscleName = 'unknown') => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [status, setStatus] = useState('Fully Recovered');
  const [statusDetails, setStatusDetails] = useState('');
  const [nextAvailable, setNextAvailable] = useState(null);

  useEffect(() => {
    if (!lastWorkout) {
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
        setPercentage(100);
        setTimeLeft(0);
        setStatus('Fully Recovered');
        setStatusDetails('Invalid date');
        setNextAvailable(new Date());
        return;
      }
      
      // Calculate hours since workout
      const hoursSinceWorkout = (now - workoutDate) / (1000 * 60 * 60);
      
      // Calculate recovery percentage
      const recoveryPercentage = Math.min(100, Math.round((hoursSinceWorkout / recoveryTime) * 100));
      
      // Calculate time left
      const hoursLeft = Math.max(0, recoveryTime - hoursSinceWorkout);
      
      // Calculate next available date
      const nextDate = new Date(workoutDate.getTime() + (recoveryTime * 60 * 60 * 1000));
      
      // Determine status
      let currentStatus = 'Recovering';
      let details = `Last workout: ${format(workoutDate, 'MMM d, h:mm a')}`;
      
      if (recoveryPercentage >= 100) {
        currentStatus = 'Fully Recovered';
        details = `Last workout: ${format(workoutDate, 'MMM d, h:mm a')}`;
      }
      
      setPercentage(recoveryPercentage);
      setTimeLeft(hoursLeft);
      setStatus(currentStatus);
      setStatusDetails(details);
      setNextAvailable(nextDate);
    };
    
    calculateRecovery();
    const interval = setInterval(calculateRecovery, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [lastWorkout, recoveryTime]);

  return { percentage, status, statusDetails, nextAvailable, timeLeft };
};

// Clean implementation of the muscle recovery meter
const MuscleRecoveryMeter = ({ muscleName, lastWorkout, recoveryTime }) => {
  const { percentage, status, statusDetails, nextAvailable, timeLeft } = useRecoveryCountdown(
    lastWorkout,
    recoveryTime,
    muscleName
  );

  // Format the remaining time for countdown with more precision
  const formatTimeLeft = (hours) => {
    if (hours <= 0) return 'Now';
    
    const totalSeconds = Math.ceil(hours * 3600);
    const days = Math.floor(totalSeconds / 86400);
    const hoursRemaining = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (days > 0) {
      return `${days}d ${hoursRemaining}h`;
    } else if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  // Get countdown text with appropriate styling
  const getCountdownText = () => {
    if (status === 'Fully Recovered') return 'Ready';
    if (timeLeft <= 0) return 'Now';
    
    const totalMinutes = Math.ceil(timeLeft * 60);
    if (totalMinutes <= 60) {
      // Show seconds when under 1 hour
      const seconds = Math.ceil((timeLeft * 60 - Math.floor(timeLeft * 60)) * 60);
      return `${Math.floor(totalMinutes)}m ${seconds}s`;
    }
    return formatTimeLeft(timeLeft);
  };

  // Determine the color based on status
  const getStatusColor = () => {
    if (status === 'Fully Recovered') return '#10b981'; // Green
    if (status === 'Recovering') return timeLeft < 24 ? '#f59e0b' : '#ef4444'; // Yellow if <24h, else Red
    return '#ef4444'; // Red
  };

  // Modified styling for web compatibility with dark theme
  const webStyles = {
    muscleCard: {
      backgroundColor: 'rgba(30, 32, 42, 0.9)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
    },
    muscleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    muscleName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
    statusBadge: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,
    },
    statusText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    progressBar: {
      flex: 1,
      height: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 4,
      marginRight: 16,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    timeLeft: {
      fontSize: 14,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.8)',
      minWidth: 60,
      textAlign: 'right',
    },
    recoveryInfo: {
      marginLeft: 16,
      flex: 1,
    },
    recoveryText: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 4,
    },
  };

  return (
    <View style={webStyles.muscleCard}>
      <View style={webStyles.muscleHeader}>
        <Text style={webStyles.muscleName}>{muscleName}</Text>
        <View style={{...webStyles.statusBadge, backgroundColor: getStatusColor()}}>
          <Text style={webStyles.statusText}>{status}</Text>
        </View>
      </View>
      <View style={webStyles.progressContainer}>
        <View style={{ alignItems: 'center' }}>
          <CircularProgressWeb
            value={percentage}
            radius={48}
            duration={1000}
            progressValueColor={getStatusColor()}
            activeStrokeColor={getStatusColor()}
            inActiveStrokeColor="rgba(255, 255, 255, 0.1)"
            maxValue={100}
            title={getCountdownText()}
            titleStyle={{
              ...webStyles.progressTitle,
              color: getStatusColor(),
              fontWeight: 'bold',
              fontSize: percentage === 100 ? 16 : 14
            }}
            titleFontSize={16}
            progressValueStyle={{ 
              fontWeight: 'bold',
              color: getStatusColor(),
              fontSize: 18
            }}
          />
          {percentage < 100 && (
            <Text style={{
              fontSize: 10,
              color: '#6b7280',
              marginTop: 4,
              textAlign: 'center'
            }}>
              {Math.round(percentage)}%
            </Text>
          )}
        </View>
        <View style={webStyles.recoveryInfo}>
          <Text style={webStyles.recoveryText}>
            <Text style={{fontWeight: '600'}}>Recovery:</Text> {recoveryTime}h
          </Text>
          <Text style={{...webStyles.recoveryText, color: getStatusColor()}}>
            {statusDetails}
          </Text>
          {nextAvailable && status !== 'Fully Recovered' && (
            <View style={{marginTop: 4}}>
              <Text style={{...webStyles.recoveryText, fontSize: 12, opacity: 0.9, marginBottom: 2}}>
                Ready by:
              </Text>
              <Text style={{
                ...webStyles.recoveryText,
                fontSize: 12,
                fontWeight: '600',
                color: getStatusColor()
              }}>
                {format(nextAvailable, 'MMM d, h:mm a')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// Create a memoized selector for workout history and muscle status
const selectWorkoutData = createSelector(
  [(state) => state.workout || {}],
  (workoutState) => ({
    workouts: workoutState.workouts || [],
    muscleStatus: workoutState.muscleStatus || {}
  })
);



// Helper function to get all variations for a muscle group
const getMuscleVariations = (muscleKey) => {
  const muscle = MUSCLE_GROUPS[muscleKey];
  if (!muscle) return [muscleKey];
  
  // Start with the display name and related terms
  const variations = [
    muscle.displayName.toLowerCase(),
    muscleKey,
    ...muscle.relatedTerms
  ];
  
  // Handle shoulders variations
  if (muscleKey.includes('shoulders') || muscleKey.includes('shoulder')) {
    variations.push(
      'delt',
      'deltoid',
      'shoulder',
      'shoulders',
      'front delt',
      'side delt',
      'rear delt',
      'front deltoid',
      'side deltoid',
      'rear deltoid',
      'lateral deltoid',
      'anterior deltoid',
      'posterior deltoid',
      'shoulder press',
      'military press',
      'overhead press',
      'lateral raise',
      'front raise',
      'rear delt fly',
      'face pull',
      'upright row'
    );
  }
  
  // Special handling for core first
  if (muscleKey === 'core' || muscleKey === 'abs' || muscleKey === 'obliques') {
    // Ensure all core-related terms map to 'Core' for consistency
    variations.push('core', 'abs', 'abdominals', 'abdominal', 'oblique', 'stomach', 'midsection');
    variations.push('six pack', 'rectus abdominis', 'transverse abdominis', 'internal oblique', 'external oblique');
    variations.push('crunch', 'sit up', 'leg raise', 'plank', 'russian twist', 'side bend', 'ab wheel');
  }
  
  // Add common variations for other muscle groups
  if (muscleKey.includes('bicep')) {
    variations.push('biceps');
  } else if (muscleKey.includes('tricep')) {
    variations.push('triceps');
  } else if (muscleKey.includes('quad')) {
    variations.push('quads', 'thigh');
  } else if (muscleKey.includes('hamstring')) {
    variations.push('hams', 'ham');
  } else if (muscleKey.includes('glute')) {
    variations.push('butt', 'buttock', 'glutes');
  }
  // Forearm reference removed as per user request
  // else if (muscleKey.includes('forearm')) {
  //   variations.push('forearms');
  // }
  
  return [...new Set(variations)]; // Remove duplicates
};

// Clean implementation of the recovery guide screen
const RecoveryGuideScreenWeb = () => {
  // Use the memoized selector to get workout data from Redux
  const { workouts, muscleStatus } = useSelector(selectWorkoutData);
  
  // Process the muscle status to match the expected format
  const muscleLastWorkoutDates = useMemo(() => {
    const result = {};
    
    // First, process all muscle statuses from Redux
    Object.entries(muscleStatus).forEach(([muscleKey, data]) => {
      if (!data || !data.lastWorkout) return;
      
      const lowerMuscleKey = muscleKey.toLowerCase();
      let matched = false;
      
      // Try to find a matching muscle group
      for (const [key, group] of Object.entries(MUSCLE_GROUPS)) {
        // Check if the muscle key matches any variations
        const variations = getMuscleVariations(key);
        const isMatch = variations.some(v => 
          v.toLowerCase() === lowerMuscleKey || 
          lowerMuscleKey.includes(v.toLowerCase()) ||
          v.toLowerCase().includes(lowerMuscleKey)
        );
        
        if (isMatch) {
          result[group.displayName] = data.lastWorkout;
          matched = true;
          
          // Special handling for shoulders
          if (key.includes('deltoid')) {
            // Update all deltoid parts if any deltoid is worked
            result['Deltoid (front)'] = data.lastWorkout;
            result['Deltoid (side)'] = data.lastWorkout;
            result['Deltoid (rear)'] = data.lastWorkout;
          }
          
          // Special handling for core - make sure it maps to 'Core' for the UI
          if (key === 'core' || key === 'abs' || key === 'obliques') {
            result['Core'] = data.lastWorkout;
          }
          
          break;
        }
      }
      
      // If no match found, add as is
      if (!matched) {
        const displayName = muscleKey.charAt(0).toUpperCase() + muscleKey.slice(1);
        result[displayName] = data.lastWorkout;
      }
    });
    
    // Process workout history as a fallback for any missing muscle data
    if (Array.isArray(workouts) && workouts.length > 0) {
      const sortedWorkouts = [...workouts].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      sortedWorkouts.forEach(workout => {
        if (!workout || !workout.muscles) return;
        
        const workoutDate = new Date(workout.date);
        if (isNaN(workoutDate.getTime())) return;
        
        // Process each muscle in the workout
        workout.muscles.forEach(muscleName => {
          if (!muscleName) return;
          
          // Try to match the muscle name with our muscle groups
          const normalizedMuscle = muscleName.trim().toLowerCase();
          let displayName = null;
          let bestMatchScore = 0;
          
          // Find the best matching muscle group
          for (const [key, group] of Object.entries(MUSCLE_GROUPS)) {
            const variations = getMuscleVariations(key);
            
            // Check for exact matches first (highest priority)
            const isExactMatch = variations.some(v => v.toLowerCase() === normalizedMuscle);
            if (isExactMatch) {
              displayName = group.displayName;
              bestMatchScore = 4; // Highest score for exact match
              break;
            }
            
            // Special handling for core-related terms
            const isCoreTerm = ['core', 'ab', 'abs', 'abdominal', 'oblique', 'crunch', 'plank', 'situp'].some(term => 
              normalizedMuscle.includes(term)
            );
            
            if (isCoreTerm && (key === 'core' || key === 'abs' || key === 'obliques')) {
              displayName = 'Core'; // Always map to 'Core' for UI consistency
              bestMatchScore = 3; // High score for core terms
              break; // Use break to immediately use this match
            }
            
            // Special handling for deltoids
            if (key.includes('deltoid')) {
              const deltType = key.split('_')[1];
              const isDeltMatch = variations.some(v => {
                const lowerV = v.toLowerCase();
                return normalizedMuscle.includes(lowerV) || lowerV.includes(normalizedMuscle);
              });
              
              if (isDeltMatch && bestMatchScore < 2.5) {
                displayName = group.displayName;
                bestMatchScore = 2.5; // High score for deltoid matches
              }
              continue;
            }
            
            // Check for partial matches
            if (bestMatchScore < 2) {
              const hasPartialMatch = variations.some(v => {
                const lowerV = v.toLowerCase();
                return normalizedMuscle.includes(lowerV) || lowerV.includes(normalizedMuscle);
              });
              
              if (hasPartialMatch) {
                displayName = group.displayName;
                bestMatchScore = 1.5; // Medium score for partial matches
              }
            }
          }
          
          // Final fallback for common terms
          if (!displayName) {
            if (['core', 'abs', 'ab', 'abdominal', 'oblique', 'midsection', 'stomach'].includes(normalizedMuscle) ||
                normalizedMuscle.includes('core') || normalizedMuscle.includes('ab')) {
              displayName = 'Core';
            } else if (normalizedMuscle.includes('shoulder') || normalizedMuscle.includes('delt')) {
              displayName = 'Deltoid (front)';
            }
          }
          
          // If we found a matching display name, update the last workout date
          if (displayName) {
            const currentDate = result[displayName] ? new Date(result[displayName]) : null;
            if (!currentDate || workoutDate > currentDate) {
              result[displayName] = workoutDate.toISOString();
            }
          }
        });
      });
    }
    
    return result;
  }, [muscleStatus, workouts]);

  // Modified styling for web compatibility with dark theme
  const webStyles = {
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#171923', // Dark theme background
    },
    headerContainer: {
      marginBottom: 24,
      borderBottomWidth: 4,
      borderBottomColor: '#6b46c1', // Purple accent
      paddingBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 2,
    },
    subtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 16,
    },
    scrollView: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 24,
    },
  };

  return (
    <View style={webStyles.container}>
      <View style={webStyles.headerContainer}>
        <Text style={webStyles.title}>Recovery Guide</Text>
        <Text style={webStyles.subtitle}>
          Track your muscle recovery and optimize your training frequency
        </Text>
      </View>
      
      <ScrollView style={webStyles.scrollView}>
        <View>
          <Text style={webStyles.sectionTitle}>Muscle Recovery Status</Text>
          {Object.entries(MUSCLE_RECOVERY_TIMES)
            .filter(([muscle]) => muscle !== 'Forearms') // Explicitly filter out Forearms
            .map(([muscle, recoveryTime]) => {
          // Get the last workout date for this muscle
          let lastWorkout = muscleLastWorkoutDates[muscle];
          
          // If no exact match, try to find a similar muscle name
          if (!lastWorkout) {
            const muscleLower = muscle.toLowerCase();
            for (const [key, value] of Object.entries(muscleLastWorkoutDates)) {
              if (key.toLowerCase() === muscleLower || 
                  key.toLowerCase().includes(muscleLower) || 
                  muscleLower.includes(key.toLowerCase())) {
                lastWorkout = value;
                break;
              }
            }
          }
          
          return (
            <MuscleRecoveryMeter
              key={muscle}
              muscleName={muscle}
              recoveryTime={recoveryTime}
              lastWorkout={lastWorkout}
            />
          );
        })}
        </View>
      </ScrollView>
    </View>
  );
};

export default RecoveryGuideScreenWeb;
