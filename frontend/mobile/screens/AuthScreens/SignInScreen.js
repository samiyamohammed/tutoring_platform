import React, { useState } from "react";
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
import { useAuth } from "../../context/AuthContext"; // Import useAuth hook
import styles from "../../styles/AuthScreensStyles/SignInScreenStyles";

export default function SignInScreen() {
  const navigation = useNavigation();
  const { signIn } = useAuth(); // Get signIn function from AuthContext
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    let role = "";
    if (email === "student@gmail.com") {
      role = "student";
    } else if (email === "tutor@gmail.com") {
      role = "tutor";
    } else if (email === "admin@gmail.com") {
      role = "admin";
    } else {
      Alert.alert("Error", "Invalid email or role not assigned.");
      return;
    }

    // Call signIn function from AuthContext
    signIn({ email, role });

    // Navigate to the Home screen (or dashboard)
    navigation.replace("Home"); // Change this to the actual screen you want
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
      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.signInText}>SIGN IN</Text>
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
