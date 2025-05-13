import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171923", // Dark theme background
    padding: 16,
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
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
  },
  content: {
    padding: 16,
  },
  muscleCard: {
    backgroundColor: "rgba(30, 32, 42, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: 'hidden',
  },
  muscleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  muscleName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
  },
  progressTitle: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  recoveryInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  recoveryText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginVertical: 2,
    fontWeight: '500',
  },
  muscleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  recoveredText: {
    color: '#10b981', // Green for fully recovered
  },
  partiallyRecoveredText: {
    color: '#f59e0b', // Yellow for partially recovered
  },
  notRecoveredText: {
    color: '#ef4444', // Red for not recovered
  },
  workoutCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    marginTop: 8,
  },
});
