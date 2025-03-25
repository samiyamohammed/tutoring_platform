// ForgotPasswordScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import styles from "../../styles/AuthScreensStyles/ForgotPasswordScreenStyles";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSendResetLink = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    // call an API to send reset instructions
    //demo
    setIsEmailSent(true);
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon name="arrow-back" size={24} color="#06454F" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address to receive password reset instructions
      </Text>

      {isEmailSent ? (
        <View style={styles.successContainer}>
          <Icon name="checkmark-circle" size={60} color="#06454F" />
          <Text style={styles.successText}>
            Reset instructions sent! Please check your email.
          </Text>
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={styles.returnButtonText}>RETURN TO SIGN IN</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Icon
              name="mail-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendResetLink}
          >
            <Text style={styles.sendButtonText}>SEND RESET LINK</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ForgotPasswordScreen;
