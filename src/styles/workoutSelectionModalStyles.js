import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#171923",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    height: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeButton: {
    padding: 8,
  },
  muscleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  muscleButton: {
    backgroundColor: "#2a2e39",
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedMuscleButton: {
    backgroundColor: "#6b46c1",
  },
  muscleButtonText: {
    color: "#ffffff",
    textAlign: "center",
  },
  selectedMuscleButtonText: {
    fontWeight: "bold",
  },
});
