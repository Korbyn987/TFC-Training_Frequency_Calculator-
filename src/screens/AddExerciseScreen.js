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
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getExercises,
  getMuscleGroups,
  initDatabase,
} from "../database/database";

const AddExerciseScreen = ({ navigation, route }) => {
  const { muscleGroup, muscleGroupId } = route?.params || {};
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { muscleGroup, muscleGroupId } = route.params || {};
    if (muscleGroup && muscleGroupId) {
      setActiveGroup(muscleGroup);
    }
    loadData();
  }, [route]);

  const loadData = async () => {
    try {
      await initDatabase();
      const groups = await getMuscleGroups();
      setMuscleGroups(groups);

      // If muscleGroupId is provided, filter exercises for that muscle group
      const exercisesData = await getExercises();
      if (route.params?.muscleGroupId) {
        const filteredExercises = exercisesData.filter(
          (exercise) => exercise.muscle_group_id === route.params.muscleGroupId
        );
        setExercises(filteredExercises);
      } else {
        setExercises(exercisesData);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
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

  // Defensive: exercises fallback
  const safeExercises = Array.isArray(exercises) ? exercises : [];

  const filteredExercises = () => {
    const query = searchQuery.toLowerCase();
    return safeExercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(query)
    );
  };

  const renderMuscleGroupButton = (group) => (
    <TouchableOpacity
      key={group ? group.id : "all"}
      style={[
        styles.groupButton,
        activeGroup === (group ? group.id : "All") &&
          styles.activeGroupButton,
      ]}
      onPress={() => {
        console.log('Selected muscle group:', group ? group.name : "All");
        setActiveGroup(group ? group.id : "All");
      }}
    >
      <Text
        style={[
          styles.groupButtonText,
          activeGroup === (group ? group.id : "All") &&
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

  // Defensive: muscleGroups fallback
  const safeMuscleGroups = Array.isArray(muscleGroups) ? muscleGroups : [];

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

      <View style={styles.groupButtonContainer}>
        {renderMuscleGroupButton(null)}
        {safeMuscleGroups.map((group) => renderMuscleGroupButton(group))}
      </View>

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
  groupButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 8,
    gap: 6, // for React Native Web, otherwise use margin
  },
  groupButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#272b3a',
    margin: 4,
    minWidth: 70,
    alignItems: 'center',
    minHeight: 32,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  activeGroupButton: {
    backgroundColor: '#6b46c1',
    borderColor: '#a78bfa',
  },
  groupButtonText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  activeGroupButtonText: {
    color: '#fff',
    fontWeight: '700',
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
