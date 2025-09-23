import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import CustomAlert from "../components/CustomAlert"; // Import the new component
import LoginRequiredModal from "../components/LoginRequiredModal";
import { useTabData } from "../context/TabDataContext";

const ProfileScreen = ({ navigation }) => {
  const { user, userStats, workoutHistory, loading, error, refreshTabData } =
    useTabData();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showWorkoutDetailsModal, setShowWorkoutDetailsModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [workoutDetails, setWorkoutDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [alertInfo, setAlertInfo] = useState({
    visible: false,
    title: "",
    message: ""
  });

  useEffect(() => {
    if (!loading && !user) {
      setShowLoginModal(true);
    }
    if (user) {
      setShowLoginModal(false);
    }
  }, [user, loading]);

  const handleLogout = async () => {
    setAlertInfo({
      visible: true,
      title: "Logout",
      message: "Are you sure you want to logout?",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              const { logoutUser } = await import("../services/supabaseAuth");
              await logoutUser();
              navigation.navigate("Login");
            } catch (error) {
              console.error("Logout error:", error);
              setAlertInfo({
                visible: true,
                title: "Error",
                message: "Failed to logout"
              });
            }
          }
        }
      ]
    });
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    refreshTabData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatDuration = (minutes) => {
    // Handle null, undefined, or NaN values
    if (!minutes || isNaN(minutes) || minutes <= 0) {
      return "0m";
    }

    const numMinutes = Math.round(Number(minutes));
    const hours = Math.floor(numMinutes / 60);
    const mins = numMinutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days = [];
    const totalCells = 42; // 6 weeks × 7 days = consistent grid

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add the actual days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Fill remaining cells to complete the 6-week grid
    while (days.length < totalCells) {
      days.push(null);
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
      const { getWorkoutDetails } = await import(
        "../services/supabaseWorkouts"
      );
      const result = await getWorkoutDetails(workout.id);
      if (result.success) {
        setWorkoutDetails(result.workout);
      } else {
        setAlertInfo({
          visible: true,
          title: "Error",
          message: "Failed to load workout details"
        });
      }
    } catch (error) {
      console.error("Error loading workout details:", error);
      setAlertInfo({
        visible: true,
        title: "Error",
        message: "Failed to load workout details"
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeWorkoutDetailsModal = () => {
    setShowWorkoutDetailsModal(false);
    setSelectedWorkout(null);
    setWorkoutDetails(null);
  };

  const handleDatePress = (day) => {
    if (!day) return;

    const isCreationDay =
      user?.created_at &&
      new Date(day).toDateString() === new Date(user.created_at).toDateString();

    if (isCreationDay) {
      setAlertInfo({
        visible: true,
        title: "Journey Started!",
        message: `You created your account on ${new Date(
          user.created_at
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })}.`
      });
    } else {
      setSelectedDate(day);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
    setSelectedDate(null); // Clear selected date when changing months
  };

  const navigateToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(null);
  };

  const openMonthYearPicker = () => {
    if (user?.is_premium) {
      setShowMonthYearPicker(true);
    }
  };

  const selectMonthYear = (year, month) => {
    const newDate = new Date(year, month, 1);
    setCurrentMonth(newDate);
    setSelectedDate(null);
    setShowMonthYearPicker(false);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = Math.max(2020, currentYear - 10); // Go back 10 years or to 2020
    const years = [];
    for (let year = currentYear; year >= startYear; year--) {
      years.push(year);
    }
    return years;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

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
        <TouchableOpacity
          style={styles.findFriendsButton}
          onPress={() => navigation.navigate("FindFriends")}
        >
          <Ionicons name="person-add-outline" size={20} color="#fff" />
          <Text style={styles.findFriendsButtonText}>Find Friends</Text>
        </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.monthNavButton}
              onPress={() => navigateMonth(-1)}
            >
              <Ionicons name="chevron-back" size={20} color="#4CAF50" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.calendarMonthButton}
              onPress={openMonthYearPicker}
            >
              <Text style={styles.calendarMonth}>
                {currentMonth.toLocaleString("en-US", {
                  month: "long",
                  year: "numeric"
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.monthNavButton}
              onPress={() => navigateMonth(1)}
            >
              <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {user?.is_premium && (
            <TouchableOpacity
              style={styles.todayButton}
              onPress={navigateToToday}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          )}

          <View style={styles.calendarWeekdays}>
            <Text style={styles.calendarWeekday}>Sun</Text>
            <Text style={styles.calendarWeekday}>Mon</Text>
            <Text style={styles.calendarWeekday}>Tue</Text>
            <Text style={styles.calendarWeekday}>Wed</Text>
            <Text style={styles.calendarWeekday}>Thu</Text>
            <Text style={styles.calendarWeekday}>Fri</Text>
            <Text style={styles.calendarWeekday}>Sat</Text>
          </View>

          <View style={styles.calendarGrid}>
            {getDaysInMonth(currentMonth).map((day, index) => {
              const isCreationDay =
                day &&
                user?.created_at &&
                new Date(day).toDateString() ===
                  new Date(user.created_at).toDateString();

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    day &&
                      hasWorkoutOnDate(day) &&
                      styles.calendarDayWithWorkout,
                    isCreationDay && styles.creationDayIndicator
                  ]}
                  onPress={() => handleDatePress(day)}
                >
                  {day && (
                    <Text style={styles.calendarDayText}>{day.getDate()}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
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

        {user?.is_premium && (
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("Analytics")}
          >
            <Ionicons name="stats-chart" size={24} color="#4CAF50" />
            <Text style={styles.settingText}>Advanced Analytics</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        )}

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

      {/* Month/Year Picker Modal */}
      <Modal
        visible={showMonthYearPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMonthYearPicker(false)}
      >
        <View style={styles.monthYearModalOverlay}>
          <View style={styles.monthYearModalContainer}>
            <View style={styles.monthYearModalHeader}>
              <Text style={styles.monthYearModalTitle}>
                Select Month & Year
              </Text>
              <TouchableOpacity
                style={styles.monthYearModalCloseButton}
                onPress={() => setShowMonthYearPicker(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.monthYearModalScrollView}>
              {generateYearOptions().map((year) => (
                <View key={year} style={styles.yearSection}>
                  <Text style={styles.yearSectionTitle}>{year}</Text>
                  <View style={styles.monthGrid}>
                    {monthNames.map((monthName, monthIndex) => {
                      const isCurrentMonth =
                        year === currentMonth.getFullYear() &&
                        monthIndex === currentMonth.getMonth();
                      const isFutureMonth =
                        year > new Date().getFullYear() ||
                        (year === new Date().getFullYear() &&
                          monthIndex > new Date().getMonth());

                      return (
                        <TouchableOpacity
                          key={monthIndex}
                          style={[
                            styles.monthButton,
                            isCurrentMonth && styles.monthButtonSelected,
                            isFutureMonth && styles.monthButtonDisabled
                          ]}
                          onPress={() =>
                            !isFutureMonth && selectMonthYear(year, monthIndex)
                          }
                          disabled={isFutureMonth}
                        >
                          <Text
                            style={[
                              styles.monthButtonText,
                              isCurrentMonth && styles.monthButtonTextSelected,
                              isFutureMonth && styles.monthButtonTextDisabled
                            ]}
                          >
                            {monthName.substring(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertInfo.visible}
        title={alertInfo.title}
        message={alertInfo.message}
        buttons={alertInfo.buttons}
        onClose={() =>
          setAlertInfo({ visible: false, title: "", message: "", buttons: [] })
        }
      />
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
  findFriendsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20
  },
  findFriendsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10
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
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 0
  },
  calendarContainer: {
    backgroundColor: "#1a1d2e",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4
  },
  calendarMonth: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.5
  },
  monthNavButton: {
    backgroundColor: "#2a2d42",
    borderRadius: 8,
    padding: 8,
    minWidth: 36,
    alignItems: "center"
  },
  calendarWeekdays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
    paddingHorizontal: 4,
    backgroundColor: "#23263a",
    borderRadius: 8,
    paddingVertical: 6
  },
  calendarWeekday: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8b92b0",
    width: "14.28%",
    textAlign: "center",
    letterSpacing: 0.3
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around"
  },
  calendarDay: {
    width: "13%",
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: "0.5%",
    marginVertical: 4,
    backgroundColor: "transparent"
  },
  calendarDayWithWorkout: {
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2
  },
  creationDayIndicator: {
    backgroundColor: "#2196F3",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2
  },
  calendarDayText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#fff"
  },
  todayButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "center",
    marginBottom: 8,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  todayButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3
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
  },
  monthNavButton: {
    padding: 10
  },
  calendarMonthButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  monthYearModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)"
  },
  monthYearModalContainer: {
    backgroundColor: "#1a1c2e",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    maxHeight: "75%",
    minHeight: 400
  },
  monthYearModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333"
  },
  monthYearModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff"
  },
  monthYearModalCloseButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: "#333"
  },
  monthYearModalScrollView: {
    flex: 1
  },
  yearSection: {
    marginBottom: 25
  },
  yearSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 15,
    textAlign: "center"
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  monthButton: {
    width: "30%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#23263a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10
  },
  monthButtonSelected: {
    backgroundColor: "#4CAF50"
  },
  monthButtonDisabled: {
    backgroundColor: "#333",
    opacity: 0.5
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff"
  },
  monthButtonTextSelected: {
    color: "#fff",
    fontWeight: "bold"
  },
  monthButtonTextDisabled: {
    color: "#888"
  },
  calendarWeekdays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    width: "100%"
  },
  calendarWeekday: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#888",
    width: "14.28%",
    textAlign: "center"
  }
});

export default ProfileScreen;
