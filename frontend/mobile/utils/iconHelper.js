// /src/utils/iconHelper.js
import React from "react";
import { Icon } from "react-native-vector-icons";

export const getTabBarIcon = (routeName, focused, color, size) => {
  let iconName;

  switch (routeName) {
    case "Home":
      iconName = focused ? "view-dashboard" : "view-dashboard-outline";
      break;
    case "Courses":
      iconName = focused ? "book-open-variant" : "book-open-outline";
      break;
    case "Students":
      iconName = focused ? "account-group" : "account-group-outline";
      break;
    case "Chat":
      iconName = focused ? "message" : "message-outline";
      break;
    case "Profile":
      iconName = focused ? "account" : "account-outline";
      break;
    case "Dashboard":
      iconName = focused ? "view-dashboard" : "view-dashboard-outline";
      break;
    case "Users":
      iconName = focused ? "account-group" : "account-group-outline";
      break;
    case "Tutors":
      iconName = focused ? "account-check" : "account-check-outline";
      break;
    case "Settings":
      iconName = focused ? "cog" : "cog-outline";
      break;
    default:
      iconName = "circle-outline";
      break;
  }

  return <Icon name={iconName} size={size} color={color} />;
};
