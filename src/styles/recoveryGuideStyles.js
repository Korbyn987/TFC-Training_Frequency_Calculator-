import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171923", // Dark background
    padding: 16,
  },
  header: {
    marginBottom: 24,
    backgroundColor: "rgba(30, 32, 42, 0.9)", // Glass morphism background
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(107, 70, 193, 0.2)", // Purple border
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  gridHeader: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "rgba(107, 70, 193, 0.1)", // Light purple background
    padding: 12,
    borderRadius: 8,
  },
  headerCell: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    color: "#FFFFFF",
    padding: 8,
  },
  muscleList: {
    gap: 12,
  },
  gridRow: {
    flexDirection: "row",
    backgroundColor: "rgba(30, 32, 42, 0.9)", // Glass morphism background
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(107, 70, 193, 0.2)", // Purple border
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gridCell: {
    flex: 1,
    gap: 8,
    alignItems: "center",
  },
  muscleName: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  recoveryTime: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  meterContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  meterTextContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(107, 70, 193, 0.1)", // Light purple background
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  timeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b46c1", // Primary purple
  },
  statusText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  loginPrompt: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 4,
  },
  progressRing: {
    backgroundColor: "rgba(107, 70, 193, 0.1)", // Light purple background
    borderRadius: 50,
    padding: 4,
  },
});
