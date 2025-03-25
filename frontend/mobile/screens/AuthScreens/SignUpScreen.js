import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import styles from "../../styles/AuthScreensStyles/SignUpScreenStyles";

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("student"); 

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={24} color="#00434C" />
      </TouchableOpacity>

      <Text style={styles.title}>SIGN UP</Text>
      <Text style={styles.subtitle}>
        Create Your Account To Embark On Your Educational Adventure
      </Text>

      {/* Full Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#00434C"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Here</Text>
        <TextInput
          style={styles.input}
          placeholder="yourmail@gmail.com"
          placeholderTextColor="#00434C"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      {/* Role Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select Your Role</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "student" && styles.roleButtonSelected,
            ]}
            onPress={() => setRole("student")}
          >
            <Text
              style={[
                styles.roleText,
                role === "student" && styles.roleTextSelected,
              ]}
            >
              Student
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "tutor" && styles.roleButtonSelected,
            ]}
            onPress={() => setRole("tutor")}
          >
            <Text
              style={[
                styles.roleText,
                role === "tutor" && styles.roleTextSelected,
              ]}
            >
              Tutor
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="***************"
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

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="***************"
            placeholderTextColor="#00434C"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <MaterialIcons
              name={showConfirmPassword ? "visibility-off" : "visibility"}
              size={24}
              color="#00434C"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signUpButton}>
        <Text style={styles.signUpText}>SIGN UP</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.orText}>Or Sign Up with</Text>
        <View style={styles.divider} />
      </View>

      {/* Google Sign Up Button */}
      <TouchableOpacity style={styles.googleButton}>
        <Image
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png",
          }}
          style={styles.googleIcon}
        />
        <Text style={styles.googleText}>Sign Up With Google</Text>
      </TouchableOpacity>

      {/* Sign In Link */}
      <Text style={styles.signInText}>
        Already have an Account?{" "}
        <Text
          style={styles.signInLink}
          onPress={() => navigation.navigate("SignIn")}
        >
          Sign in here
        </Text>
      </Text>
    </View>
  );
}
