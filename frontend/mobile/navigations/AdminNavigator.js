// src/navigation/AdminNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../context/ThemeContext";

// Import screens
import DashboardScreen from "../screens/AdminScreens/DashboardScreen";
import UsersScreen from "../screens/AdminScreens/UsersScreen";
import CoursesScreen from "../screens/AdminScreens/CoursesScreen";
import SettingsScreen from "../screens/AdminScreens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused ? "view-dashboard" : "view-dashboard-outline";
          } else if (route.name === "Users") {
            iconName = focused ? "account-group" : "account-group-outline";
          } else if (route.name === "Courses") {
            iconName = focused ? "book-open-variant" : "book-open-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "cog" : "cog-outline";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondaryText,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen
        name="Users"
        component={UsersScreen}
        options={{ title: "User Management" }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{ title: "Course Management" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "System Settings" }}
      />
    </Tab.Navigator>
  );
}
