import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  workoutInProgressContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  workoutTimer: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6b46c1",
    marginBottom: 20,
  },
  selectedMusclesContainer: {
    marginBottom: 20,
  },
  selectedMusclesTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  selectedMusclesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedMuscleChip: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 4,
  },
  chipText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  clearButton: {
    padding: 4,
  },
  clearAllButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  muscleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  muscleButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 12,
    flex: 1,
    minWidth: "30%",
    alignItems: "center",
  },
  selectedMuscleButton: {
    backgroundColor: "#6b46c1",
  },
  muscleButtonText: {
    fontSize: 14,
    color: "#333",
  },
  selectedMuscleButtonText: {
    color: "#fff",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  startButton: {
    backgroundColor: "#6b46c1",
    marginLeft: 10,
  },
  endButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
