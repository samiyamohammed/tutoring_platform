import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { validateEmail, validatePassword } from "../utils/validation";
import { useDispatch, useSelector } from "react-redux";
import { signUpUser } from "../store/authSlice";

export default function SignUpScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Error", "Invalid email format");
      return;
    }
    if (!validatePassword(password)) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await dispatch(signUpUser({ fullName, email, password })).unwrap();
      Alert.alert("Success", "Account created successfully");
      navigation.navigate("SignIn");
    } catch (error) {
      Alert.alert("Sign Up Failed", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={24} color="#00434C" />
      </TouchableOpacity>

      <Text style={styles.title}>SIGN UP</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={24} color="#00434C" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <MaterialIcons name={showConfirmPassword ? "visibility-off" : "visibility"} size={24} color="#00434C" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signUpText}>SIGN UP</Text>}
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Text style={styles.signInText}>
        Already have an account?{" "}
        <Text style={styles.signInLink} onPress={() => navigation.navigate("SignIn")}>
          Sign in here
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  backButton: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  inputContainer: { marginBottom: 15 },
  input: { borderWidth: 1, padding: 10, borderRadius: 8 },
  signUpButton: { backgroundColor: "#00434C", padding: 15, alignItems: "center", borderRadius: 8 },
  signUpText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  errorText: { color: "red", marginTop: 10 },
  signInText: { marginTop: 10 },
  signInLink: { color: "#00434C", fontWeight: "bold" },
});
