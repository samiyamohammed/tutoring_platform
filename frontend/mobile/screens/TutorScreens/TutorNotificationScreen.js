import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  StatusBar,
  Switch,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import styles from "../../styles/TutorScreensStyles/TutorNotificationScreenStyle";

// Mock data
const notifications = [
  {
    id: 1,
    title: "New Tutoring Request",
    message:
      "Sara Abebe has requested a one-on-one Python tutoring session for tomorrow at 3:00 PM.",
    time: "2 hours ago",
    type: "request",
    read: false,
  },
  {
    id: 2,
    title: "Assignment Submitted",
    message: "Amina Kebede has submitted Programming Assignment #3.",
    time: "Today, 10:45 AM",
    type: "assignment",
    read: false,
  },
  {
    id: 3,
    title: "Session Reminder",
    message:
      "Reminder: You have a Math tutoring session with Daniel Tesfaye today at 2:00 PM.",
    time: "Today, 8:30 AM",
    type: "reminder",
    read: true,
  },
  {
    id: 4,
    title: "Student Rating",
    message:
      "Yonas Melaku has rated your Business Communication course 5 stars!",
    time: "Yesterday",
    type: "rating",
    read: true,
  },
  {
    id: 5,
    title: "Course Approval",
    message:
      'Your course "Introduction to Programming" has been approved and is now live.',
    time: "2 days ago",
    type: "course",
    read: true,
  },
];

const TutorNotificationsScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

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

  // Function to get notification icon and color based on type
  const getNotificationTypeInfo = (type) => {
    switch (type) {
      case "request":
        return { icon: "calendar-clock", color: theme.colors.primary };
      case "assignment":
        return { icon: "file-document-outline", color: theme.colors.success };
      case "reminder":
        return { icon: "alarm", color: theme.colors.warning };
      case "rating":
        return { icon: "star", color: "#FFD700" };
      case "course":
        return { icon: "book-open-variant", color: theme.colors.primary };
      default:
        return { icon: "bell-outline", color: theme.colors.primary };
    }
  };

  // Filter notifications based on selected filter and unread toggle
  const filteredNotifications = notifications.filter((notification) => {
    if (showUnreadOnly && notification.read) {
      return false;
    }

    if (notificationFilter === "all") {
      return true;
    }

    return notification.type === notificationFilter;
  });

  // Mark a notification as read
  const markAsRead = (id) => {
    // In a real app, you would update this in your backend
    // For this example, we're just logging it
    console.log(`Marking notification ${id} as read`);
  };

  // Handle notification action based on type
  const handleNotificationAction = (notification) => {
    // Mark notification as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to appropriate screen based on notification type
    switch (notification.type) {
      case "request":
        navigation.navigate("Schedule");
        break;
      case "assignment":
        navigation.navigate("Courses");
        break;
      case "reminder":
        navigation.navigate("Schedule");
        break;
      case "rating":
        navigation.navigate("Courses");
        break;
      case "course":
        navigation.navigate("Courses");
        break;
      default:
        // Default action
        break;
    }
  };

  const renderNotificationItem = ({ item }) => {
    const typeInfo = getNotificationTypeInfo(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: item.read
              ? theme.colors.background
              : `${theme.colors.primary}10`,
          },
        ]}
        onPress={() => handleNotificationAction(item)}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${typeInfo.color}20` },
          ]}
        >
          <Icon name={typeInfo.icon} size={24} color={typeInfo.color} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[styles.notificationTitle, { color: theme.colors.text }]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.notificationTime,
                { color: theme.colors.secondaryText },
              ]}
            >
              {item.time}
            </Text>
          </View>
          <Text
            style={[
              styles.notificationMessage,
              { color: theme.colors.secondaryText },
            ]}
          >
            {item.message}
          </Text>
          <View style={styles.notificationActions}>
            {item.type === "request" && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.success },
                  ]}
                  onPress={() => console.log("Accept request")}
                >
                  <Icon name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.notification },
                  ]}
                  onPress={() => console.log("Decline request")}
                >
                  <Icon name="close" size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.type === "assignment" && (
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => console.log("View assignment")}
              >
                <Text style={styles.viewButtonText}>View Submission</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {!item.read && (
          <View
            style={[
              styles.unreadIndicator,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Notifications
        </Text>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.colors.card }]}
          onPress={() => console.log("Mark all as read")}
        >
          <Icon name="check-all" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              notificationFilter === "all"
                ? { backgroundColor: theme.colors.primary }
                : { backgroundColor: theme.colors.card },
            ]}
            onPress={() => setNotificationFilter("all")}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color:
                    notificationFilter === "all"
                      ? "#FFFFFF"
                      : theme.colors.text,
                },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              notificationFilter === "request"
                ? { backgroundColor: theme.colors.primary }
                : { backgroundColor: theme.colors.card },
            ]}
            onPress={() => setNotificationFilter("request")}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color:
                    notificationFilter === "request"
                      ? "#FFFFFF"
                      : theme.colors.text,
                },
              ]}
            >
              Requests
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              notificationFilter === "assignment"
                ? { backgroundColor: theme.colors.primary }
                : { backgroundColor: theme.colors.card },
            ]}
            onPress={() => setNotificationFilter("assignment")}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color:
                    notificationFilter === "assignment"
                      ? "#FFFFFF"
                      : theme.colors.text,
                },
              ]}
            >
              Assignments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              notificationFilter === "reminder"
                ? { backgroundColor: theme.colors.primary }
                : { backgroundColor: theme.colors.card },
            ]}
            onPress={() => setNotificationFilter("reminder")}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color:
                    notificationFilter === "reminder"
                      ? "#FFFFFF"
                      : theme.colors.text,
                },
              ]}
            >
              Reminders
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
            Unread only
          </Text>
          <Switch
            trackColor={{
              false: theme.colors.border,
              true: `${theme.colors.primary}80`,
            }}
            thumbColor={
              showUnreadOnly ? theme.colors.primary : theme.colors.secondaryText
            }
            onValueChange={setShowUnreadOnly}
            value={showUnreadOnly}
          />
        </View>
      </View>

      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="bell-off-outline" size={80} color={theme.colors.border} />
          <Text
            style={[styles.emptyText, { color: theme.colors.secondaryText }]}
          >
            No notifications to display
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.notificationsList}
        />
      )}
    </View>
  );
};

export default TutorNotificationsScreen;
