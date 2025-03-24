import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  StatusBar,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/TutorScreensStyles/TutorProfileScreenStyle";

const TutorProfileScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const { signOut } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("Michael Engida");
  const [bio, setBio] = useState(
    "Computer Science Instructor | 5+ years experience"
  );
  const [email, setEmail] = useState("michael.engida@example.com");
  const [phone, setPhone] = useState("+251 91 234 5678");

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(
    colorScheme === "dark"
  );

  const isDark = colorScheme === "dark";
  const theme = {
    colors: {
      primary: "#5D5CDE",
      secondary: "#7A79E5",
      background: isDark ? "#181818" : "#FFFFFF",
      text: isDark ? "#FFFFFF" : "#333333",
      secondaryText: isDark ? "#AAAAAA" : "#666666",
      card: isDark ? "#2A2A2A" : "#F5F5F5",
      border: isDark ? "#444444" : "#DDDDDD",
      notification: "#FF4B4B",
      success: "#4CAF50",
      warning: "#FFC107",
    },
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <View style={styles.profileHeader}>
        <Image
          source={{ uri: "https://picsum.photos/id/91/200" }}
          style={styles.profileLargeImage}
        />
        <Text style={[styles.profileName, { color: theme.colors.text }]}>
          {fullName}
        </Text>
        <Text
          style={[styles.profileBio, { color: theme.colors.secondaryText }]}
        >
          {bio}
        </Text>
        <View
          style={[
            styles.verifiedBadge,
            { backgroundColor: `${theme.colors.success}20` },
          ]}
        >
          <Icon name="check-circle" size={14} color={theme.colors.success} />
          <Text style={[styles.verifiedText, { color: theme.colors.success }]}>
            Verified Tutor
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.editProfileButton,
            { borderColor: theme.colors.primary },
          ]}
          onPress={() => setShowEditModal(true)}
        >
          <Text
            style={[styles.editProfileText, { color: theme.colors.primary }]}
          >
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[styles.statsContainer, { backgroundColor: theme.colors.card }]}
      >
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            3
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.secondaryText }]}
          >
            Courses
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
        />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            65
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.secondaryText }]}
          >
            Students
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
        />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            4.7
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.secondaryText }]}
          >
            Rating
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Expertise
        </Text>
        <View style={styles.expertiseContainer}>
          <View
            style={[
              styles.expertiseChip,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.expertiseText, { color: theme.colors.text }]}>
              Programming
            </Text>
          </View>
          <View
            style={[
              styles.expertiseChip,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.expertiseText, { color: theme.colors.text }]}>
              Web Development
            </Text>
          </View>
          <View
            style={[
              styles.expertiseChip,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.expertiseText, { color: theme.colors.text }]}>
              Algorithms
            </Text>
          </View>
          <View
            style={[
              styles.expertiseChip,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.expertiseText, { color: theme.colors.text }]}>
              Data Structures
            </Text>
          </View>
          <View
            style={[
              styles.expertiseChip,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.expertiseText, { color: theme.colors.text }]}>
              Python
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Education
        </Text>
        <View
          style={[styles.educationCard, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.educationHeader}>
            <Icon name="school" size={24} color={theme.colors.primary} />
            <View style={styles.educationInfo}>
              <Text
                style={[styles.educationDegree, { color: theme.colors.text }]}
              >
                MSc in Computer Science
              </Text>
              <Text
                style={[
                  styles.educationSchool,
                  { color: theme.colors.secondaryText },
                ]}
              >
                Addis Ababa University
              </Text>
              <Text
                style={[
                  styles.educationYear,
                  { color: theme.colors.secondaryText },
                ]}
              >
                2018-2020
              </Text>
            </View>
          </View>
        </View>
        <View
          style={[styles.educationCard, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.educationHeader}>
            <Icon name="school" size={24} color={theme.colors.primary} />
            <View style={styles.educationInfo}>
              <Text
                style={[styles.educationDegree, { color: theme.colors.text }]}
              >
                BSc in Software Engineering
              </Text>
              <Text
                style={[
                  styles.educationSchool,
                  { color: theme.colors.secondaryText },
                ]}
              >
                Addis Ababa Science and Technology University
              </Text>
              <Text
                style={[
                  styles.educationYear,
                  { color: theme.colors.secondaryText },
                ]}
              >
                2014-2018
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Contact Information
        </Text>
        <View
          style={[styles.contactCard, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.contactItem}>
            <Icon name="email-outline" size={22} color={theme.colors.primary} />
            <Text style={[styles.contactText, { color: theme.colors.text }]}>
              {email}
            </Text>
          </View>
          <View
            style={[
              styles.contactDivider,
              { backgroundColor: theme.colors.border },
            ]}
          />
          <View style={styles.contactItem}>
            <Icon name="phone-outline" size={22} color={theme.colors.primary} />
            <Text style={[styles.contactText, { color: theme.colors.text }]}>
              {phone}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Rating & Reviews
        </Text>
        <View
          style={[styles.reviewsCard, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.overallRating}>
            <Text style={[styles.ratingValue, { color: theme.colors.text }]}>
              4.7
            </Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name={star <= 4 ? "star" : "star-half-full"}
                  size={24}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text
              style={[
                styles.reviewCount,
                { color: theme.colors.secondaryText },
              ]}
            >
              Based on 42 reviews
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.seeAllReviewsButton,
              { borderColor: theme.colors.primary },
            ]}
            onPress={() => navigation.navigate("Reviews")}
          >
            <Text
              style={[
                styles.seeAllReviewsText,
                { color: theme.colors.primary },
              ]}
            >
              See All Reviews
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
          onPress={() => setShowSettingsModal(true)}
        >
          <Icon name="cog-outline" size={22} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.text }]}>
            Settings
          </Text>
          <Icon
            name="chevron-right"
            size={22}
            color={theme.colors.secondaryText}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate("Earnings")}
        >
          <Icon name="currency-usd" size={22} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.text }]}>
            Earnings
          </Text>
          <Icon
            name="chevron-right"
            size={22}
            color={theme.colors.secondaryText}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate("Help")}
        >
          <Icon
            name="help-circle-outline"
            size={22}
            color={theme.colors.primary}
          />
          <Text style={[styles.menuText, { color: theme.colors.text }]}>
            Help & Support
          </Text>
          <Icon
            name="chevron-right"
            size={22}
            color={theme.colors.secondaryText}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate("About")}
        >
          <Icon
            name="information-outline"
            size={22}
            color={theme.colors.primary}
          />
          <Text style={[styles.menuText, { color: theme.colors.text }]}>
            About
          </Text>
          <Icon
            name="chevron-right"
            size={22}
            color={theme.colors.secondaryText}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: "#FFF0F0" }]}
          onPress={signOut}
        >
          <Icon name="logout" size={22} color="#FF4B4B" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Edit Profile
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.profileImageEdit}>
                <Image
                  source={{ uri: "https://picsum.photos/id/91/200" }}
                  style={styles.profileEditImage}
                />
                <TouchableOpacity
                  style={[
                    styles.changePhotoButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => console.log("Change photo")}
                >
                  <Icon name="camera" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Full Name
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                    },
                  ]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholderTextColor={theme.colors.secondaryText}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Bio
                </Text>
                <TextInput
                  style={[
                    styles.textAreaInput,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                    },
                  ]}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={theme.colors.secondaryText}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Email
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                    },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholderTextColor={theme.colors.secondaryText}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Phone
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                    },
                  ]}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={theme.colors.secondaryText}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Expertise
                </Text>
                <View style={styles.expertiseEditContainer}>
                  <View
                    style={[
                      styles.expertiseEditChip,
                      { backgroundColor: theme.colors.card },
                    ]}
                  >
                    <Text
                      style={[
                        styles.expertiseEditText,
                        { color: theme.colors.text },
                      ]}
                    >
                      Programming
                    </Text>
                    <TouchableOpacity style={styles.removeChipButton}>
                      <Icon name="close" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      styles.expertiseEditChip,
                      { backgroundColor: theme.colors.card },
                    ]}
                  >
                    <Text
                      style={[
                        styles.expertiseEditText,
                        { color: theme.colors.text },
                      ]}
                    >
                      Web Development
                    </Text>
                    <TouchableOpacity style={styles.removeChipButton}>
                      <Icon name="close" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.addChipButton,
                      { backgroundColor: theme.colors.card },
                    ]}
                    onPress={() => console.log("Add expertise")}
                  >
                    <Icon name="plus" size={16} color={theme.colors.primary} />
                    <Text
                      style={[
                        styles.addChipText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.colors.card },
                  ]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: theme.colors.text },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => {
                    // Save profile changes logic
                    setShowEditModal(false);
                  }}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSettingsModal}
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Settings
              </Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text
                style={[
                  styles.settingsSectionTitle,
                  { color: theme.colors.text },
                ]}
              >
                Notifications
              </Text>

              <View style={styles.settingsRow}>
                <View style={styles.settingsTextContainer}>
                  <Text
                    style={[styles.settingsLabel, { color: theme.colors.text }]}
                  >
                    Email Notifications
                  </Text>
                  <Text
                    style={[
                      styles.settingsDescription,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    Receive notifications via email
                  </Text>
                </View>
                <Switch
                  trackColor={{
                    false: theme.colors.border,
                    true: `${theme.colors.primary}80`,
                  }}
                  thumbColor={
                    emailNotifications
                      ? theme.colors.primary
                      : theme.colors.secondaryText
                  }
                  onValueChange={setEmailNotifications}
                  value={emailNotifications}
                />
              </View>

              <View style={styles.settingsRow}>
                <View style={styles.settingsTextContainer}>
                  <Text
                    style={[styles.settingsLabel, { color: theme.colors.text }]}
                  >
                    Push Notifications
                  </Text>
                  <Text
                    style={[
                      styles.settingsDescription,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    Receive push notifications on your device
                  </Text>
                </View>
                <Switch
                  trackColor={{
                    false: theme.colors.border,
                    true: `${theme.colors.primary}80`,
                  }}
                  thumbColor={
                    pushNotifications
                      ? theme.colors.primary
                      : theme.colors.secondaryText
                  }
                  onValueChange={setPushNotifications}
                  value={pushNotifications}
                />
              </View>

              <View style={styles.settingsRow}>
                <View style={styles.settingsTextContainer}>
                  <Text
                    style={[styles.settingsLabel, { color: theme.colors.text }]}
                  >
                    Session Reminders
                  </Text>
                  <Text
                    style={[
                      styles.settingsDescription,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    Receive reminders before scheduled sessions
                  </Text>
                </View>
                <Switch
                  trackColor={{
                    false: theme.colors.border,
                    true: `${theme.colors.primary}80`,
                  }}
                  thumbColor={
                    sessionReminders
                      ? theme.colors.primary
                      : theme.colors.secondaryText
                  }
                  onValueChange={setSessionReminders}
                  value={sessionReminders}
                />
              </View>

              <Text
                style={[
                  styles.settingsSectionTitle,
                  { color: theme.colors.text },
                ]}
              >
                Appearance
              </Text>

              <View style={styles.settingsRow}>
                <View style={styles.settingsTextContainer}>
                  <Text
                    style={[styles.settingsLabel, { color: theme.colors.text }]}
                  >
                    Dark Mode
                  </Text>
                  <Text
                    style={[
                      styles.settingsDescription,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    Enable dark mode theme
                  </Text>
                </View>
                <Switch
                  trackColor={{
                    false: theme.colors.border,
                    true: `${theme.colors.primary}80`,
                  }}
                  thumbColor={
                    darkModeEnabled
                      ? theme.colors.primary
                      : theme.colors.secondaryText
                  }
                  onValueChange={setDarkModeEnabled}
                  value={darkModeEnabled}
                />
              </View>

              <Text
                style={[
                  styles.settingsSectionTitle,
                  { color: theme.colors.text },
                ]}
              >
                Account
              </Text>

              <TouchableOpacity
                style={[
                  styles.settingsButton,
                  { backgroundColor: theme.colors.card },
                ]}
                onPress={() => navigation.navigate("ChangePassword")}
              >
                <Text
                  style={[
                    styles.settingsButtonText,
                    { color: theme.colors.text },
                  ]}
                >
                  Change Password
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.settingsButton,
                  { backgroundColor: theme.colors.card },
                ]}
                onPress={() => navigation.navigate("AccountSettings")}
              >
                <Text
                  style={[
                    styles.settingsButtonText,
                    { color: theme.colors.text },
                  ]}
                >
                  Account Settings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteAccountButton,
                  { backgroundColor: `${theme.colors.notification}10` },
                ]}
                onPress={() => console.log("Delete account")}
              >
                <Text style={{ color: theme.colors.notification }}>
                  Delete Account
                </Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.colors.card },
                  ]}
                  onPress={() => setShowSettingsModal(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: theme.colors.text },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => {
                    // Save settings logic
                    setShowSettingsModal(false);
                  }}
                >
                  <Text style={styles.saveButtonText}>Save Settings</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default TutorProfileScreen;
