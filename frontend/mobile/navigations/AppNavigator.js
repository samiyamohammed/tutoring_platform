// /src/navigation/AppNavigator.js
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Stack } from "@react-navigation/stack";
import { useColorScheme } from "react-native";
import { useAuth } from "../context/AuthContext";
import { darkTheme, lightTheme } from "../utils/theme";
import StudentTabNavigator from "./StudentNavigator";
import TutorTabNavigator from "./TutorNavigator";
import AdminTabNavigator from "./AdminNavigator";
import AuthNavigator from "../navigations/AuthNavigator";
import SplashScreen from "../screens/SplashScreen";

const AppNavigator = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const { state } = useAuth();

  useEffect(() => {
    const colorScheme = Appearance.getColorScheme();
    if (colorScheme === "dark") {
      console.log("Dark mode enabled");
    }
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log("Theme changed to:", colorScheme);
    });

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {state.isLoading ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : state.userToken == null ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : state.userRole === "student" ? (
          <Stack.Screen name="StudentApp" component={StudentTabNavigator} />
        ) : state.userRole === "tutor" ? (
          <Stack.Screen name="TutorApp" component={TutorTabNavigator} />
        ) : state.userRole === "admin" ? (
          <Stack.Screen name="AdminApp" component={AdminTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
