import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/workoutBannerStyles";

const WorkoutBanner = ({ selectedMuscles, onMuscleRemove, onEndWorkout }) => {
  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.title}>Selected Muscles:</Text>
        <View style={styles.muscleContainer}>
          {selectedMuscles.map((muscle, index) => (
            <TouchableOpacity
              key={index}
              style={styles.muscleChip}
              onPress={() => onMuscleRemove(muscle)}
            >
              <Text style={styles.muscleText}>{muscle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.endButton} onPress={onEndWorkout}>
        <Ionicons name="checkmark-done" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

export default WorkoutBanner;
