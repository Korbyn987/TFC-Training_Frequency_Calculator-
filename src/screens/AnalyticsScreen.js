import React, { useEffect } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { ContributionGraph, LineChart } from "react-native-chart-kit";
import { useTabData } from "../context/TabDataContext";

const AnalyticsScreen = () => {
  const { workoutHistory } = useTabData();

  const processDataForHeatMap = (workouts) => {
    if (!workouts) return [];
    const counts = {};
    workouts.forEach((workout) => {
      const date = new Date(workout.completed_at || workout.created_at)
        .toISOString()
        .split("T")[0];
      counts[date] = (counts[date] || 0) + 1;
    });

    return Object.keys(counts).map((date) => ({ date, count: counts[date] }));
  };

  const processDataForVolumeChart = (workouts) => {
    if (!workouts || workouts.length === 0) return { labels: [], data: [] };

    const weeklyVolume = {};
    const now = new Date();

    workouts.forEach((workout) => {
      const workoutDate = new Date(workout.completed_at || workout.created_at);
      const weekStart = new Date(
        workoutDate.setDate(workoutDate.getDate() - workoutDate.getDay())
      );
      const weekKey = weekStart.toISOString().split("T")[0];

      const totalVolume =
        workout.workout_exercises?.reduce((total, ex) => {
          return (
            total +
            (ex.exercise_sets?.reduce(
              (vol, set) => vol + set.reps * set.weight_kg,
              0
            ) || 0)
          );
        }, 0) || 0;

      weeklyVolume[weekKey] = (weeklyVolume[weekKey] || 0) + totalVolume;
    });

    const sortedWeeks = Object.keys(weeklyVolume)
      .sort((a, b) => new Date(a) - new Date(b))
      .slice(-12); // Last 12 weeks

    return {
      labels: sortedWeeks.map((week) =>
        new Date(week).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        })
      ),
      data: sortedWeeks.map((week) => Math.round(weeklyVolume[week]))
    };
  };

  const processDataForPRs = (workouts) => {
    if (!workouts || workouts.length === 0) return [];

    const personalRecords = {};

    workouts.forEach((workout) => {
      workout.workout_exercises?.forEach((exercise) => {
        const exerciseName = exercise.exercise_name;

        // Ensure we have a valid exercise name before processing
        if (!exerciseName) {
          return; // Skip exercises with no name
        }

        exercise.exercise_sets?.forEach((set) => {
          if (
            !personalRecords[exerciseName] ||
            set.weight_kg > personalRecords[exerciseName].weight
          ) {
            personalRecords[exerciseName] = {
              weight: set.weight_kg,
              reps: set.reps,
              date: new Date(
                workout.completed_at || workout.created_at
              ).toLocaleDateString()
            };
          }
        });
      });
    });

    return Object.entries(personalRecords).sort(
      ([, a], [, b]) => b.weight - a.weight
    );
  };

  const heatMapData = processDataForHeatMap(workoutHistory);
  const volumeChartData = processDataForVolumeChart(workoutHistory);
  const prData = processDataForPRs(workoutHistory);

  useEffect(() => {
    console.log("--- AnalyticsScreen Safer Debug ---");
    if (workoutHistory && workoutHistory.length > 0) {
      console.log(`Received ${workoutHistory.length} workouts.`);
      const firstWorkout = workoutHistory[0];
      console.log("Keys of first workout:", Object.keys(firstWorkout));
      console.log(
        `First workout has ${
          firstWorkout.workout_exercises?.length || 0
        } exercises.`
      );
      if (firstWorkout.workout_exercises?.length > 0) {
        console.log(
          "Keys of first exercise:",
          Object.keys(firstWorkout.workout_exercises[0])
        );
        console.log(
          `First exercise has ${
            firstWorkout.workout_exercises[0].exercise_sets?.length || 0
          } sets.`
        );
      }
    } else {
      console.log("Workout history is empty or not yet loaded.");
    }
    console.log("Processed PR Data Length:", prData.length);
    console.log("--- End AnalyticsScreen Safer Debug ---");
  }, [workoutHistory, prData]);

  const chartConfig = {
    backgroundGradientFrom: "#1a1c2e",
    backgroundGradientTo: "#1a1c2e",
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Workout Consistency</Text>
      <ContributionGraph
        values={heatMapData}
        endDate={new Date()}
        numDays={105}
        width={Dimensions.get("window").width - 16}
        height={220}
        chartConfig={chartConfig}
        tooltipDataAttrs={(value) => ({
          "data-tip": `${value.count} workouts on ${value.date}`
        })}
      />

      <Text style={styles.title}>Weekly Volume Trend (kg)</Text>
      {volumeChartData.data.length > 0 ? (
        <LineChart
          data={{
            labels: volumeChartData.labels,
            datasets: [{ data: volumeChartData.data }]
          }}
          width={Dimensions.get("window").width - 16}
          height={220}
          chartConfig={chartConfig}
          bezier
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            Complete workouts with weight and reps to see volume trends.
          </Text>
        </View>
      )}

      <Text style={styles.title}>Personal Records</Text>
      {prData.length > 0 ? (
        prData.map(([exercise, record], index) => (
          <View key={index} style={styles.prCard}>
            <Text style={styles.prExerciseName}>{exercise}</Text>
            <Text style={styles.prRecordText}>
              {record.weight}kg x {record.reps} reps
            </Text>
            <Text style={styles.prDate}>{record.date}</Text>
          </View>
        ))
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            Your personal records will appear here as you complete workouts.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1c2e",
    paddingTop: 20
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center"
  },
  noDataContainer: {
    backgroundColor: "#23263a",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 40,
    alignItems: "center"
  },
  noDataText: {
    color: "#888",
    textAlign: "center",
    fontSize: 16
  },
  prCard: {
    backgroundColor: "#23263a",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  prExerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    flex: 2
  },
  prRecordText: {
    fontSize: 16,
    color: "#4CAF50",
    flex: 1,
    textAlign: "center"
  },
  prDate: {
    fontSize: 12,
    color: "#888",
    flex: 1,
    textAlign: "right"
  }
});

export default AnalyticsScreen;
