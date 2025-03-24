import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AuthNavigator from "../navigations/AuthNavigator";
import StudentNavigator from "../navigations/StudentNavigator";
import TutorNavigator from "../navigations/TutorNavigator";
import AdminNavigator from "../navigations/AdminNavigator";
import SplashScreen from "../screens/SplashScreen";

export default function RootNavigator() {
  const { state } = useAuth();
  const { theme } = useTheme();

  if (state.isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={theme}>
      {state.userToken == null ? (
        <AuthNavigator />
      ) : state.userRole === "student" ? (
        <StudentNavigator />
      ) : state.userRole === "tutor" ? (
        <TutorNavigator />
      ) : state.userRole === "admin" ? (
        <AdminNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
