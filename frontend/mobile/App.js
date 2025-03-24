  // import React from "react";
  // import { NavigationContainer } from "@react-navigation/native";
  // import {
  //   createStackNavigator,
  //   CardStyleInterpolators,
  // } from "@react-navigation/stack";

  // import SignUpScreen from "./screens/SignUpScreen";
  // import SignInScreen from "./screens/SignInScreen";
  // import ResetPasswordScreen from "./screens/ResetPasswordScreen";
  // import OnboardingScreen1 from "./screens/OnboardingScreen1";
  // import OnboardingScreen2 from "./screens/OnboardingScreen2";
  // import OnboardingScreen3 from "./screens/OnboardingScreen3";

  // import BottomTabs from "./components/BottomNav";
  // import ContinueLearningScreen from "./screens/ContinueLearningScreen";
  // import TutorDashboard from "./screens/TutorDashboardScreen";

  // const Stack = createStackNavigator();

  // export default function App() {
  //   return (
  //     <NavigationContainer>
  //       <Stack.Navigator
  //         initialRouteName="TutorDashboard"
  //         screenOptions={({ navigation }) => ({
  //           headerShown: false,
  //           gestureEnabled: true,
  //           gestureDirection: navigation.canGoBack()
  //             ? "horizontal-inverted"
  //             : "horizontal",
  //           cardStyleInterpolator: navigation.canGoBack()
  //             ? CardStyleInterpolators.forFadeFromBottomAndroid
  //             : CardStyleInterpolators.forHorizontalIOS,
  //         })}
  //       >
  //         {/* Onboarding Screens */}
  //         <Stack.Screen name="Onboarding" component={OnboardingScreen1} />
  //         <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
  //         <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />

  //         {/* Authentication Screens */}
  //         <Stack.Screen name="SignUp" component={SignUpScreen} />
  //         <Stack.Screen name="SignIn" component={SignInScreen} />
  //         <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

  //         {/* Main App - Bottom Navigation */}
  //         <Stack.Screen name="Main" component={BottomTabs} />
  //         <Stack.Screen
  //           name="ContinueLearning"
  //           component={ContinueLearningScreen}
  //         />
  //         <Stack.Screen name="TutorDashboard" component={TutorDashboard} />
  //       </Stack.Navigator>
  //     </NavigationContainer>
  //   );
  // }


import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../mobile/context/ThemeContext';
import { AuthProvider } from "../mobile/context/AuthContext";
import RootNavigator from '../mobile/navigations/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}