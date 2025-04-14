import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#171923',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#2D3748',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#4A5568',
    padding: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
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
    color: "#fff",
    textAlign: "center",
    marginVertical: 32,
    letterSpacing: 1,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  button: {
    width: "48%",
    height: 160,
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftButton: {
    backgroundColor: "#6b46c1",
  },
  rightButton: {
    backgroundColor: "#805AD5",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
  buttonSubText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
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
  endButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export { styles };
