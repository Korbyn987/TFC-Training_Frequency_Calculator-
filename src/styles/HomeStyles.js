import { StyleSheet } from "react-native";

const HomeStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  welcomeUser: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  muscleItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  muscleName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  daysContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  daysText: {
    fontSize: 16,
    color: "#666",
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  // Button styles
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: "#5856D6",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  outlineText: {
    color: "#007AFF",
  },
  logoutButton: {
    backgroundColor: "#f44336",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
  saveButton: {
    backgroundColor: "#34C759",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
});

export default HomeStyles;
