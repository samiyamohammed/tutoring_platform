import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MessagingScreen from "../screens/MessagingScreen";
import MyCoursesScreen from "../screens/MyCoursesScreen";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Profile") {
            iconName = "user";
          } else if (route.name === "Inbox") {
            iconName = "comment";
          } else if (route.name === "My Courses") {
            iconName = "book";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#ccc",
        tabBarStyle: {
          backgroundColor: "#004d40",
          height: 60,
          paddingBottom: 5,
          borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="My Courses"
        component={MyCoursesScreen}
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#004d40" }}
              >
                My Courses
              </Text>
              <Icon
                name="bell"
                size={22}
                color="#004d40"
                style={{ marginLeft: 200 }}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={MessagingScreen}
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#004d40" }}
              >
                Inbox
              </Text>
              <TouchableOpacity style={{ marginLeft: 250 }}>
                <Icon name="search" size={22} color="#004d40" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
