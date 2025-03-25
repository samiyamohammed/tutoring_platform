// UsersScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "../../styles/AdminScreensStyles/AdminUsersScreenStyles";

const UsersScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Sample user data
  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Student",
      status: "Active",
      joinDate: "12 Jan 2023",
      avatar: null,
    },
    {
      id: "2",
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      role: "Tutor",
      status: "Active",
      joinDate: "03 Feb 2023",
      avatar: null,
    },
    {
      id: "3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      role: "Tutor",
      status: "Active",
      joinDate: "15 Mar 2023",
      avatar: null,
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Student",
      status: "Inactive",
      joinDate: "20 Apr 2023",
      avatar: null,
    },
    {
      id: "5",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      role: "Student",
      status: "Active",
      joinDate: "05 May 2023",
      avatar: null,
    },
    {
      id: "6",
      name: "Jessica Smith",
      email: "jessica.smith@example.com",
      role: "Student",
      status: "Active",
      joinDate: "18 Jun 2023",
      avatar: null,
    },
  ];

  // Filter buttons
  const filters = ["All", "Students", "Tutors", "Active", "Inactive"];

  // Filter users based on search query and selected filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "All") {
      return matchesSearch;
    } else if (selectedFilter === "Students") {
      return matchesSearch && user.role === "Student";
    } else if (selectedFilter === "Tutors") {
      return matchesSearch && user.role === "Tutor";
    } else if (selectedFilter === "Active") {
      return matchesSearch && user.status === "Active";
    } else if (selectedFilter === "Inactive") {
      return matchesSearch && user.status === "Inactive";
    }
    return false;
  });

  // Render filter button
  const renderFilterButton = (filter) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {filter}
      </Text>
    </TouchableOpacity>
  );

  // Render user item
  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => {
        /* Navigate to user details */
      }}
    >
      <View style={styles.userCardHeader}>
        <View style={styles.userAvatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
          ) : (
            <Text style={styles.userAvatarText}>{item.name.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#8A9CAA" />
      </View>
      <View style={styles.userCardFooter}>
        <View style={styles.userDetail}>
          <Text style={styles.userDetailLabel}>Role</Text>
          <Text style={styles.userDetailValue}>{item.role}</Text>
        </View>
        <View style={styles.userDetail}>
          <Text style={styles.userDetailLabel}>Joined</Text>
          <Text style={styles.userDetailValue}>{item.joinDate}</Text>
        </View>
        <View style={styles.userDetail}>
          <Text style={styles.userDetailLabel}>Status</Text>
          <View
            style={[
              styles.statusBadge,
              item.status === "Active"
                ? styles.statusActive
                : styles.statusInactive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "Active"
                  ? styles.statusTextActive
                  : styles.statusTextInactive,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Manage Users</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            /* Open add user form */
          }}
        >
          <Icon name="person-add" size={24} color="#00434C" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color="#8A9CAA"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== "" && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Icon name="close" size={20} color="#8A9CAA" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {filters.map((filter) => renderFilterButton(filter))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.usersList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={60} color="#8A9CAA" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
    </View>
  );
};

import { ScrollView } from "react-native";

export default UsersScreen;
