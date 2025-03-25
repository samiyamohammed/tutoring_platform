// src/navigation/StudentNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../context/ThemeContext";
import HomeScreen from "../screens/StudentsScreens/HomeScreen";
import CoursesScreen from "../screens/StudentsScreens/MyCoursesScreen";
import ChatScreen from "../screens/StudentsScreens/MessagingScreen";
import ProfileScreen from "../screens/StudentsScreens/ProfileScreen";
import ContinueLearningScreen from "../screens/StudentsScreens/ContinueLearningScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentHome" component={HomeScreen} />
      <Stack.Screen
        name="ContinueLearning"
        component={ContinueLearningScreen}
      />
    </Stack.Navigator>
  );
}

export default function StudentNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Courses") {
            iconName = focused
              ? "book-open-page-variant"
              : "book-open-page-variant-outline";
          } else if (route.name === "Chat") {
            iconName = focused ? "message" : "message-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "account" : "account-outline";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondaryText,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 70, 
          paddingBottom: 15,
          paddingTop: 15, 
        },

        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{ title: "My Courses" }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: "Messages" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "My Profile" }}
      />
    </Tab.Navigator>
  );
}
