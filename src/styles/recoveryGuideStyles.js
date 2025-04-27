import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171923", // Dark theme background
    padding: 16,
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 4,
    borderBottomColor: "#6b46c1", // Purple accent
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
  },
  content: {
    padding: 16,
  },
  muscleCard: {
    backgroundColor: "rgba(30, 32, 42, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(107, 70, 193, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  muscleName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    flex: 1,
  },
  progressContainer: {
    marginHorizontal: 16,
    backgroundColor: "rgba(107, 70, 193, 0.1)",
    borderRadius: 30,
    padding: 4,
  },
  recoveryText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    flex: 1,
    textAlign: "right",
  },
});
