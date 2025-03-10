import { StyleSheet } from "react-native";

const HomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", //change this
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000", //change this
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#000", //change this,
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
    // Native shadow props
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    // Web shadow prop
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.2)"
  },
  muscleName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000", //change this
  },
  daysContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  daysText: {
    fontSize: 16,
    color: "#666", //change this
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333", //change this
  },
  input: {
    width: "100%",
    height: 44,
    backgroundColor: "#f5f5f5", //change this
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#ff3b30",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
export default HomeStyles;
