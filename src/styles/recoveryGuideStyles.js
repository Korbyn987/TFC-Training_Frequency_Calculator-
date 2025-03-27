import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  girdHeader: {
    flexDiection: "row",
    marginBottom: 16,
    backgroundColor: "#e0e0e0",
    padding: 12,
    borderRadius: 8,
  },
  headerCell: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
    gap: 2,
    padding: 8,
  },
  muscleList: {
    gap: 12,
  },
  gridRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  gridCell: {
    flex: 1,
    gap: 8,
  },
  muscleName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  recoveryTime: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  meterContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  meterTextContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "333",
  },
  statusText: {
    fontSize: 12,
    color: "666",
    marginTop: 4,
  },
  loginPrompt: {
    fontSize: 12,
    color: "666",
    textAlign: "center",
    marginTop: 4,
  },
});
