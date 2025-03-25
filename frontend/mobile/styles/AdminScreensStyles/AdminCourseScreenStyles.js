import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00434C",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    margin: 15,
    borderRadius: 10,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#344356",
  },
  clearButton: {
    padding: 5,
  },
  filtersContainer: {
    marginBottom: 10,
  },
  filtersScrollContent: {
    paddingHorizontal: 15,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#F0F4F8",
  },
  filterButtonActive: {
    backgroundColor: "#00434C",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#344356",
  },
  filterButtonTextActive: {
    color: "#FFF",
  },
  coursesList: {
    padding: 15,
  },
  courseCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  courseImageContainer: {
    position: "relative",
    height: 120,
  },
  courseImage: {
    width: "100%",
    height: 120,
  },
  coursePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#00434C",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "rgba(0, 196, 140, 0.9)",
  },
  statusInactive: {
    backgroundColor: "rgba(255, 107, 107, 0.9)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusTextActive: {
    color: "#FFF",
  },
  statusTextInactive: {
    color: "#FFF",
  },
  courseContent: {
    padding: 15,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#344356",
    marginBottom: 5,
  },
  courseInstructor: {
    fontSize: 14,
    color: "#8A9CAA",
    marginBottom: 10,
  },
  courseDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  courseDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginBottom: 5,
  },
  courseDetailText: {
    fontSize: 14,
    color: "#344356",
    marginLeft: 5,
  },
  courseActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F0F4F8",
  },
  courseAction: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#8A9CAA",
  },
});
