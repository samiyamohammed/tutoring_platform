import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../context/ThemeContext";

import HomeScreen from "../screens/TutorScreens/TutorHomeScreen";
import CoursesScreen from "../screens/TutorScreens/TutorCourseScreen";
//import StudentsScreen from "../screens/TutorScreens/";
import ChatScreen from "../screens/TutorScreens/TutorChatScreen";
import ProfileScreen from "../screens/TutorScreens/TutorProfileScreen";

const Tab = createBottomTabNavigator();

export default function TutorNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "view-dashboard" : "view-dashboard-outline";
          } else if (route.name === "Courses") {
            iconName = focused ? "book-open-variant" : "book-open-outline";
          } else if (route.name === "Students") {
            iconName = focused ? "account-group" : "account-group-outline";
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
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{ title: "My Courses" }}
      />
      {/* <Tab.Screen
        name="Students"
        component={StudentsScreen}
        options={{ title: "My Students" }}
      /> */}
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
