import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";

import { Provider } from 'react-redux';
import store from './src/store/store';

import SignUpScreen from "./src/screens/SignUpScreen";
import SignInScreen from "./src/screens/SignInScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";
import OnboardingScreen1 from "./src/screens/OnboardingScreen1";
import OnboardingScreen2 from "./src/screens/OnboardingScreen2";
import OnboardingScreen3 from "./src/screens/OnboardingScreen3";

import BottomTabs from "./src/components/BottomNav";
import HomeScreen from "./src/screens/HomeScreen"; // Import HomeScreen

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="SignIn" // Initial screen (SignIn)
          screenOptions={({ navigation }) => ({
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: navigation.canGoBack()
              ? "horizontal-inverted"
              : "horizontal",
            cardStyleInterpolator: navigation.canGoBack()
              ? CardStyleInterpolators.forFadeFromBottomAndroid
              : CardStyleInterpolators.forHorizontalIOS,
          })}
        >
          {/* Onboarding Screens */}
          <Stack.Screen name="Onboarding" component={OnboardingScreen1} />
          <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
          <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />

          {/* Authentication Screens */}
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

          {/* Main App - Bottom Navigation */}
          <Stack.Screen name="Main" component={BottomTabs} />

          {/* Home Screen - Make sure it is directly passed as the component */}
          <Stack.Screen name="Home" component={HomeScreen} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
