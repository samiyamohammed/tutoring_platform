import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import GestureRecognizer from "react-native-swipe-gestures";

const OnboardingScreen = () => {
  const navigation = useNavigation();

  const handleSwipeLeft = () => {
    navigation.navigate("Onboarding2");
  };

  return (
    <GestureRecognizer onSwipeLeft={handleSwipeLeft} style={styles.container}>
      {/* Illustration */}
      <Image
        source={require("../assets/onboarding-image.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Heading */}
      <Text style={styles.heading}>
        Enter the World of{"\n"}Online Learning
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtext}>
        Begin Your Educational Journey With{"\n"}
        Access To A Diverse Range Of{"\n"}
        Courses.
      </Text>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate("Onboarding2")}
      >
        <Text style={styles.continueText}>CONTINUE</Text>
      </TouchableOpacity>

      {/* Skip Button */}
      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.skipText}>SKIP</Text>
      </TouchableOpacity>
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00434C",
    textAlign: "center",
  },
  subtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginVertical: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    marginVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#00434C",
  },
  continueButton: {
    backgroundColor: "#00434C",
    paddingVertical: 12,
    width: "80%",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipText: {
    color: "#666",
    fontSize: 14,
  },
});

export default OnboardingScreen;
