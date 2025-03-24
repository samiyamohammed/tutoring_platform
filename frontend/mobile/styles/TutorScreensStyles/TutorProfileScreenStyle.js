import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
  },
  profileLargeImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  profileBio: {
    fontSize: 14,
    textAlign: "center",
    marginHorizontal: 40,
    marginBottom: 10,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 15,
  },
  verifiedText: {
    fontSize: 12,
    marginLeft: 5,
    fontWeight: "500",
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editProfileText: {
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
  },
  statDivider: {
    width: 1,
    marginVertical: 15,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  expertiseContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  expertiseChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
  },
  expertiseText: {
    fontWeight: "500",
  },
  educationCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  educationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  educationInfo: {
    marginLeft: 15,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  educationSchool: {
    fontSize: 14,
    marginBottom: 4,
  },
  educationYear: {
    fontSize: 12,
  },
  contactCard: {
    borderRadius: 15,
    padding: 15,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  contactText: {
    marginLeft: 15,
    fontSize: 16,
  },
  contactDivider: {
    height: 1,
    marginVertical: 5,
  },
  reviewsCard: {
    borderRadius: 15,
    padding: 15,
  },
  overallRating: {
    alignItems: "center",
    marginBottom: 15,
  },
  ratingValue: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 5,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  reviewCount: {
    fontSize: 14,
  },
  seeAllReviewsButton: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  seeAllReviewsText: {
    fontWeight: "500",
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
  },
  logoutText: {
    color: "#FF4B4B",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "90%",
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalForm: {
    flex: 1,
  },
  profileImageEdit: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  profileEditImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 0,
    right: "30%",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  textInput: {
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  textAreaInput: {
    padding: 12,
    borderRadius: 10,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 16,
  },
  expertiseEditContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  expertiseEditChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
  },
  expertiseEditText: {
    fontWeight: "500",
    marginRight: 5,
  },
  removeChipButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addChipButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
  },
  addChipText: {
    fontWeight: "500",
    marginLeft: 5,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    marginBottom: 20,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  // Settings styles
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 15,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  settingsTextContainer: {
    flex: 1,
    paddingRight: 20,
  },
  settingsLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingsDescription: {
    fontSize: 14,
  },
  settingsButton: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingsButtonText: {
    fontSize: 16,
  },
  deleteAccountButton: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: "center",
  },
});

export default styles;
