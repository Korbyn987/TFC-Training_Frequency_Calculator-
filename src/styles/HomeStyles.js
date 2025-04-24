import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171923", // Dark theme background
    padding: 16,
  },
  scrollView: {
    flex: 1,
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
  welcomeUser: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
  },
  startWorkoutButton: {
    backgroundColor: "#6b46c1",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startWorkoutButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(107, 70, 193, 0.1)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(107, 70, 193, 0.2)",
  },
  streakText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    backgroundColor: "rgba(30, 32, 42, 0.9)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statItem: {
    alignItems: "center",
    padding: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6b46c1",
  },
  statLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 100,
  },
  muscleItem: {
    backgroundColor: "rgba(30, 32, 42, 0.9)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(107, 70, 193, 0.2)",
  },
  muscleStatus: (status) => ({
    flex: 1,
    backgroundColor:
      status === "ready"
        ? "#6b46c1" // Primary purple
        : status === "caution"
        ? "#805ad5" // Lighter purple
        : "#553c9a", // Darker purple
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor:
      status === "ready"
        ? "rgba(107, 70, 193, 0.4)"
        : status === "caution"
        ? "rgba(128, 90, 213, 0.4)"
        : "rgba(85, 60, 154, 0.4)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }),
  muscleName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  daysText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
  },
  editButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(107, 70, 193, 0.2)",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  quickActionItem: {
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: {
    color: "#ffffff",
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  selectedGroup: {
    backgroundColor: "rgba(107, 70, 193, 0.2)",
    borderWidth: 2,
    borderColor: "#6b46c1",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#171923",
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(107, 70, 193, 0.2)",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 2,
    borderColor: "rgba(107, 70, 193, 0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "rgba(30, 32, 42, 0.9)",
    color: "#ffffff",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  modalButton: {
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
  },
  cancelButton: {
    backgroundColor: "#c53030",
  },
  saveButton: {
    backgroundColor: "#6b46c1",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#171923",
    borderTopWidth: 1,
    borderTopColor: "rgba(107, 70, 193, 0.2)",
  },
  button: {
    backgroundColor: "#6b46c1",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: "#2196F3",
  },
  logoutButton: {
    backgroundColor: "#c53030",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#6b46c1",
    backgroundColor: "transparent",
  },
  outlineText: {
    color: "#6b46c1",
  },
  resetButton: {
    backgroundColor: "#ff9800",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  // Workout Menu Styles
  workoutMenu: {
    backgroundColor: "#1f222b", // Darker background for menu
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  menuCloseButton: {
    padding: 8,
  },
  menuCloseText: {
    fontSize: 20,
    color: "#6b46c1", // Purple accent
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
  muscleButtonText: {
    color: "#ffffff",
    textAlign: "center",
  },
  selectedMuscleButton: {
    backgroundColor: "#6b46c1",
  },
  selectedMuscleButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  startWorkoutButton: {
    backgroundColor: "#6b46c1",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  startWorkoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  streakContainer: {
    backgroundColor: "#2a2e39",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  streakText: {
    color: "#ffffff",
    fontSize: 16,
  },
  streakNumber: {
    color: "#6b46c1",
    fontSize: 24,
    fontWeight: "bold",
  },
  configuredWorkoutSection: {
    backgroundColor: '#1e202a',
    borderRadius: 14,
    padding: 16,
    marginVertical: 16,
    marginHorizontal: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(107, 70, 193, 0.5)',
    shadowColor: '#6b46c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 7,
  },
  configuredWorkoutTitle: {
    color: '#b794f4',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: '#6b46c1',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  configuredWorkoutExerciseCard: {
    backgroundColor: 'rgba(107, 70, 193, 0.12)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(183, 148, 244, 0.2)',
  },
  configuredWorkoutExerciseName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  configuredWorkoutExerciseDesc: {
    color: '#b794f4',
    fontSize: 13,
    marginBottom: 4,
  },
  configuredWorkoutSetText: {
    color: '#fff',
    fontSize: 13,
  },
  configuredWorkoutSetNotes: {
    color: '#b794f4',
    fontSize: 12,
    marginLeft: 8,
  },
  configuredWorkoutEditButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    backgroundColor: '#6b46c1',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  configuredWorkoutEditButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});
