import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  StatusBar,
  TextInput,
  Switch,
  Modal,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import styles from "../../styles/TutorScreensStyles/TutorCourseScreenStyle";

// Mock data
const myCourses = [
  {
    id: 1,
    title: "Introduction to Programming",
    students: 28,
    rating: 4.8,
    image: "https://picsum.photos/id/0/200",
  },
  {
    id: 2,
    title: "Advanced Mathematics",
    students: 15,
    rating: 4.5,
    image: "https://picsum.photos/id/1/200",
  },
  {
    id: 3,
    title: "Business Communication",
    students: 22,
    rating: 4.7,
    image: "https://picsum.photos/id/2/200",
  },
];

const TutorCoursesScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("All");

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

  const filteredCourses =
    currentFilter === "All"
      ? myCourses
      : currentFilter === "Popular"
      ? myCourses.filter((course) => course.students > 20)
      : currentFilter === "Newest"
      ? myCourses.slice().sort((a, b) => b.id - a.id)
      : myCourses;

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
          My Courses
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: theme.colors.card },
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Icon
              name="filter-variant"
              size={22}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.searchButton,
              { backgroundColor: theme.colors.card },
            ]}
            onPress={() => {}}
          >
            <Icon name="magnify" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterChips}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["All", "Popular", "Newest"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                currentFilter === filter
                  ? { backgroundColor: theme.colors.primary }
                  : { backgroundColor: theme.colors.card },
              ]}
              onPress={() => setCurrentFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      currentFilter === filter ? "#FFFFFF" : theme.colors.text,
                  },
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.courseCard, { backgroundColor: theme.colors.card }]}
            onPress={() =>
              navigation.navigate("CourseDetail", { courseId: item.id })
            }
          >
            <Image source={{ uri: item.image }} style={styles.courseImage} />
            <View style={styles.courseInfo}>
              <Text style={[styles.courseTitle, { color: theme.colors.text }]}>
                {item.title}
              </Text>
              <View style={styles.courseStats}>
                <View style={styles.statItem}>
                  <Icon
                    name="account-group"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.statText,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    {item.students} students
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text
                    style={[
                      styles.statText,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    {item.rating}
                  </Text>
                </View>
              </View>
              <View style={styles.courseActions}>
                <TouchableOpacity
                  style={[
                    styles.courseButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() =>
                    navigation.navigate("EditCourse", { courseId: item.id })
                  }
                >
                  <Icon name="pencil" size={16} color="#FFFFFF" />
                  <Text style={styles.courseButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.courseButton,
                    {
                      backgroundColor: "transparent",
                      borderWidth: 1,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() =>
                    navigation.navigate("CourseDetail", { courseId: item.id })
                  }
                >
                  <Icon name="eye" size={16} color={theme.colors.primary} />
                  <Text
                    style={[
                      styles.courseButtonText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    View
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={[
              styles.createCourseCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setShowCreateModal(true)}
          >
            <View
              style={[
                styles.createCourseIcon,
                { backgroundColor: `${theme.colors.primary}20` },
              ]}
            >
              <Icon name="plus" size={30} color={theme.colors.primary} />
            </View>
            <Text
              style={[styles.createCourseText, { color: theme.colors.text }]}
            >
              Create New Course
            </Text>
            <Text
              style={[
                styles.createCourseSubtext,
                { color: theme.colors.secondaryText },
              ]}
            >
              Add a new course to your teaching portfolio
            </Text>
          </TouchableOpacity>
        }
        contentContainerStyle={styles.coursesList}
      />

      {/* Create Course Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCreateModal}
        onRequestClose={() => setShowCreateModal(false)}
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
                Create New Course
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Course Title
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Enter course title"
                  placeholderTextColor={theme.colors.secondaryText}
                  value={courseTitle}
                  onChangeText={setCourseTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Description
                </Text>
                <TextInput
                  style={[
                    styles.textAreaInput,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Enter course description"
                  placeholderTextColor={theme.colors.secondaryText}
                  multiline={true}
                  numberOfLines={4}
                  value={courseDescription}
                  onChangeText={setCourseDescription}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Category
                </Text>
                <TouchableOpacity
                  style={[
                    styles.pickerContainer,
                    { backgroundColor: theme.colors.card },
                  ]}
                >
                  <Text style={{ color: theme.colors.secondaryText }}>
                    Select category
                  </Text>
                  <Icon
                    name="chevron-down"
                    size={20}
                    color={theme.colors.secondaryText}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Course Image
                </Text>
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Icon
                    name="cloud-upload-outline"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[styles.uploadText, { color: theme.colors.text }]}
                  >
                    Upload Image
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formRow}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Is this course private?
                </Text>
                <Switch
                  trackColor={{
                    false: theme.colors.border,
                    true: `${theme.colors.primary}80`,
                  }}
                  thumbColor={
                    isPrivate
                      ? theme.colors.primary
                      : theme.colors.secondaryText
                  }
                  onValueChange={setIsPrivate}
                  value={isPrivate}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.colors.card },
                  ]}
                  onPress={() => setShowCreateModal(false)}
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
                    // Handle create course logic
                    setShowCreateModal(false);
                  }}
                >
                  <Text style={styles.modalButtonTextWhite}>Create Course</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View
            style={[
              styles.filterModalContent,
              { backgroundColor: theme.colors.background },
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <Text
              style={[styles.filterModalTitle, { color: theme.colors.text }]}
            >
              Filter Courses
            </Text>

            <TouchableOpacity
              style={[
                styles.filterOption,
                currentFilter === "All" && {
                  backgroundColor: `${theme.colors.primary}20`,
                },
              ]}
              onPress={() => {
                setCurrentFilter("All");
                setShowFilterModal(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  {
                    color:
                      currentFilter === "All"
                        ? theme.colors.primary
                        : theme.colors.text,
                  },
                ]}
              >
                All Courses
              </Text>
              {currentFilter === "All" && (
                <Icon name="check" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                currentFilter === "Popular" && {
                  backgroundColor: `${theme.colors.primary}20`,
                },
              ]}
              onPress={() => {
                setCurrentFilter("Popular");
                setShowFilterModal(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  {
                    color:
                      currentFilter === "Popular"
                        ? theme.colors.primary
                        : theme.colors.text,
                  },
                ]}
              >
                Popular Courses
              </Text>
              {currentFilter === "Popular" && (
                <Icon name="check" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                currentFilter === "Newest" && {
                  backgroundColor: `${theme.colors.primary}20`,
                },
              ]}
              onPress={() => {
                setCurrentFilter("Newest");
                setShowFilterModal(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  {
                    color:
                      currentFilter === "Newest"
                        ? theme.colors.primary
                        : theme.colors.text,
                  },
                ]}
              >
                Newest Courses
              </Text>
              {currentFilter === "Newest" && (
                <Icon name="check" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default TutorCoursesScreen;
