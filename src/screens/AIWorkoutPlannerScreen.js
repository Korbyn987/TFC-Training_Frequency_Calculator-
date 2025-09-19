import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useTabData } from "../context/TabDataContext";
import { generateWorkoutPlan } from "../services/aiService";

const AIWorkoutPlannerScreen = ({ navigation }) => {
  const [goal, setGoal] = useState("muscle_gain");
  const [level, setLevel] = useState("intermediate");
  const [frequency, setFrequency] = useState(3);
  const [equipment, setEquipment] = useState("full_gym");

  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const { muscleRecoveryData, recentWorkouts } = useTabData();

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setGeneratedPlan(null);

    const userGoals = { goal, level, frequency, equipment };

    try {
      const result = await generateWorkoutPlan(
        userGoals,
        muscleRecoveryData,
        recentWorkouts
      );

      if (result.success) {
        setGeneratedPlan(result.plan);
      } else {
        Alert.alert(
          "Error",
          "Could not generate a workout plan. Please try again."
        );
      }
    } catch (error) {
      console.error("Error generating workout plan:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWorkout = (dayPlan) => {
    const workout = {
      name: dayPlan.focus,
      exercises: dayPlan.exercises.map((ex, index) => ({
        id: `${ex.name.replace(/\s/g, "-")}-${index}`,
        name: ex.name, // Pass the name for lookup
        // The AI provides sets as a string, so we let WorkoutOptionsScreen create defaults
        sets: [],
        // Attempt to parse a number from the rest string, or default
        rest_seconds: parseInt(ex.rest, 10) || 60
      }))
    };

    // Navigate to WorkoutOptionsScreen with the correct parameter structure
    navigation.navigate("WorkoutOptions", {
      presetData: workout,
      fromPreset: true
    });
  };

  const handleSaveDayAsPreset = async (dayPlan) => {
    try {
      const presetsData = await AsyncStorage.getItem("workout_presets");
      const presets = presetsData ? JSON.parse(presetsData) : [];

      const newTemplate = {
        id: Date.now(),
        name: `${dayPlan.focus} (AI)`,
        // The AI service provides exercise names. We'll need to match them to real exercises
        // when loading the preset. For now, we save them as is.
        exercises: dayPlan.exercises.map((ex) => ({
          name: ex.name,
          // We don't have IDs, so WorkoutOptionsScreen will need to find them by name
          sets_string: ex.sets, // Store the AI's string suggestion
          rest_string: ex.rest
        })),
        created_at: new Date().toISOString()
      };

      const updatedPresets = [...presets, newTemplate];
      await AsyncStorage.setItem(
        "workout_presets",
        JSON.stringify(updatedPresets)
      );

      Alert.alert(
        "Success!",
        `"${newTemplate.name}" has been saved to your presets.`
      );
    } catch (error) {
      console.error("Error saving template:", error);
      Alert.alert("Error", "Could not save the workout as a template.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {!generatedPlan && (
        <View style={styles.form}>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Primary Goal</Text>
            <Picker
              selectedValue={goal}
              onValueChange={(itemValue) => setGoal(itemValue)}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="Muscle Gain" value="muscle_gain" />
              <Picker.Item label="Strength" value="strength" />
              <Picker.Item label="Fat Loss" value="fat_loss" />
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Experience Level</Text>
            <Picker
              selectedValue={level}
              onValueChange={(itemValue) => setLevel(itemValue)}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="Beginner" value="beginner" />
              <Picker.Item label="Intermediate" value="intermediate" />
              <Picker.Item label="Advanced" value="advanced" />
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Workouts per Week</Text>
            <Picker
              selectedValue={frequency}
              onValueChange={(itemValue) => setFrequency(itemValue)}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="2 days" value={2} />
              <Picker.Item label="3 days" value={3} />
              <Picker.Item label="4 days" value={4} />
              <Picker.Item label="5 days" value={5} />
              <Picker.Item label="6 days" value={6} />
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Available Equipment</Text>
            <Picker
              selectedValue={equipment}
              onValueChange={(itemValue) => setEquipment(itemValue)}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="Full Gym" value="full_gym" />
              <Picker.Item
                label="Home Gym (Dumbbells & Bands)"
                value="home_gym"
              />
              <Picker.Item label="Bodyweight Only" value="bodyweight" />
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGeneratePlan}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.generateButtonText}>Generate Plan</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {generatedPlan && (
        <View style={styles.planContainer}>
          <Text style={styles.planTitle}>{generatedPlan.name}</Text>
          {generatedPlan.days.map((day) => (
            <View key={day.day} style={styles.dayCard}>
              <Text style={styles.dayTitle}>
                Day {day.day}: {day.focus}
              </Text>
              {day.exercises.map((ex, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseDetails}>
                    {ex.sets} | Rest: {ex.rest}
                  </Text>
                </View>
              ))}
              <View style={styles.dayActions}>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => handleStartWorkout(day)}
                >
                  <Text style={styles.startButtonText}>Start Workout</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleSaveDayAsPreset(day)}
                >
                  <Text style={styles.saveButtonText}>Save as Preset</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.regenerateButton}
            onPress={() => setGeneratedPlan(null)}
          >
            <Text style={styles.regenerateButtonText}>Create a New Plan</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1c2e"
  },
  form: {
    padding: 20
  },
  pickerContainer: {
    marginBottom: 20,
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 10
  },
  label: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
    paddingHorizontal: 10
  },
  picker: {
    color: "#fff",
    backgroundColor: "#23263a"
  },
  generateButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff"
  },
  planContainer: {
    padding: 20
  },
  planTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20
  },
  dayCard: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3d52"
  },
  exerciseName: {
    fontSize: 16,
    color: "#fff"
  },
  exerciseDetails: {
    fontSize: 16,
    color: "gray"
  },
  dayActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15
  },
  startButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 5
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff"
  },
  saveButton: {
    backgroundColor: "#3a3d52",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 5
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff"
  },
  regenerateButton: {
    backgroundColor: "transparent",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#4b5563"
  },
  regenerateButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#b0b3c2"
  }
});

export default AIWorkoutPlannerScreen;
