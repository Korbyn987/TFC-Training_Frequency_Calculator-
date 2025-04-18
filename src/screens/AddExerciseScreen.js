import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getExercises,
  getMuscleGroups,
  initDatabase,
} from "../database/database";

const AddExerciseScreen = ({ navigation }) => {
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadExercises();
    }
  }, [activeGroup, loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize database
      const dbInitialized = await initDatabase();
      if (!dbInitialized) {
        throw new Error("Failed to initialize database");
      }

      // Load muscle groups
      const groups = await getMuscleGroups();
      setMuscleGroups(groups);

      // Load initial exercises
      await loadExercises();
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load exercises. Please try again.");
      Alert.alert("Error", "Failed to load exercises. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      setError(null);
      const exerciseData = await getExercises(
        activeGroup === "All" ? null : activeGroup
      );
      setExercises(exerciseData);
    } catch (err) {
      console.error("Error loading exercises:", err);
      setError("Failed to load exercises for this group.");
      Alert.alert("Error", "Failed to load exercises for this group.");
    }
  };

  const handleSelectExercise = (exercise) => {
    setSelectedExercises((prev) => {
      if (prev.find((e) => e.id === exercise.id)) {
        return prev.filter((e) => e.id !== exercise.id);
      }
      return [...prev, exercise];
    });
  };

  const handleSaveExercises = () => {
    navigation.navigate("ConfigureWorkout", {
      exercises: selectedExercises,
    });
  };

  const filteredExercises = () => {
    const query = searchQuery.toLowerCase();
    return exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(query)
    );
  };

  const renderMuscleGroupButton = (group) => (
    <TouchableOpacity
      key={group ? group.id : "all"}
      style={[
        styles.groupButton,
        activeGroup === (group ? group.name : "All") &&
          styles.activeGroupButton,
      ]}
      onPress={() => setActiveGroup(group ? group.name : "All")}
    >
      <Text
        style={[
          styles.groupButtonText,
          activeGroup === (group ? group.name : "All") &&
            styles.activeGroupButtonText,
        ]}
      >
        {group ? group.name : "All"}
      </Text>
    </TouchableOpacity>
  );

  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.exerciseItem,
        selectedExercises.find((e) => e.id === item.id) &&
          styles.selectedExerciseItem,
      ]}
      onPress={() => handleSelectExercise(item)}
    >
      <View style={styles.exerciseContent}>
        <Text
          style={[
            styles.exerciseText,
            selectedExercises.find((e) => e.id === item.id) &&
              styles.selectedExerciseText,
          ]}
        >
          {item.name}
        </Text>
        {item.description && (
          <Text style={styles.exerciseDescription}>{item.description}</Text>
        )}
      </View>
      {selectedExercises.find((e) => e.id === item.id) && (
        <Ionicons name="checkmark-circle" size={24} color="#6b46c1" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b46c1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.groupsContainer}
      >
        {renderMuscleGroupButton(null)}
        {muscleGroups.map((group) => renderMuscleGroupButton(group))}
      </ScrollView>

      <FlatList
        data={filteredExercises()}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={[
          styles.saveButton,
          selectedExercises.length === 0 && styles.disabledButton,
        ]}
        onPress={handleSaveExercises}
        disabled={selectedExercises.length === 0}
      >
        <Text style={styles.saveButtonText}>
          Add {selectedExercises.length} Exercise
          {selectedExercises.length !== 1 ? "s" : ""}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171923",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#171923",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#171923",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#fc8181",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#6b46c1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D3748",
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#fff",
    fontSize: 16,
  },
  groupsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  groupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2D3748",
    marginRight: 8,
  },
  activeGroupButton: {
    backgroundColor: "#6b46c1",
  },
  groupButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  activeGroupButtonText: {
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2D3748",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseContent: {
    flex: 1,
    marginRight: 16,
  },
  selectedExerciseItem: {
    backgroundColor: "#2D3748",
    borderColor: "#6b46c1",
    borderWidth: 2,
  },
  exerciseText: {
    color: "#fff",
    fontSize: 16,
  },
  exerciseDescription: {
    color: "#A0AEC0",
    fontSize: 14,
    marginTop: 4,
  },
  selectedExerciseText: {
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#6b46c1",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#4A5568",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddExerciseScreen;
