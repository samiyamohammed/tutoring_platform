import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import SignUpScreen from "./screens/SignUpScreen";
import SignInScreen from "./screens/SignInScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import OnboardingScreen1 from "./screens/OnboardingScreen1";
import OnboardingScreen2 from "./screens/OnboardingScreen2";
import OnboardingScreen3 from "./screens/OnboardingScreen3";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ route, navigation }) => ({
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: navigation.canGoBack()
            ? "horizontal-inverted"
            : "horizontal", // Fix direction for back swipe
          cardStyleInterpolator: navigation.canGoBack()
            ? CardStyleInterpolators.forFadeFromBottomAndroid // Left-to-right for back
            : CardStyleInterpolators.forHorizontalIOS, // Right-to-left for forward
        })}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen1} />
        <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
        <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
