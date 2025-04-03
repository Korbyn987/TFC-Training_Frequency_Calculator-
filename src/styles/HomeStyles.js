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
    borderColor: status === "ready"
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
    justifyContent: "space-around",
    marginTop: 24,
    marginBottom: 48,
  },
  quickActionItem: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(30, 32, 42, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(107, 70, 193, 0.2)",
  },
  selectedGroup: {
    backgroundColor: "rgba(107, 70, 193, 0.2)",
    borderWidth: 2,
    borderColor: "#6b46c1",
  },
  quickActionText: {
    fontSize: 18,
    color: "#ffffff",
    marginTop: 8,
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
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
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
});
