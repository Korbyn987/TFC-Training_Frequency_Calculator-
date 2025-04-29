console.log("AddExerciseScreen.js loaded (start)");

import React from "react";
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
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getExercises,
  getMuscleGroups,
  initDatabase
} from "../database/database";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useEffect, useCallback } from "react";

const AddExerciseScreen = ({ navigation, route }) => {
  console.log("AddExerciseScreen: component render start");
  const { muscleGroup, muscleGroupId, previousExercises, returnToPreset, onReturnToPreset } = route?.params || {};
  const safePreviousExercises = Array.isArray(previousExercises) ? previousExercises : [];
  const [selectedExercises, setSelectedExercises] = useState(safePreviousExercises);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.newExerciseToAdd) {
        console.log("AddExerciseScreen: Detected newExerciseToAdd param");
        const exerciseToAdd = route.params.newExerciseToAdd;
        navigation.setParams({ newExerciseToAdd: undefined });
        navigation.navigate("ConfigureWorkout", { addExercise: exerciseToAdd });
      }
    }, [route.params?.newExerciseToAdd])
  );

  useEffect(() => {
    console.log("AddExerciseScreen: useEffect (mount)");
    const { muscleGroup, muscleGroupId } = route.params || {};
    if (muscleGroup && muscleGroupId) {
      setActiveGroup(muscleGroup);
    }
    loadData();
  }, [route]);

  useEffect(() => {
    console.log("AddExerciseScreen: useEffect (muscleGroup)");
    if (muscleGroup) {
      setActiveGroup(muscleGroup);
    }
  }, [muscleGroup]);

  const loadData = async () => {
    try {
      console.log("AddExerciseScreen: loadData start");
      setLoading(true);
      setError(null);
      // Initialize database
      const dbInitialized = await initDatabase();
      console.log("AddExerciseScreen: initDatabase result", dbInitialized);
      if (!dbInitialized) {
        throw new Error("Failed to initialize database");
      }
      // Load muscle groups
      let groups;
      if (Platform.OS === "web") {
        const { STATIC_MUSCLE_GROUPS } = require("../database/database");
        groups = STATIC_MUSCLE_GROUPS;
      } else {
        groups = await getMuscleGroups();
      }
      console.log("AddExerciseScreen: muscleGroups", groups);
      setMuscleGroups(groups);
      // Load exercises
      let exercisesData;
      if (Platform.OS === "web") {
        const { STATIC_EXERCISES } = require("../database/database");
        exercisesData = STATIC_EXERCISES;
      } else {
        exercisesData = await getExercises();
      }
      console.log("AddExerciseScreen: exercisesData", exercisesData);
      if (route.params?.muscleGroupId) {
        const filteredExercises = exercisesData.filter(
          (exercise) => exercise.muscle_group_id === route.params.muscleGroupId
        );
        setExercises(filteredExercises);
        console.log("AddExerciseScreen: filteredExercises", filteredExercises);
      } else {
        setExercises(exercisesData);
      }
      setLoading(false);
      console.log("AddExerciseScreen: loadData complete");
    } catch (err) {
      setError("Error loading data: " + err);
      setLoading(false);
      console.error("AddExerciseScreen: loadData error", err);
    }
  };

  // Fallback UI for debugging
  if (error) {
    console.log("AddExerciseScreen: rendering error UI", error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#171923' }}>
        <Text style={{ color: '#fc8181', fontSize: 18 }}>Error: {error}</Text>
      </View>
    );
  }
  if (loading) {
    console.log("AddExerciseScreen: rendering loading UI");
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#171923' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  console.log("AddExerciseScreen: rendering main UI");

  const handleSelectExercise = (exercise) => {
    setSelectedExercises((prev) => {
      if (prev.find((e) => e.id === exercise.id)) {
        return prev.filter((e) => e.id !== exercise.id);
      }
      return [...prev, exercise];
    });
  };

  const handleSaveExercises = () => {
    console.log("[AddExerciseScreen] handleSaveExercises called");
    console.log("[AddExerciseScreen] selectedExercises:", selectedExercises);
    if (route.params && route.params.returnToPreset && route.params.onReturnToPreset) {
      route.params.onReturnToPreset([...selectedExercises]);
      navigation.goBack();
    } else {
      console.log("[AddExerciseScreen] Navigating to ConfigureWorkout with selectedExercises:", selectedExercises);
      navigation.navigate({
        name: "ConfigureWorkout",
        params: { selectedExercises: [...selectedExercises] },
        merge: true
      });
    }
  };

  // Defensive: exercises fallback
  const safeExercises = Array.isArray(exercises) ? exercises : [];

  const filteredExercises = () => {
    const query = searchQuery.toLowerCase();
    return safeExercises.filter((exercise) => {
      const matchesQuery = exercise.name.toLowerCase().includes(query);
      const matchesGroup =
        activeGroup === "All" ||
        exercise.muscle_group_id === activeGroup ||
        exercise.muscleGroupId === activeGroup; // fallback for different naming
      return matchesQuery && matchesGroup;
    });
  };

  const renderMuscleGroupButton = (group) => (
    <TouchableOpacity
      key={group ? group.id : "all"}
      style={[
        styles.groupButton,
        activeGroup === (group ? group.id : "All") && styles.activeGroupButton
      ]}
      onPress={() => {
        console.log("Selected muscle group:", group ? group.name : "All");
        setActiveGroup(group ? group.id : "All");
      }}
    >
      <Text
        style={[
          styles.groupButtonText,
          activeGroup === (group ? group.id : "All") &&
            styles.activeGroupButtonText
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
          styles.selectedExerciseItem
      ]}
      onPress={() => handleSelectExercise(item)}
    >
      <View style={styles.exerciseContent}>
        <Text
          style={[
            styles.exerciseText,
            selectedExercises.find((e) => e.id === item.id) &&
              styles.selectedExerciseText
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

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.container, { paddingBottom: 80 }]}>
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
          {muscleGroups.map((group) => renderMuscleGroupButton(group))}
        </View>

        <FlatList
          data={filteredExercises()}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      </View>
      {selectedExercises.length > 0 && (
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              selectedExercises.length === 0 && styles.disabledButton
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171923"
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#171923",
    justifyContent: "center",
    alignItems: "center"
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#171923",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  errorText: {
    color: "#fc8181",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: "#6b46c1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D3748",
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#fff",
    fontSize: 16
  },
  groupButtonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 8,
    gap: 6 // for React Native Web, otherwise use margin
  },
  groupButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "#272b3a",
    margin: 4,
    minWidth: 70,
    alignItems: "center",
    minHeight: 32,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#4a5568"
  },
  activeGroupButton: {
    backgroundColor: "#6b46c1",
    borderColor: "#a78bfa"
  },
  groupButtonText: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2
  },
  activeGroupButtonText: {
    color: "#fff",
    fontWeight: "700"
  },
  list: {
    flex: 1
  },
  listContent: {
    padding: 16
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2D3748",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8
  },
  exerciseContent: {
    flex: 1,
    marginRight: 16
  },
  selectedExerciseItem: {
    backgroundColor: "#2D3748",
    borderColor: "#6b46c1",
    borderWidth: 2
  },
  exerciseText: {
    color: "#fff",
    fontSize: 16
  },
  exerciseDescription: {
    color: "#A0AEC0",
    fontSize: 14,
    marginTop: 4
  },
  selectedExerciseText: {
    fontWeight: "bold"
  },
  saveButton: {
    backgroundColor: "#6b46c1",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center"
  },
  disabledButton: {
    backgroundColor: "#4A5568"
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
  fixedButtonContainer: {
    position: Platform.OS === "web" ? "fixed" : "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(23,25,35,0.96)",
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    paddingTop: 8,
    zIndex: 100,
    width: "100%",
    alignItems: "center"
  }
});
export default AddExerciseScreen;
