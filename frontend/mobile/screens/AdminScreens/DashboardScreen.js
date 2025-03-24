// AdminDashboardScreen.js
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "../../styles/AdminScreensStyles/AdminDashboardScreenStyles";

const AdminDashboardScreen = ({ navigation }) => {
  // Sample stats data
  const stats = [
    {
      id: "1",
      title: "Total Users",
      count: "1,245",
      icon: "people",
      color: "#4A6FFF",
    },
    {
      id: "2",
      title: "Active Courses",
      count: "32",
      icon: "menu-book",
      color: "#FF6B6B",
    },
    {
      id: "3",
      title: "Enrollments",
      count: "3,721",
      icon: "school",
      color: "#00C48C",
    },
    {
      id: "4",
      title: "Revenue",
      count: "$12,400",
      icon: "attach-money",
      color: "#FFB300",
    },
  ];

  // Sample recent activities
  const recentActivities = [
    {
      id: "1",
      user: "John Doe",
      activity: 'enrolled in "Advanced Mathematics"',
      time: "2 hours ago",
      avatar: null,
    },
    {
      id: "2",
      user: "Sarah Wilson",
      activity: 'completed "Introduction to Physics"',
      time: "5 hours ago",
      avatar: null,
    },
    {
      id: "3",
      user: "Robert Johnson",
      activity: "joined as a new tutor",
      time: "1 day ago",
      avatar: null,
    },
    {
      id: "4",
      user: "Emily Davis",
      activity: "submitted an assignment",
      time: "2 days ago",
      avatar: null,
    },
  ];

  // Render stat card
  const renderStatCard = ({ item }) => (
    <TouchableOpacity style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={24} color="#FFF" />
      </View>
      <Text style={styles.statCount}>{item.count}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  // Render activity item
  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityAvatar}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{item.user.charAt(0)}</Text>
        )}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>
          <Text style={styles.activityUser}>{item.user}</Text> {item.activity}
        </Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => {
            /* Handle notifications */
          }}
        >
          <Icon name="notifications" size={24} color="#00434C" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.statsContainer}>
          <FlatList
            data={stats}
            renderItem={renderStatCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.statsRow}
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate("Users")}
            >
              <Icon name="people" size={24} color="#00434C" />
              <Text style={styles.quickActionText}>Manage Users</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate("Courses")}
            >
              <Icon name="menu-book" size={24} color="#00434C" />
              <Text style={styles.quickActionText}>Manage Courses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                /* Handle action */
              }}
            >
              <Icon name="add-circle" size={24} color="#00434C" />
              <Text style={styles.quickActionText}>New Course</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                /* Handle action */
              }}
            >
              <Icon name="assessment" size={24} color="#00434C" />
              <Text style={styles.quickActionText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentActivities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminDashboardScreen;
