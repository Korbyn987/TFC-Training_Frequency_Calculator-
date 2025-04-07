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
    maxHeight: "80%",
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
  selectedMusclesContainer: {
    marginBottom: 20,
  },
  selectedMusclesTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#666",
  },
  selectedMusclesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedMuscleChip: {
    backgroundColor: "#e3e3e3",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    color: "#333",
  },
  muscleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  muscleButton: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 12,
    flex: 1,
    minWidth: "30%",
    alignItems: "center",
    justifyContent: "center",
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
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    marginRight: 8,
  },
  startButton: {
    backgroundColor: "#4CAF50",
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
