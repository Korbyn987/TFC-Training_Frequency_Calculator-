import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const CalculatorScreen = ({ navigation }) => {
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [trainingGoal, setTrainingGoal] = useState("strength");
  const [availableDays, setAvailableDays] = useState(3);
  const [recoveryCapacity, setRecoveryCapacity] = useState("average");
  const [results, setResults] = useState(null);

  const calculateFrequency = () => {
    let baseFrequency = 2;
    let recommendations = [];

    // Adjust based on experience level
    switch (experienceLevel) {
      case "beginner":
        baseFrequency = 2;
        recommendations.push(
          "As a beginner, focus on learning proper form and building a foundation."
        );
        break;
      case "intermediate":
        baseFrequency = 2.5;
        recommendations.push(
          "You can handle moderate training frequency with good recovery."
        );
        break;
      case "advanced":
        baseFrequency = 3;
        recommendations.push(
          "Advanced trainees can benefit from higher frequency training."
        );
        break;
    }

    // Adjust based on training goal
    switch (trainingGoal) {
      case "strength":
        baseFrequency += 0.5;
        recommendations.push(
          "Strength goals benefit from higher frequency with lower volume per session."
        );
        break;
      case "hypertrophy":
        baseFrequency += 0.3;
        recommendations.push(
          "Muscle growth requires consistent stimulus with adequate recovery."
        );
        break;
      case "endurance":
        baseFrequency += 0.2;
        recommendations.push(
          "Endurance training can be done more frequently with lighter loads."
        );
        break;
      case "general":
        recommendations.push(
          "General fitness allows for flexible training frequency."
        );
        break;
    }

    // Adjust based on recovery capacity
    switch (recoveryCapacity) {
      case "poor":
        baseFrequency -= 0.5;
        recommendations.push(
          "Focus on recovery: adequate sleep, nutrition, and stress management."
        );
        break;
      case "average":
        recommendations.push(
          "Maintain consistent sleep and nutrition for optimal recovery."
        );
        break;
      case "excellent":
        baseFrequency += 0.3;
        recommendations.push(
          "Your excellent recovery allows for higher training frequency."
        );
        break;
    }

    // Constrain by available days
    const maxFrequency = Math.min(baseFrequency, availableDays);
    const recommendedFrequency = Math.max(
      1,
      Math.min(Math.round(maxFrequency * 10) / 10, 7)
    );

    // Generate muscle group specific recommendations
    const muscleGroupFrequencies = {
      Chest: Math.max(1, Math.round(recommendedFrequency * 0.8)),
      Back: Math.max(1, Math.round(recommendedFrequency * 0.9)),
      Shoulders: Math.max(1, Math.round(recommendedFrequency * 0.7)),
      Arms: Math.max(1, Math.round(recommendedFrequency * 0.8)),
      Legs: Math.max(1, Math.round(recommendedFrequency * 0.9)),
      Core: Math.min(7, Math.round(recommendedFrequency * 1.2))
    };

    setResults({
      overallFrequency: recommendedFrequency,
      muscleGroupFrequencies,
      recommendations,
      weeklyVolume: calculateWeeklyVolume(recommendedFrequency, trainingGoal),
      restDays: Math.max(1, 7 - recommendedFrequency)
    });
  };

  const calculateWeeklyVolume = (frequency, goal) => {
    let baseSets = 12;

    switch (goal) {
      case "strength":
        baseSets = 10;
        break;
      case "hypertrophy":
        baseSets = 16;
        break;
      case "endurance":
        baseSets = 20;
        break;
      case "general":
        baseSets = 12;
        break;
    }

    return Math.round(baseSets * frequency);
  };

  const resetCalculator = () => {
    setExperienceLevel("beginner");
    setTrainingGoal("strength");
    setAvailableDays(3);
    setRecoveryCapacity("average");
    setResults(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Frequency Calculator</Text>
        <Text style={styles.subtitle}>
          Get personalized training frequency recommendations
        </Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Your Profile</Text>

        {/* Experience Level */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Experience Level</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={experienceLevel}
              style={styles.picker}
              onValueChange={setExperienceLevel}
            >
              <Picker.Item label="Beginner (0-1 years)" value="beginner" />
              <Picker.Item
                label="Intermediate (1-3 years)"
                value="intermediate"
              />
              <Picker.Item label="Advanced (3+ years)" value="advanced" />
            </Picker>
          </View>
        </View>

        {/* Training Goal */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Primary Training Goal</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={trainingGoal}
              style={styles.picker}
              onValueChange={setTrainingGoal}
            >
              <Picker.Item label="Strength" value="strength" />
              <Picker.Item
                label="Muscle Growth (Hypertrophy)"
                value="hypertrophy"
              />
              <Picker.Item label="Endurance" value="endurance" />
              <Picker.Item label="General Fitness" value="general" />
            </Picker>
          </View>
        </View>

        {/* Available Days */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Available Training Days per Week</Text>
          <View style={styles.daySelector}>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  availableDays === day && styles.dayButtonSelected
                ]}
                onPress={() => setAvailableDays(day)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    availableDays === day && styles.dayButtonTextSelected
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recovery Capacity */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recovery Capacity</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={recoveryCapacity}
              style={styles.picker}
              onValueChange={setRecoveryCapacity}
            >
              <Picker.Item
                label="Poor (High stress, poor sleep)"
                value="poor"
              />
              <Picker.Item label="Average (Normal lifestyle)" value="average" />
              <Picker.Item
                label="Excellent (Great sleep, low stress)"
                value="excellent"
              />
            </Picker>
          </View>
        </View>
      </View>

      {/* Calculate Button */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateFrequency}
        >
          <Ionicons name="calculator" size={20} color="#fff" />
          <Text style={styles.calculateButtonText}>Calculate Frequency</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {results && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Your Recommendations</Text>

          {/* Overall Frequency */}
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="fitness" size={24} color="#4CAF50" />
              <Text style={styles.resultCardTitle}>
                Overall Training Frequency
              </Text>
            </View>
            <Text style={styles.frequencyNumber}>
              {results.overallFrequency}
            </Text>
            <Text style={styles.frequencyLabel}>times per week</Text>
            <Text style={styles.restDays}>
              Recommended rest days: {results.restDays} per week
            </Text>
          </View>

          {/* Muscle Group Frequencies */}
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="body" size={24} color="#4CAF50" />
              <Text style={styles.resultCardTitle}>
                Muscle Group Frequencies
              </Text>
            </View>
            <View style={styles.muscleGroupGrid}>
              {Object.entries(results.muscleGroupFrequencies).map(
                ([muscle, freq]) => (
                  <View key={muscle} style={styles.muscleGroupItem}>
                    <Text style={styles.muscleName}>{muscle}</Text>
                    <Text style={styles.muscleFreq}>{freq}x/week</Text>
                  </View>
                )
              )}
            </View>
          </View>

          {/* Weekly Volume */}
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="barbell" size={24} color="#4CAF50" />
              <Text style={styles.resultCardTitle}>
                Recommended Weekly Volume
              </Text>
            </View>
            <Text style={styles.volumeNumber}>{results.weeklyVolume}</Text>
            <Text style={styles.volumeLabel}>
              sets per muscle group per week
            </Text>
          </View>

          {/* Recommendations */}
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="bulb" size={24} color="#4CAF50" />
              <Text style={styles.resultCardTitle}>Personalized Tips</Text>
            </View>
            {results.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationBullet}>•</Text>
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetCalculator}
          >
            <Ionicons name="refresh" size={20} color="#888" />
            <Text style={styles.resetButtonText}>Calculate Again</Text>
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
  header: {
    padding: 20,
    paddingTop: 40
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    lineHeight: 22
  },
  inputSection: {
    padding: 20,
    paddingTop: 0
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20
  },
  inputGroup: {
    marginBottom: 25
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10
  },
  pickerContainer: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    overflow: "hidden"
  },
  picker: {
    color: "#fff",
    backgroundColor: "#23263a"
  },
  daySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap"
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#23263a",
    justifyContent: "center",
    alignItems: "center",
    margin: 2
  },
  dayButtonSelected: {
    backgroundColor: "#4CAF50"
  },
  dayButtonText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "bold"
  },
  dayButtonTextSelected: {
    color: "#fff"
  },
  buttonSection: {
    padding: 20,
    paddingTop: 0
  },
  calculateButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12
  },
  calculateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8
  },
  resultsSection: {
    padding: 20,
    paddingTop: 0
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center"
  },
  resultCard: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15
  },
  resultCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10
  },
  frequencyNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 5
  },
  frequencyLabel: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 10
  },
  restDays: {
    fontSize: 14,
    color: "#888",
    textAlign: "center"
  },
  muscleGroupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  muscleGroupItem: {
    width: "48%",
    backgroundColor: "#1a1c2e",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: "center"
  },
  muscleName: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 4
  },
  muscleFreq: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "bold"
  },
  volumeNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 5
  },
  volumeLabel: {
    fontSize: 14,
    color: "#888",
    textAlign: "center"
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8
  },
  recommendationBullet: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    marginTop: 2
  },
  recommendationText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    flex: 1
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginTop: 10
  },
  resetButtonText: {
    color: "#888",
    fontSize: 16,
    marginLeft: 8
  }
});

export default CalculatorScreen;
