// SettingsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "../../styles/AdminScreensStyles/AdminSettingScreenStyles";

const SettingsScreen = ({ navigation }) => {
  // State for toggle switches
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Sample user data
  const user = {
    name: "Admin User",
    email: "admin@edulearn.com",
    role: "Administrator",
    avatar: null,
  };

  // Setting sections
  const accountSettings = [
    {
      id: "profile",
      title: "Edit Profile",
      icon: "person",
      action: () => {
        /* Navigate to profile edit */
      },
    },
    {
      id: "password",
      title: "Change Password",
      icon: "lock",
      action: () => {
        /* Navigate to password change */
      },
    },
    {
      id: "twoFactor",
      title: "Two-Factor Authentication",
      icon: "security",
      toggle: true,
      value: twoFactorAuth,
      onToggle: setTwoFactorAuth,
    },
  ];

  const appSettings = [
    {
      id: "darkMode",
      title: "Dark Mode",
      icon: "nights-stay",
      toggle: true,
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      id: "language",
      title: "Language",
      icon: "language",
      action: () => {
        /* Open language selection */
      },
      info: "English",
    },
  ];

  const notificationSettings = [
    {
      id: "emailNotifs",
      title: "Email Notifications",
      icon: "email",
      toggle: true,
      value: emailNotifications,
      onToggle: setEmailNotifications,
    },
    {
      id: "pushNotifs",
      title: "Push Notifications",
      icon: "notifications",
      toggle: true,
      value: pushNotifications,
      onToggle: setPushNotifications,
    },
  ];

  const supportSettings = [
    {
      id: "help",
      title: "Help & Support",
      icon: "help",
      action: () => {
        /* Navigate to help */
      },
    },
    {
      id: "feedback",
      title: "Send Feedback",
      icon: "feedback",
      action: () => {
        /* Open feedback form */
      },
    },
    {
      id: "about",
      title: "About",
      icon: "info",
      action: () => {
        /* Show app info */
      },
    },
  ];

  // Render setting item
  const renderSettingItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.toggle ? undefined : item.action}
    >
      <View style={styles.settingIcon}>
        <Icon name={item.icon} size={24} color="#00434C" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.info && <Text style={styles.settingInfo}>{item.info}</Text>}
      </View>
      {item.toggle ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: "#D1D1D6", true: "#00778A" }}
          thumbColor={item.value ? "#00434C" : "#F4F3F4"}
        />
      ) : (
        <Icon name="chevron-right" size={24} color="#8A9CAA" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#00434C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.profileImage}
              />
            ) : (
              <Text style={styles.profileImageText}>{user.name.charAt(0)}</Text>
            )}
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          {accountSettings.map(renderSettingItem)}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          {appSettings.map(renderSettingItem)}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {notificationSettings.map(renderSettingItem)}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          {supportSettings.map(renderSettingItem)}
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Icon name="logout" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>EduLearn Admin v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
