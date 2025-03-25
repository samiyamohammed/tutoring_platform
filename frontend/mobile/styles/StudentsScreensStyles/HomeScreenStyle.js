import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userName: {
    color: "#004d40",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#004d40",
    borderRadius: 6,
    marginLeft: 8,
  },
  filterText: {
    color: "#fff",
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginTop: 20,
  },
  courseCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  courseDetails: {
    flex: 1,
    marginLeft: 10,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  collegeName: {
    fontSize: 12,
    color: "#666",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  progressBarContainer: {
    marginTop: 8,
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#004d40",
    borderRadius: 4,
  },
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  categoryChip: {
    backgroundColor: "#004d40",
    padding: 10,
    borderRadius: 20,
  },
  categoryText: {
    color: "#fff",
  },
  tutorsContainer: {
    padding: 10,
    marginTop: 20,
  },

  tutorCard: {
    width: 150, 
    height: 200, 
    marginRight: 15, 
    borderRadius: 10, 
    backgroundColor: "#fff", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3, 
  },

  tutorImage: {
    width: "100%", 
    height: 120,  
    borderRadius: 10,  
  },

  tutorName: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 6,
  },
  tutorSubject: {
    fontSize: 12,
    color: "#666",
  },
});
