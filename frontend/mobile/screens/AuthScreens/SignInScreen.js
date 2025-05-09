import React, { useState } from "react";
import { CommonActions } from "@react-navigation/native";
import { useNavigationContainerRef } from '@react-navigation/native';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext
import { signInUser } from "../../application/services/authService"; // Import authentication service
import styles from "../../styles/AuthScreensStyles/SignInScreenStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function SignInScreen() {
  const navigation = useNavigation();
  const { signIn } = useAuth(); // Context function to manage authentication state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigationRef = useNavigationContainerRef();

  const handleSignIn = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Error", "Email and password are required.");
        return;
      }

      setLoading(true);
      setError(null);

      console.log("🚀 Attempting sign-in with:", { email, password });

      const response = await signInUser(email.trim(), password.trim());
      console.log("✅ Full API Response:", response);

      if (response?.token?.token && response?.token?.user) {
        const { token } = response.token;
        const { role } = response.token.user;

        console.log("🔐 Sign-in successful!");
        console.log("Setting userToken:", token);
        console.log("Setting userRole:", role);

        // Save token & role before updating state
        await AsyncStorage.multiSet([
          ["userToken", token],
          ["userRole", role],
        ]);

        await signIn(token, role); // ✅ Correct function call

        console.log("✅ Token and role saved. Navigating to Home...");


      } else {
        throw new Error("Invalid response from server: Missing token or user data.");
      }
    } catch (error) {
      console.error("🔥 Sign-in error:", error);

      let errorMessage = "Sign-in failed. Please check your credentials.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={24} color="#00434C" />
      </TouchableOpacity>

      <Text style={styles.title}>SIGN IN</Text>
      <Text style={styles.subtitle}>
        Sign In To Access Your Personalized Learning Journey
      </Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email Here"
          placeholderTextColor="#00434C"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#00434C"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? "visibility-off" : "visibility"}
              size={24}
              color="#00434C"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <TouchableOpacity
        style={[styles.signInButton, loading && styles.disabledButton]}
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text style={styles.signInText}>{loading ? "Signing In..." : "SIGN IN"}</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.orText}>Or Sign In with</Text>
        <View style={styles.divider} />
      </View>

      {/* Google Sign In Button */}
      <TouchableOpacity style={styles.googleButton}>
        <Image
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png",
          }}
          style={styles.googleIcon}
        />
        <Text style={styles.googleText}>Sign In With Google</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <Text style={styles.signUpText}>
        Don't have an Account?{" "}
        <Text
          style={styles.signUpLink}
          onPress={() => navigation.navigate("SignUp")}
        >
          Sign Up here
        </Text>
      </Text>
    </View>
  );
}
