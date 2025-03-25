import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme, Appearance } from "react-native";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";


const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#5D5CDE",
    secondary: "#7A79E5",
    background: "#FFFFFF",
    text: "#333333",
    secondaryText: "#666666",
    card: "#F5F5F5",
    border: "#DDDDDD",
    notification: "#FF4B4B",
    success: "#4CAF50",
    warning: "#FFC107",
  },
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#5D5CDE",
    secondary: "#7A79E5",
    background: "#181818",
    text: "#FFFFFF",
    secondaryText: "#AAAAAA",
    card: "#2A2A2A",
    border: "#444444",
    notification: "#FF4B4B",
    success: "#4CAF50",
    warning: "#FFC107",
  },
};


const ThemeContext = createContext();


export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(
    colorScheme === "dark" ? darkTheme : lightTheme
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === "dark" ? darkTheme : lightTheme);
    });

    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark: colorScheme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
