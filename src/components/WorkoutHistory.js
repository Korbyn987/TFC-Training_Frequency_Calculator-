import React, { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, ScrollView, Button, Platform, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const WorkoutHistory = ({ userId }) => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/closed_workouts?user_id=${userId}`
        );
        setWorkouts(response.data.workouts);
      } catch (err) {
        setError("Failed to load workout history");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchHistory();
  }, [userId]);

  // Generate last 7 days (including today)
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });

  // Group workouts by date string (YYYY-MM-DD)
  const workoutsByDate = workouts.reduce((acc, w) => {
    const dateStr = new Date(w.start_time).toISOString().slice(0, 10);
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(w);
    return acc;
  }, {});

  const handleDatePress = (date) => {
    setSelectedDate(date);
  };

  const handleWorkoutPress = (workout) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
    // Check for core exercises and update only the core/abs timer
    if (Array.isArray(workout.exercises)) {
      const hasCore = workout.exercises.some(
        (ex) => ex.name && (
          ex.name.toLowerCase().includes('core') ||
          ex.name.toLowerCase().includes('abs') ||
          ex.name.toLowerCase().includes('abdominal')
        )
      );
      if (hasCore) {
        // Only update the core/abs timer, not glutes
        dispatch(
          addWorkout({
            date: workout.end_time || new Date().toISOString(),
            muscles: ['core'], // This will be mapped to 'abs' in Redux
            intensity: workout.intensity || 'unknown',
            name: workout.workout_name || 'Core Workout',
            exercises: workout.exercises,
          })
        );
      }
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedWorkout(null);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!workouts.length) return <Text style={styles.empty}>No workout history found.</Text>;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Workout History</Text>
      {/* Calendar Row */}
      <View style={styles.calendarRow}>
        {days.map((date, idx) => {
          const dateStr = date.toISOString().slice(0, 10);
          const isSelected = selectedDate
            ? dateStr === selectedDate.toISOString().slice(0, 10)
            : dateStr === today.toISOString().slice(0, 10);
          const hasWorkouts = workoutsByDate[dateStr] && workoutsByDate[dateStr].length > 0;
          return (
            <TouchableOpacity
              key={dateStr}
              style={[styles.calendarDay, isSelected && styles.calendarDaySelected, hasWorkouts && styles.calendarDayActive]}
              onPress={() => handleDatePress(date)}
            >
              <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>
                {date.toLocaleDateString(undefined, { weekday: "short" })}
              </Text>
              <Text style={[styles.calendarDateText, isSelected && styles.calendarDayTextSelected]}>
                {date.getDate()}
              </Text>
              {hasWorkouts && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </View>
      {/* Workouts for selected date */}
      <FlatList
        data={workoutsByDate[(selectedDate || today).toISOString().slice(0, 10)] || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.id}
            style={styles.cardCustom}
            onPress={() => handleWorkoutPress(item)}
          >
            <View style={styles.cardContent}>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={({ nativeEvent }) => {
                  const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
                  const isScrollable = contentSize.height > layoutMeasurement.height;
                  const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height;
                  setShowScrollIndicator(prev => ({ ...prev, [item.id]: isScrollable && !isAtBottom }));
                }}
                scrollEventThrottle={16}
              >
                <Text style={styles.workoutNameCustom}>{item.workout_name || "Workout"}</Text>
                <Text style={styles.dateCustom}>
                  {new Date(item.start_time).toLocaleDateString()}
                </Text>
                <Text style={styles.durationCustom}>
                  Duration: {item.duration || "Not recorded"}
                </Text>
                {item.exercises && item.exercises.length > 0 && (
                  <>
                    <Text style={styles.exercisesTitleCustom}>Exercises:</Text>
                    {item.exercises.map((exercise, index) => (
                      <Text key={index} style={styles.exerciseItemCustom}>
                        {exercise.name}
                      </Text>
                    ))}
                  </>
                )}
                {item.notes && (
                  <Text style={styles.notesCustom}>Notes: {item.notes}</Text>
                )}
              </ScrollView>
              {showScrollIndicator[item.id] && item.exercises && item.exercises.length >= 3 && (
                <View style={styles.scrollIndicator}>
                  <Ionicons name="chevron-down" size={16} color="rgba(255, 255, 255, 0.6)" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No workouts for this day.</Text>}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCustom}>
            <ScrollView>
              {selectedWorkout && (
                <>
                  <Text style={styles.modalTitleCustom}>{selectedWorkout.workout_name}</Text>
                  <Text style={styles.dateCustom}>{new Date(selectedWorkout.start_time).toLocaleString()} - {new Date(selectedWorkout.end_time).toLocaleString()}</Text>
                  <Text style={styles.durationCustom}>Duration: {selectedWorkout.duration ? `${selectedWorkout.duration} sec` : "-"}</Text>
                  <Text style={styles.exercisesTitleCustom}>Exercises:</Text>
                  {Array.isArray(selectedWorkout.exercises)
                    ? selectedWorkout.exercises.map((ex, idx) => (
                        <Text key={idx} style={styles.exerciseItemCustom}>- {ex.name}</Text>
                      ))
                    : <Text style={styles.exerciseItemCustom}>{selectedWorkout.exercises}</Text>}
                  {selectedWorkout.notes ? <Text style={styles.notesCustom}>Notes: {selectedWorkout.notes}</Text> : null}
                </>
              )}
            </ScrollView>
            <Button title="Close" color="#6b46c1" onPress={closeModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginTop: 24, paddingHorizontal: 0 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#ffffff", alignSelf: "center", letterSpacing: 1 },
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  calendarDay: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(30, 32, 42, 0.9)",
    marginHorizontal: 2,
    minWidth: 40,
    minHeight: 58,
  },
  calendarDayActive: {
    backgroundColor: "rgba(107, 70, 193, 0.2)",
  },
  calendarDaySelected: {
    backgroundColor: "rgba(107, 70, 193, 0.2)",
    borderColor: "#6b46c1",
    borderWidth: 2,
  },
  calendarDayText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "bold",
  },
  calendarDayTextSelected: {
    color: "#ffffff",
  },
  calendarDateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.9)",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#6b46c1",
    marginTop: 3,
  },
  listContainer: { paddingHorizontal: 8, paddingBottom: 16, flexDirection: "row" },
  cardCustom: {
    backgroundColor: "rgba(30, 32, 42, 0.9)",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    marginRight: 16,
    elevation: 4,
    borderWidth: 1.2,
    borderColor: "rgba(107, 70, 193, 0.5)",
    width: 240,
    height: 170,
    flexBasis: 240,
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: "flex-start",
  },
  cardContent: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 32, 42, 0.8)',
    paddingVertical: 2,
    borderRadius: 8,
  },
  workoutNameCustom: { fontSize: 18, fontWeight: "bold", color: "#ffffff", marginBottom: 2 },
  dateCustom: { color: "rgba(255, 255, 255, 0.6)", fontSize: 13, marginBottom: 2 },
  durationCustom: { fontSize: 14, marginBottom: 2, color: "rgba(255, 255, 255, 0.8)" },
  exercisesTitleCustom: { fontWeight: "bold", marginTop: 8, color: "#6b46c1" },
  exerciseItemCustom: { marginLeft: 8, fontSize: 14, color: "rgba(255, 255, 255, 0.8)" },
  notesCustom: { fontStyle: "italic", marginTop: 8, color: "rgba(255, 255, 255, 0.7)" },
  error: { color: "#ef4444", marginTop: 20 },
  empty: { color: "rgba(255, 255, 255, 0.5)", marginTop: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentCustom: {
    backgroundColor: "#171923",
    borderRadius: 14,
    padding: 28,
    width: "90%",
    maxHeight: "80%",
    elevation: 7,
    borderWidth: 1.5,
    borderColor: "#6b46c1",
  },
  modalTitleCustom: { fontSize: 22, fontWeight: "bold", marginBottom: 12, color: "#ffffff", alignSelf: "center", letterSpacing: 1 },
});

export default WorkoutHistory;
