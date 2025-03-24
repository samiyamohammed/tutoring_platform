import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  StatusBar,
  Animated,
  Dimensions,
  DrawerLayoutAndroid,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/TutorScreensStyles/TutorHomeScreenStyle";

const { width, height } = Dimensions.get("window");

// Mock data
const scheduledSessions = [
  {
    id: 1,
    title: "Programming Concepts",
    student: "Amina Kebede",
    time: "10:00 AM - 11:30 AM",
    date: "Today",
    image: "https://picsum.photos/id/64/200",
  },
  {
    id: 2,
    title: "Math Problem Solving",
    student: "Daniel Tesfaye",
    time: "2:00 PM - 3:30 PM",
    date: "Tomorrow",
    image: "https://picsum.photos/id/65/200",
  },
];

const pendingRequests = [
  {
    id: 1,
    title: "One-on-one Python Session",
    student: "Sara Abebe",
    time: "3:00 PM - 4:00 PM",
    date: "20 Jan, 2025",
    image: "https://picsum.photos/id/66/200",
  },
  {
    id: 2,
    title: "Help with Calculus Assignment",
    student: "Yonas Melaku",
    time: "5:00 PM - 6:30 PM",
    date: "22 Jan, 2025",
    image: "https://picsum.photos/id/67/200",
  },
];

const assignments = [
  {
    id: 1,
    title: "Programming Assignment #3",
    course: "Introduction to Programming",
    due: "25 Jan, 2025",
    submissions: 18,
    totalStudents: 28,
  },
  {
    id: 2,
    title: "Math Problem Set #5",
    course: "Advanced Mathematics",
    due: "27 Jan, 2025",
    submissions: 10,
    totalStudents: 15,
  },
];

const TutorHomeScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const { signOut } = useAuth();
  const drawerRef = useRef(null);

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

  // Chart data
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => theme.colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.colors.primary,
    labelColor: (opacity = 1) => theme.colors.secondaryText,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: theme.colors.secondary,
    },
  };

  // Check for dark mode
  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.documentElement.classList.add("dark");
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        if (event.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      });
  }, []);

  // Side Menu Drawer Navigation
  const renderSideMenu = () => (
    <View
      style={[
        styles.sideMenuContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.sideMenuHeader}>
        <Image
          source={{ uri: "https://picsum.photos/id/91/200" }}
          style={styles.sideMenuProfileImage}
        />
        <Text style={[styles.sideMenuName, { color: theme.colors.text }]}>
          Michael Engida
        </Text>
        <Text
          style={[styles.sideMenuRole, { color: theme.colors.secondaryText }]}
        >
          Computer Science Tutor
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${theme.colors.success}20` },
          ]}
        >
          <Text style={{ color: theme.colors.success, fontSize: 12 }}>
            Verified Tutor
          </Text>
        </View>
      </View>

      <ScrollView style={styles.sideMenuContent}>
        <TouchableOpacity
          style={[
            styles.sideMenuItem,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => {
            drawerRef.current?.closeDrawer();
            navigation.navigate("Home");
          }}
        >
          <Icon name="view-dashboard" size={22} color="#FFFFFF" />
          <Text style={styles.sideMenuActiveItemText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideMenuItem}
          onPress={() => {
            drawerRef.current?.closeDrawer();
            navigation.navigate("Courses");
          }}
        >
          <Icon name="book-open-variant" size={22} color={theme.colors.text} />
          <Text style={[styles.sideMenuItemText, { color: theme.colors.text }]}>
            My Courses
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideMenuItem}
          onPress={() => {
            drawerRef.current?.closeDrawer();
            navigation.navigate("Students");
          }}
        >
          <Icon name="account-group" size={22} color={theme.colors.text} />
          <Text style={[styles.sideMenuItemText, { color: theme.colors.text }]}>
            My Students
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideMenuItem}
          onPress={() => {
            drawerRef.current?.closeDrawer();
            navigation.navigate("Schedule");
          }}
        >
          <Icon name="calendar" size={22} color={theme.colors.text} />
          <Text style={[styles.sideMenuItemText, { color: theme.colors.text }]}>
            My Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideMenuItem}
          onPress={() => {
            drawerRef.current?.closeDrawer();
            navigation.navigate("Chat");
          }}
        >
          <Icon name="message" size={22} color={theme.colors.text} />
          <Text style={[styles.sideMenuItemText, { color: theme.colors.text }]}>
            Messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideMenuItem}
          onPress={() => {
            drawerRef.current?.closeDrawer();
            navigation.navigate("Profile");
          }}
        >
          <Icon name="account" size={22} color={theme.colors.text} />
          <Text style={[styles.sideMenuItemText, { color: theme.colors.text }]}>
            My Profile
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.sideMenuDivider,
            { backgroundColor: theme.colors.border },
          ]}
        />

        <TouchableOpacity
          style={styles.sideMenuItem}
          onPress={() => {
            drawerRef.current?.closeDrawer();
            // Navigate to settings
          }}
        >
          <Icon name="cog" size={22} color={theme.colors.text} />
          <Text style={[styles.sideMenuItemText, { color: theme.colors.text }]}>
            Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideMenuItem}
          onPress={() => {
            drawerRef.current?.closeDrawer();
            // Navigate to help
          }}
        >
          <Icon name="help-circle" size={22} color={theme.colors.text} />
          <Text style={[styles.sideMenuItemText, { color: theme.colors.text }]}>
            Help & Support
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutMenuItem, { backgroundColor: "#FFF0F0" }]}
          onPress={() => {
            drawerRef.current?.closeDrawer();
            signOut();
          }}
        >
          <Icon name="logout" size={22} color="#FF4B4B" />
          <Text style={styles.logoutMenuItemText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Main content
  const renderMainContent = () => (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => drawerRef.current?.openDrawer()}
            >
              <Icon name="menu" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>Michael Engida</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate("Profile")}
            >
              <Image
                source={{ uri: "https://picsum.photos/id/91/200" }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <View
            style={[
              styles.statIconCircle,
              { backgroundColor: "rgba(93, 92, 222, 0.1)" },
            ]}
          >
            <Icon
              name="book-open-variant"
              size={24}
              color={theme.colors.primary}
            />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            3
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.secondaryText }]}
          >
            Total Courses
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <View
            style={[
              styles.statIconCircle,
              { backgroundColor: "rgba(76, 175, 80, 0.1)" },
            ]}
          >
            <Icon name="account-group" size={24} color={theme.colors.success} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            65
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.secondaryText }]}
          >
            Total Students
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <View
            style={[
              styles.statIconCircle,
              { backgroundColor: "rgba(255, 193, 7, 0.1)" },
            ]}
          >
            <Icon name="clock-outline" size={24} color={theme.colors.warning} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            12
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.secondaryText }]}
          >
            Pending Sessions
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Student Engagement
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              Details
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={[styles.chartCard, { backgroundColor: theme.colors.card }]}
        >
          <LineChart
            data={chartData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Today's Sessions
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        {scheduledSessions.map((session) => (
          <View
            key={session.id}
            style={[styles.sessionCard, { backgroundColor: theme.colors.card }]}
          >
            <Image
              source={{ uri: session.image }}
              style={styles.sessionStudentImage}
            />
            <View style={styles.sessionInfo}>
              <Text style={[styles.sessionTitle, { color: theme.colors.text }]}>
                {session.title}
              </Text>
              <Text
                style={[
                  styles.sessionStudent,
                  { color: theme.colors.secondaryText },
                ]}
              >
                Student: {session.student}
              </Text>
              <View style={styles.sessionTimeRow}>
                <View style={styles.sessionTimeItem}>
                  <Icon
                    name="calendar"
                    size={14}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.sessionTimeText,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    {session.date}
                  </Text>
                </View>
                <View style={styles.sessionTimeItem}>
                  <Icon
                    name="clock-outline"
                    size={14}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.sessionTimeText,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    {session.time}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.startSessionButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Icon name="video" size={18} color="#FFFFFF" />
              <Text style={styles.startSessionText}>Start</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Pending Requests
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        {pendingRequests.map((request) => (
          <View
            key={request.id}
            style={[styles.requestCard, { backgroundColor: theme.colors.card }]}
          >
            <Image
              source={{ uri: request.image }}
              style={styles.requestStudentImage}
            />
            <View style={styles.requestInfo}>
              <Text style={[styles.requestTitle, { color: theme.colors.text }]}>
                {request.title}
              </Text>
              <Text
                style={[
                  styles.requestStudent,
                  { color: theme.colors.secondaryText },
                ]}
              >
                Student: {request.student}
              </Text>
              <View style={styles.requestTimeRow}>
                <View style={styles.requestTimeItem}>
                  <Icon
                    name="calendar"
                    size={14}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.requestTimeText,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    {request.date}
                  </Text>
                </View>
                <View style={styles.requestTimeItem}>
                  <Icon
                    name="clock-outline"
                    size={14}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.requestTimeText,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    {request.time}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.requestActions}>
              <TouchableOpacity
                style={[
                  styles.acceptButton,
                  { backgroundColor: theme.colors.success },
                ]}
              >
                <Icon name="check" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.rejectButton,
                  { backgroundColor: theme.colors.notification },
                ]}
              >
                <Icon name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Active Assignments
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        {assignments.map((assignment) => (
          <View
            key={assignment.id}
            style={[
              styles.assignmentCard,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={styles.assignmentInfo}>
              <Text
                style={[styles.assignmentTitle, { color: theme.colors.text }]}
              >
                {assignment.title}
              </Text>
              <Text
                style={[
                  styles.assignmentCourse,
                  { color: theme.colors.secondaryText },
                ]}
              >
                Course: {assignment.course}
              </Text>
              <View style={styles.assignmentMetaRow}>
                <View style={styles.assignmentMetaItem}>
                  <Icon
                    name="calendar-clock"
                    size={14}
                    color={theme.colors.warning}
                  />
                  <Text
                    style={[
                      styles.assignmentMetaText,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    Due: {assignment.due}
                  </Text>
                </View>
                <View style={styles.assignmentMetaItem}>
                  <Icon
                    name="file-document-outline"
                    size={14}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.assignmentMetaText,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    {assignment.submissions}/{assignment.totalStudents}{" "}
                    submitted
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.reviewButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.reviewButtonText}>Review</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </ScrollView>
  );

  // Use DrawerLayout for Android and a custom implementation for iOS
  if (Platform.OS === "android") {
    return (
      <DrawerLayoutAndroid
        ref={drawerRef}
        drawerWidth={width * 0.8}
        drawerPosition="left"
        renderNavigationView={renderSideMenu}
      >
        {renderMainContent()}
      </DrawerLayoutAndroid>
    );
  }

  // iOS and web implementation using Animated View
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: drawerOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [drawerOpen, slideAnim]);

  // Mocked functionality for iOS drawer
  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  // Assign these methods to drawerRef for consistent usage
  drawerRef.current = {
    openDrawer,
    closeDrawer,
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.8, 0],
  });

  return (
    <View style={{ flex: 1 }}>
      {renderMainContent()}

      {/* Overlay when drawer is open */}
      {drawerOpen && (
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={closeDrawer}
        />
      )}

      {/* Side Menu for iOS */}
      <Animated.View
        style={[
          styles.iosDrawer,
          {
            transform: [{ translateX }],
            width: width * 0.8,
          },
        ]}
      >
        {renderSideMenu()}
      </Animated.View>
    </View>
  );
};

export default TutorHomeScreen;
