import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#1f222b",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  muscleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  muscleChip: {
    backgroundColor: "#6b46c1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  muscleText: {
    color: "#ffffff",
    fontSize: 14,
  },
  endButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#6b46c1",
  },
});
