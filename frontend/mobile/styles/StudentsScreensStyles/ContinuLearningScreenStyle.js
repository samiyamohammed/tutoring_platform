import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
    marginRight: 30,
  },
  backButton: {
    padding: 10,
    marginRight: 5,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 30,
  },
  courseList: {
    flexGrow: 1,
  },
  courseCard: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  courseDetails: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  collegeName: {
    fontSize: 14,
    color: "#666",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 5,
    color: "#FFD700",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 5,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#004d40",
    borderRadius: 3,
  },
});
