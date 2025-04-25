import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const WorkoutHistory = ({ userId }) => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Replace with your backend URL
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

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!workouts.length) return <Text style={styles.empty}>No workout history found.</Text>;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Workout History</Text>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.workoutName}>{item.workout_name}</Text>
            <Text style={styles.date}>{new Date(item.start_time).toLocaleString()}</Text>
            <Text style={styles.duration}>Duration: {item.duration ? `${item.duration} sec` : "-"}</Text>
            <Text style={styles.exercisesTitle}>Exercises:</Text>
            {Array.isArray(item.exercises) && item.exercises.map((ex, idx) => (
              <Text key={idx} style={styles.exerciseItem}>- {ex.name}</Text>
            ))}
            {item.notes ? <Text style={styles.notes}>Notes: {item.notes}</Text> : null}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  card: { backgroundColor: "#f9f9f9", borderRadius: 8, padding: 12, marginBottom: 12 },
  workoutName: { fontSize: 16, fontWeight: "bold" },
  date: { color: "#666", fontSize: 13, marginBottom: 2 },
  duration: { fontSize: 13, marginBottom: 2 },
  exercisesTitle: { fontWeight: "bold", marginTop: 6 },
  exerciseItem: { fontSize: 13, marginLeft: 8 },
  notes: { marginTop: 4, fontStyle: "italic", color: "#444" },
  error: { color: "red", marginTop: 20, textAlign: "center" },
  empty: { color: "#777", marginTop: 20, textAlign: "center" },
});

export default WorkoutHistory;
