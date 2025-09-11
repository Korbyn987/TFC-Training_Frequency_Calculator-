import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import LoginRequiredModal from "../components/LoginRequiredModal";
import { getCurrentUser, logoutUser } from "../services/supabaseAuth";
import {
  getUserStats,
  getUserWorkoutHistory,
  getWorkoutDetails
} from "../services/supabaseWorkouts";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showWorkoutDetailsModal, setShowWorkoutDetailsModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [workoutDetails, setWorkoutDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        setShowLoginModal(true);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setShowLoginModal(false);

      // Get the database user ID from user_metadata
      const dbUserId = currentUser.user_metadata?.id;

      if (!dbUserId) {
        console.error("Database user ID not found in user metadata");
        Alert.alert("Error", "User profile data not found");
        setLoading(false);
        return;
      }

      console.log("Loading profile data for database user ID:", dbUserId);

      // Load user stats from database
      const statsResult = await getUserStats(dbUserId);
      let dbStats = null;
      if (statsResult.success) {
        dbStats = statsResult.stats;
      }

      // Load recent workouts
      const workoutsResult = await getUserWorkoutHistory(dbUserId, 10);
      if (workoutsResult.success) {
        setRecentWorkouts(workoutsResult.workouts);
      }

      // Load workout history for calendar
      const historyResult = await getUserWorkoutHistory(dbUserId);
      if (historyResult.success) {
        setWorkoutHistory(historyResult.workouts);

        // Calculate enhanced stats from workout history
        const calculatedStats = calculateStatsFromHistory(
          historyResult.workouts,
          dbStats
        );
        setUserStats(calculatedStats);
      } else {
        // Fallback to database stats if workout history fails
        setUserStats(dbStats);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatsFromHistory = (workouts, dbStats) => {
    if (!workouts || workouts.length === 0) {
      return (
        dbStats || {
          totalWorkouts: 0,
          currentStreak: 0,
          totalVolume: 0,
          totalTime: 0
        }
      );
    }

    // Calculate total workouts (completed only)
    const completedWorkouts = workouts.filter(
      (workout) => workout.completed_at
    );
    const totalWorkouts = completedWorkouts.length;

    // Calculate total time
    const totalTime = completedWorkouts.reduce((sum, workout) => {
      return sum + (workout.duration_minutes || 0);
    }, 0);

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    const sortedWorkouts = completedWorkouts.sort(
      (a, b) => new Date(b.completed_at) - new Date(a.completed_at)
    );

    if (sortedWorkouts.length > 0) {
      const workoutDates = sortedWorkouts.map((workout) => {
        const date = new Date(workout.completed_at);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      });

      // Remove duplicate dates (multiple workouts on same day)
      const uniqueDates = [
        ...new Set(workoutDates.map((date) => date.getTime()))
      ]
        .map((time) => new Date(time))
        .sort((a, b) => b - a);

      // Check if most recent workout was today or yesterday
      const mostRecentDate = uniqueDates[0];
      const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const yesterdayDate = new Date(todayDate);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);

      if (
        mostRecentDate.getTime() === todayDate.getTime() ||
        mostRecentDate.getTime() === yesterdayDate.getTime()
      ) {
        // Count consecutive days
        let checkDate = mostRecentDate;
        for (let i = 0; i < uniqueDates.length; i++) {
          if (uniqueDates[i].getTime() === checkDate.getTime()) {
            currentStreak++;
            checkDate = new Date(checkDate);
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // Use database volume if available, otherwise calculate from workouts
    const totalVolume =
      dbStats?.total_volume ||
      completedWorkouts.reduce(
        (sum, workout) => sum + (workout.total_volume || 0),
        0
      );

    // Calculate average workout time
    const averageWorkoutTime = Math.round(totalTime / totalWorkouts);

    // Calculate workouts this month
    const thisMonth = new Date();
    const workoutsThisMonth = completedWorkouts.filter((workout) => {
      const workoutDate = new Date(workout.completed_at);
      return (
        workoutDate.getFullYear() === thisMonth.getFullYear() &&
        workoutDate.getMonth() === thisMonth.getMonth()
      );
    }).length;

    // Calculate personal record
    const personalRecord = completedWorkouts.reduce((record, workout) => {
      if (!record || workout.total_volume > record.total_volume) {
        return {
          exercise: workout.name,
          weight: workout.total_volume
        };
      }
      return record;
    }, null);

    return {
      totalWorkouts,
      currentStreak,
      totalVolume: Math.round(totalVolume),
      totalTime,
      averageWorkoutTime,
      workoutsThisMonth,
      personalRecord
    };
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutUser();
            setUser(null);
            setUserStats(null);
            setRecentWorkouts([]);
            setWorkoutHistory([]);
            navigation.navigate("Login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout");
          }
        }
      }
    ]);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    loadUserData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const hasWorkoutOnDate = (date) => {
    if (!date) return false;
    return workoutHistory.some((workout) => {
      const workoutDate = new Date(workout.completed_at || workout.created_at);
      return workoutDate.toDateString() === date.toDateString();
    });
  };

  const getWorkoutsForDate = (date) => {
    if (!date) return [];
    return workoutHistory.filter((workout) => {
      const workoutDate = new Date(workout.completed_at || workout.created_at);
      return workoutDate.toDateString() === date.toDateString();
    });
  };

  const handleWorkoutClick = async (workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutDetailsModal(true);
    setLoadingDetails(true);

    try {
      const result = await getWorkoutDetails(workout.id);
      if (result.success) {
        setWorkoutDetails(result.workout);
      } else {
        Alert.alert("Error", "Failed to load workout details");
      }
    } catch (error) {
      console.error("Error loading workout details:", error);
      Alert.alert("Error", "Failed to load workout details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeWorkoutDetailsModal = () => {
    setShowWorkoutDetailsModal(false);
    setSelectedWorkout(null);
    setWorkoutDetails(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <LoginRequiredModal
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
          navigation={navigation}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color="#4CAF50" />
        </View>
        <Text style={styles.userName}>
          {user?.username ||
            user?.user_metadata?.username ||
            user?.display_name ||
            "User"}
        </Text>
        <Text style={styles.memberSince}>
          Member since{" "}
          {user?.created_at || user?.user_metadata?.created_at
            ? new Date(
                user.created_at || user.user_metadata.created_at
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })
            : "N/A"}
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userStats?.totalWorkouts || 0}
            </Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userStats?.currentStreak || 0}
            </Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userStats?.workoutsThisMonth || 0}
            </Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userStats?.averageWorkoutTime || 0}m
            </Text>
            <Text style={styles.statLabel}>Avg Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Math.round((userStats?.totalTime || 0) / 60)}h
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          {userStats?.personalRecord && (
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userStats.personalRecord.weight}kg
              </Text>
              <Text style={styles.statLabel}>Personal Best</Text>
              <Text style={styles.statSubLabel}>
                {userStats.personalRecord.exercise}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Workout History */}
      <View style={styles.workoutsSection}>
        <Text style={styles.sectionTitle}>Workout History</Text>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarMonth}>
              {currentMonth.toLocaleString("en-US", {
                month: "long",
                year: "numeric"
              })}
            </Text>
          </View>
          <View style={styles.calendarGrid}>
            {getDaysInMonth(currentMonth).map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  day && hasWorkoutOnDate(day) && styles.calendarDayWithWorkout
                ]}
                onPress={() => setSelectedDate(day)}
              >
                {day && (
                  <Text style={styles.calendarDayText}>{day.getDate()}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {selectedDate && (
          <View style={styles.workoutDetailsContainer}>
            <Text style={styles.workoutDetailsTitle}>
              Workouts on {formatDate(selectedDate)}
            </Text>
            {getWorkoutsForDate(selectedDate).map((workout, index) => (
              <TouchableOpacity
                key={index}
                style={styles.workoutDetailCard}
                onPress={() => handleWorkoutClick(workout)}
              >
                <Text style={styles.workoutDetailName}>{workout.name}</Text>
                <Text style={styles.workoutDetailDate}>
                  {formatDate(workout.completed_at || workout.created_at)}
                </Text>
                <Text style={styles.workoutDetailDuration}>
                  {formatDuration(workout.duration_minutes)}
                </Text>
                <Text style={styles.workoutDetailTapHint}>Tap for details</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate("About")}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#4CAF50"
          />
          <Text style={styles.settingText}>About TFC</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate("RecoveryGuide")}
        >
          <Ionicons name="heart-outline" size={24} color="#4CAF50" />
          <Text style={styles.settingText}>Recovery Guide</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#f44336" />
          <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Workout Details Modal */}
      <Modal
        visible={showWorkoutDetailsModal}
        animationType="slide"
        onRequestClose={closeWorkoutDetailsModal}
      >
        <View style={styles.workoutDetailsModalContainer}>
          <View style={styles.workoutDetailsModalHeader}>
            <Text style={styles.workoutDetailsModalTitle}>
              {selectedWorkout?.name}
            </Text>
            <TouchableOpacity
              style={styles.workoutDetailsModalCloseButton}
              onPress={closeWorkoutDetailsModal}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {loadingDetails ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading workout details...</Text>
            </View>
          ) : (
            <ScrollView style={styles.workoutDetailsModalScrollView}>
              {workoutDetails && (
                <View>
                  <View style={styles.workoutSummaryCard}>
                    <Text style={styles.workoutSummaryTitle}>
                      Workout Summary
                    </Text>
                    <Text style={styles.workoutSummaryText}>
                      Date:{" "}
                      {formatDate(
                        workoutDetails.completed_at || workoutDetails.created_at
                      )}
                    </Text>
                    <Text style={styles.workoutSummaryText}>
                      Duration:{" "}
                      {formatDuration(workoutDetails.duration_minutes)}
                    </Text>
                    <Text style={styles.workoutSummaryText}>
                      Total Sets: {workoutDetails.totalSets}
                    </Text>
                    <Text style={styles.workoutSummaryText}>
                      Total Volume: {Math.round(workoutDetails.totalVolume)} kg
                    </Text>
                    {workoutDetails.notes && (
                      <Text style={styles.workoutSummaryText}>
                        Notes: {workoutDetails.notes}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.exercisesTitle}>Exercises</Text>
                  {workoutDetails.exercises?.map((exercise, exerciseIndex) => (
                    <View key={exerciseIndex} style={styles.exerciseCard}>
                      <Text style={styles.exerciseName}>
                        {exercise.exercise_name}
                      </Text>
                      {exercise.muscle_group &&
                        exercise.muscle_group !== "Unknown" && (
                          <Text style={styles.exerciseMuscleGroup}>
                            {exercise.muscle_group}
                          </Text>
                        )}
                      {exercise.exercise_sets &&
                      exercise.exercise_sets.length > 0 ? (
                        <View style={styles.setsContainer}>
                          <Text style={styles.setsTitle}>Sets:</Text>
                          {exercise.exercise_sets.map((set, setIndex) => (
                            <View key={setIndex} style={styles.setRow}>
                              <Text style={styles.setText}>
                                Set {set.set_number}: {set.weight_kg}kg ×{" "}
                                {set.reps} reps
                              </Text>
                              {set.rest_seconds && (
                                <Text style={styles.setRestText}>
                                  Rest: {Math.floor(set.rest_seconds / 60)}:
                                  {(set.rest_seconds % 60)
                                    .toString()
                                    .padStart(2, "0")}
                                </Text>
                              )}
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.noSetsText}>No sets recorded</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
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
  profileHeader: {
    alignItems: "center",
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#333"
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#23263a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5
  },
  memberSince: {
    fontSize: 14,
    color: "#666"
  },
  statsSection: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  statCard: {
    backgroundColor: "#23263a",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "48%",
    marginBottom: 10
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
  statSubLabel: {
    fontSize: 10,
    color: "#666",
    textAlign: "center"
  },
  workoutsSection: {
    padding: 20,
    paddingTop: 0
  },
  calendarContainer: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  calendarMonth: {
    fontSize: 18,
    color: "#fff"
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around"
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    margin: 5
  },
  calendarDayWithWorkout: {
    backgroundColor: "#4CAF50"
  },
  calendarDayText: {
    fontSize: 16,
    color: "#fff"
  },
  workoutDetailsContainer: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10
  },
  workoutDetailsTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10
  },
  workoutDetailCard: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10
  },
  workoutDetailName: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5
  },
  workoutDetailDate: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5
  },
  workoutDetailDuration: {
    fontSize: 14,
    color: "#888"
  },
  workoutDetailTapHint: {
    fontSize: 12,
    color: "#666"
  },
  settingsSection: {
    padding: 20,
    paddingTop: 0
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#23263a",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10
  },
  settingText: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
    marginLeft: 15
  },
  logoutItem: {
    marginTop: 10
  },
  logoutText: {
    color: "#f44336"
  },
  workoutDetailsModalContainer: {
    flex: 1,
    backgroundColor: "#1a1c2e",
    padding: 20
  },
  workoutDetailsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  workoutDetailsModalTitle: {
    fontSize: 24,
    color: "#fff"
  },
  workoutDetailsModalCloseButton: {
    padding: 10
  },
  workoutDetailsModalScrollView: {
    flex: 1
  },
  workoutSummaryCard: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10
  },
  workoutSummaryTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 5
  },
  workoutSummaryText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5
  },
  exercisesTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10
  },
  exerciseCard: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10
  },
  exerciseName: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5
  },
  exerciseMuscleGroup: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5
  },
  setsContainer: {
    padding: 10
  },
  setsTitle: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 5
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5
  },
  setText: {
    fontSize: 14,
    color: "#fff"
  },
  setRestText: {
    fontSize: 12,
    color: "#666"
  },
  noSetsText: {
    fontSize: 14,
    color: "#888"
  }
});

export default ProfileScreen;
