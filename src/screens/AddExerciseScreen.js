console.log("AddExerciseScreen.js loaded (start)");

import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DeviceEventEmitter,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const AddExerciseScreen = ({ navigation, route }) => {
  console.log("AddExerciseScreen: component render start");
  const {
    muscleGroup,
    muscleGroupId,
    previousExercises,
    currentlySelected,
    returnToPreset,
    onReturnToPreset
  } = route?.params || {};
  const safePreviousExercises = Array.isArray(previousExercises)
    ? previousExercises
    : [];
  const safeCurrentlySelected = Array.isArray(currentlySelected)
    ? currentlySelected
    : [];

  // Use currentlySelected if available (from WorkoutOptions), otherwise use previousExercises
  const initialExercises =
    safeCurrentlySelected.length > 0
      ? safeCurrentlySelected
      : safePreviousExercises;

  const [selectedExercises, setSelectedExercises] = useState(initialExercises);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);

  // All web-specific styles are consolidated in a single useEffect hook
  useEffect(() => {
    if (Platform.OS === "web") {
      // Create a single style element for all web-specific styles
      const style = document.createElement("style");
      style.textContent = `
        /* Input focus styles */
        input:focus, textarea:focus {
          outline: none !important;
          box-shadow: none !important;
          -webkit-appearance: none !important;
          border-color: rgba(124, 58, 237, 0.3) !important;
        }
        
        /* Custom scrollbar styles for the entire app */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        
        ::-webkit-scrollbar-thumb {
          background-color: #7c3aed;
          border-radius: 20px;
          border: 3px solid #0a0a0a;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background-color: #9061f9;
        }
        
        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #7c3aed #0a0a0a;
        }
        
        /* Ensure the exercise list container has proper overflow */
        .exercise-list-container {
          height: calc(100vh - 240px);
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
      `;
      document.head.appendChild(style);

      // Clean up function to remove the style when component unmounts
      return () => {
        if (style && style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    }
  }, []);

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
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const { getMuscleGroups, getExercises } = await import(
          "../services/exerciseService"
        );

        const muscleGroupsResponse = await getMuscleGroups();
        if (muscleGroupsResponse.success) {
          setMuscleGroups(muscleGroupsResponse.data);
        } else {
          console.error(
            "Error loading muscle groups:",
            muscleGroupsResponse.error
          );
          setError("Failed to load muscle groups");
        }

        const exercisesResponse = await getExercises();
        if (exercisesResponse.success) {
          setExercises(exercisesResponse.data);
          setFilteredExercises(exercisesResponse.data);
        } else {
          console.error("Error loading exercises:", exercisesResponse.error);
          setError("Failed to load exercises");
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    console.log("AddExerciseScreen: useEffect (muscleGroup)");
    if (muscleGroup) {
      setActiveGroup(muscleGroup);
    }
  }, [muscleGroup]);

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

    if (route.params?.returnToPreset) {
      // Use DeviceEventEmitter which works on both native and web
      DeviceEventEmitter.emit("onReturnToPreset", {
        exercises: [...selectedExercises],
        presetName: route.params.presetName
      });
      navigation.goBack();
    } else {
      // If we came from WorkoutOptions with currentlySelected exercises,
      // only send back the newly added exercises (not the ones that were already there)
      let exercisesToSend = selectedExercises;

      if (safeCurrentlySelected.length > 0) {
        // Find only the newly added exercises
        const currentlySelectedIds = safeCurrentlySelected.map((ex) => ex.id);
        const newlyAddedExercises = selectedExercises.filter(
          (exercise) => !currentlySelectedIds.includes(exercise.id)
        );
        exercisesToSend = newlyAddedExercises;
        console.log(
          "[AddExerciseScreen] Sending only newly added exercises:",
          exercisesToSend
        );
      }

      console.log(
        "[AddExerciseScreen] Navigating to WorkoutOptions with selectedExercises:",
        exercisesToSend
      );

      // Navigate to WorkoutOptions with selected exercises
      navigation.navigate("WorkoutOptions", {
        selectedExercises: [...exercisesToSend],
        fromAddExercise: true
      });
    }
  };

  // Defensive: exercises fallback
  const safeExercises = Array.isArray(exercises) ? exercises : [];

  const getFilteredExercises = () => {
    const query = searchQuery.toLowerCase();
    return safeExercises.filter((exercise) => {
      const matchesQuery = exercise.name.toLowerCase().includes(query);
      const matchesGroup =
        activeGroup === "All" ||
        (exercise.muscle_groups && exercise.muscle_groups.id === activeGroup) ||
        exercise.muscle_group_id === activeGroup; // fallback for different data structures
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
        setActiveGroup(group ? group.id : "All");
      }}
    >
      <Text
        style={[
          styles.groupButtonText,
          activeGroup === (group ? group.id : "All") &&
            styles.activeGroupButtonText
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {group ? group.name : "All"}
      </Text>
    </TouchableOpacity>
  );

  const renderExerciseItem = ({ item }) => {
    const isSelected = selectedExercises.some((e) => e.id === item.id);
    return (
      <TouchableOpacity
        style={[
          styles.exerciseItem,
          isSelected ? styles.selectedExerciseItem : null
        ]}
        onPress={() => handleSelectExercise(item)}
      >
        <View style={styles.exerciseContent}>
          <Text
            style={[
              styles.exerciseText,
              isSelected ? styles.selectedExerciseText : null
            ]}
          >
            {item.name}
          </Text>
          <Text style={styles.exerciseDescription}>{item.description}</Text>
        </View>
        <View
          style={[
            styles.checkboxContainer,
            isSelected && styles.checkboxSelected
          ]}
        >
          {isSelected && <MaterialIcons name="check" size={18} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  // Web-specific scrollbar styles are now consolidated in the first useEffect hook

  return (
    <View style={styles.mainContainer}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Select Exercises</Text>
        <View style={styles.headerSearchContainer}>
          <MaterialIcons
            name="search"
            size={18}
            color="#7c3aed"
            style={styles.searchIcon}
          />
          <TextInput
            ref={searchInputRef}
            style={[
              styles.headerSearchInput,
              Platform.OS === "web" && styles.webInputReset
            ]}
            placeholder="Search exercises..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor="#7c3aed"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <MaterialIcons name="cancel" size={18} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterBoxContainer}>
        <View style={styles.filterHeaderContainer}>
          <Text style={styles.filterBoxTitle}>Muscle Groups</Text>
        </View>
        <View style={styles.filterGridContainer}>
          <View style={styles.filterRow}>
            {renderMuscleGroupButton(null)}
            {muscleGroups
              .slice(0, 3)
              .map((group) => renderMuscleGroupButton(group))}
          </View>
          <View style={styles.filterRow}>
            {muscleGroups
              .slice(3, 7)
              .map((group) => renderMuscleGroupButton(group))}
          </View>
        </View>
      </View>

      {/* Scrollable Content Area */}
      {Platform.OS === "web" ? (
        <div className="exercise-list-container" style={{ padding: 16 }}>
          {getFilteredExercises().map((item) => (
            <div key={item.id?.toString() || `exercise-${item.name}`}>
              {renderExerciseItem({ item })}
            </div>
          ))}
          {getFilteredExercises().length === 0 && (
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>No exercises found</Text>
            </View>
          )}
        </div>
      ) : (
        <View style={styles.scrollableArea}>
          <FlatList
            data={getFilteredExercises()}
            keyExtractor={(item) =>
              item.id?.toString() || `exercise-${item.name}`
            }
            renderItem={renderExerciseItem}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>No exercises found</Text>
              </View>
            }
          />
        </View>
      )}

      {/* Fixed Bottom Button */}
      <View style={styles.fixedButtonContainer}>
        {selectedExercises.length > 0 ? (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveExercises}
            activeOpacity={0.8}
          >
            <View style={styles.saveButtonContent}>
              <Text style={styles.saveButtonText}>
                Add {selectedExercises.length} Exercise
                {selectedExercises.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptySelectionContainer}>
            <View style={styles.infoIcon}>
              <MaterialIcons name="fitness-center" size={20} color="#7c3aed" />
            </View>
            <Text style={styles.emptySelectionText}>
              Select exercises to add to your workout
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Add web-specific styles for scrollable containers
if (Platform.OS === 'web') {
  // Add global CSS for better scrolling on web
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      body {
        overscroll-behavior-y: none;
      }
      ::-webkit-scrollbar {
        width: 8px;
        background-color: #171923;
      }
      ::-webkit-scrollbar-thumb {
        background-color: #4a5568;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background-color: #6b46c1;
      }
    `;
    document.head.appendChild(style);
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: Platform.OS === 'web' ? 'hidden' : 'visible',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  scrollableArea: {
    flex: 1,
    width: '100%',
  },
  webScrollViewWrapper: {
    flex: 1,
    width: '100%',
    height: Platform.OS === 'web' ? 'calc(100vh - 240px)' : '100%',
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'web' ? 160 : 180, // Extra space for the bottom button
  },
  emptyListContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyListText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  webScrollContainer: {
    flex: 1,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    minHeight: 0, // Important for flex scrolling
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  scrollContentContainer: {
    paddingTop: 16,
    paddingBottom: 100, // Extra space for the bottom button
  },
  headerContainer: {
    backgroundColor: "#161616",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    zIndex: 2,
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
  headerSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 30, 30, 0.6)",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.3)",
    marginTop: 4,
  },
  headerSearchInput: {
    flex: 1,
    height: 40,
    color: "#fff",
    fontSize: 14,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  webInputReset: {
    outlineWidth: 0,
    outlineColor: 'transparent',
    boxShadow: 'none',
    borderColor: 'transparent',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
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
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 30, 30, 0.6)",
    borderRadius: 12,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(80, 80, 80, 0.3)",
    width: '100%',
  },
  exerciseContent: {
    flex: 1,
    marginRight: 16,
  },
  selectedExerciseItem: {
    backgroundColor: "rgba(124, 58, 237, 0.08)",
    borderColor: "rgba(124, 58, 237, 0.5)",
    borderWidth: 1,
  },
  exerciseText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseDescription: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  selectedExerciseText: {
    color: "#fff",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.3)",
    width: 'auto',
  },
  searchIcon: {
    marginRight: 8,
  },
  clearButton: {
    padding: 4,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#fff",
    fontSize: 16,
  },
  filterBoxContainer: {
    marginHorizontal: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 10,
    backgroundColor: 'rgba(30, 30, 30, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    zIndex: 1,
  },
  filterHeaderContainer: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.2)',
    backgroundColor: 'rgba(20, 20, 20, 0.4)',
  },
  filterBoxTitle: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  filterGridContainer: {
    backgroundColor: 'rgba(20, 20, 20, 0.2)',
    padding: 6,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingVertical: 2,
    marginBottom: 4,
  },
  groupButtonScrollView: {
    maxHeight: 60,
    backgroundColor: 'transparent',
  },
  groupButtonScroll: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  groupButton: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
    height: 32,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70, // Reduced minimum width for phone displays
  },
  activeGroupButton: {
    backgroundColor: "transparent",
  },
  groupButtonText: {
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.1,
    textAlign: "center",
    backgroundColor: 'rgba(107, 70, 193, 0.4)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.3)',
  },
  activeGroupButtonText: {
    color: "#fff",
    fontWeight: "600",
    backgroundColor: "#6b46c1",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 1,
    borderColor: '#a78bfa',
  },
  list: {
    flex: 1,
    height: '100%',
    minHeight: 300,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(30, 30, 30, 0.6)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.2)",
    elevation: 0,
    width: '100%',
  },
  exerciseContent: {
    flex: 1,
    marginRight: 16,
  },
  selectedExerciseItem: {
    backgroundColor: "rgba(124, 58, 237, 0.08)",
    borderColor: "rgba(124, 58, 237, 0.5)",
    borderWidth: 1,
  },
  exerciseText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseDescription: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  selectedExerciseText: {
    color: "#fff",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#7c3aed",
    margin: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: '92%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.5)',
  },
  disabledButton: {
    backgroundColor: "#333",
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
    backgroundColor: "#7c3aed",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#7c3aed",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  checkboxContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },
  fixedButtonContainer: {
    position: Platform.OS === "web" ? "fixed" : "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10,10,10,0.95)",
    backdropFilter: 'blur(12px)',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    paddingTop: 12,
    zIndex: 100,
    width: "100%",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(124, 58, 237, 0.2)",
    elevation: 10,
  },
  emptySelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 20,
    margin: 8,
    alignSelf: 'center',
  },
  infoIcon: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emptySelectionText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    flexShrink: 1,
  },
});
export default AddExerciseScreen;
