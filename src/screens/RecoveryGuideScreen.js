import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

const MuscleRecoveryMeter = ({ value }) => {
  //value should be between 0 and 100
  let color;
  if (value <= 33) {
    color = "red";
  } else if (value <= 66) color = "yellow";
  else {
    color = "green";
  }
  return (
    <View style={syles.meterContainer}>
      <View style={[styles.meter, { backgroundColor: "#e0e0e0" }]}>
        <View
          style={[
            styles.meterFill,
            {
              width: "${value}%",
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <View style={styles.meterLabels}>
        <Text style={[styles.meterLabel, { color: "#FF4444" }]}>Rest</Text>
        <Text style={[styles.meterLabel, { color: "#FFBB33" }]}>Caution</Text>
        <Text style={[styles.meterLabel, { color: "#00C851" }]}>Train</Text>
      </View>
    </View>
  );
};

const RecoveryGuideScreen = () => {
  // this will be connected to redux store later to get the training days
  const muscleGroups = [
    { name: "Chest", recovery: 70 },
    { name: "Back", recovery: 30 },
    { name: "Shoulders", recovery: 50 },
    { name: "Biceps", recovery: 80 },
    { name: "Triceps", recovery: 75 },
    { name: "Forearms", recovery: 90 },
    { name: "Abs", recovery: 85 },
    { name: "Traps", recovery: 45 },
    { name: "Quads", recovery: 20 },
    { name: "Hamstrings", recovery: 25 },
    { name: "Calves", recovery: 95 },
    { name: "Glutes", recovery: 35 },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recovery Guide</Text>
        <Text style={styles.subtitle}>
          Monitor your muscle recovery status to optimize your training
        </Text>
      </View>

      <View style={styles.muscleList}>
        {muscleGroups.map((muscle, index) => (
          <View key={index} style={styles.muscleItem}>
            <Text style={styles.muscleName}>{muscle.name}</Text>
            <View style={styles.meterWrapper}>
              <MuscleRecoveryMeter value={muscle.recovery} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
});

export default CalculatorScreen;
