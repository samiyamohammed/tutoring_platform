import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)", 
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, 
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    borderRadius: 16,
    width: width * 0.8,
    maxWidth: 400,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
  },
  placeholderLogo: {
    width: 120,
    height: 120,
    backgroundColor: "#06454F",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 20,
  },
  message: {
    fontSize: 16,
    color: "#06454F",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "500",
  },
});
