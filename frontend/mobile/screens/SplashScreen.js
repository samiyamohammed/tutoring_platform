import React, { useEffect } from "react";
import { View, Text, Image, ActivityIndicator, Animated } from "react-native";
import styles from "../styles/SplashScreenStyles";

const SplashScreen = ({
  visible = true,
  message = "Loading...",
  logoSource = null,
  appName = "Tutoring Platform",
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Reset and start animations when visible
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {logoSource ? (
            <Image
              source={logoSource}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderLogo}>
              <Text style={styles.logoText}>{appName}</Text>
            </View>
          )}
        </Animated.View>

        <ActivityIndicator size="large" color="#06454F" style={styles.loader} />

        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

export default SplashScreen;
