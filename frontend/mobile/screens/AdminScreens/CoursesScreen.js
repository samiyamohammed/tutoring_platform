// CoursesScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "../../styles/AdminScreensStyles/AdminCourseScreenStyles";

const CoursesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Sample course data
  const courses = [
    {
      id: "1",
      title: "Introduction to Mathematics",
      instructor: "Sarah Wilson",
      category: "Mathematics",
      studentsCount: 148,
      rating: 4.7,
      status: "Active",
      image: null,
    },
    {
      id: "2",
      title: "Advanced Physics",
      instructor: "Robert Johnson",
      category: "Physics",
      studentsCount: 92,
      rating: 4.5,
      status: "Active",
      image: null,
    },
    {
      id: "3",
      title: "Introduction to Computer Science",
      instructor: "Michael Brown",
      category: "Computer Science",
      studentsCount: 210,
      rating: 4.9,
      status: "Active",
      image: null,
    },
    {
      id: "4",
      title: "Biology 101",
      instructor: "Jessica Smith",
      category: "Biology",
      studentsCount: 87,
      rating: 4.3,
      status: "Inactive",
      image: null,
    },
    {
      id: "5",
      title: "History of Art",
      instructor: "David Clark",
      category: "Arts",
      studentsCount: 65,
      rating: 4.6,
      status: "Active",
      image: null,
    },
    {
      id: "6",
      title: "Creative Writing",
      instructor: "Emma Watson",
      category: "Literature",
      studentsCount: 110,
      rating: 4.8,
      status: "Active",
      image: null,
    },
  ];

  // Filter buttons
  const filters = [
    "All",
    "Active",
    "Inactive",
    "Mathematics",
    "Physics",
    "Computer Science",
    "Biology",
    "Arts",
    "Literature",
  ];

  // Filter courses based on search query and selected filter
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "All") {
      return matchesSearch;
    } else if (selectedFilter === "Active") {
      return matchesSearch && course.status === "Active";
    } else if (selectedFilter === "Inactive") {
      return matchesSearch && course.status === "Inactive";
    } else {
      return matchesSearch && course.category === selectedFilter;
    }
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

  // Render course item
  const renderCourseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => {
        /* Navigate to course details */
      }}
    >
      <View style={styles.courseImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.courseImage} />
        ) : (
          <View style={styles.coursePlaceholder}>
            <Icon name="menu-book" size={30} color="#FFF" />
          </View>
        )}
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
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.courseInstructor}>by {item.instructor}</Text>

        <View style={styles.courseDetails}>
          <View style={styles.courseDetail}>
            <Icon name="category" size={16} color="#8A9CAA" />
            <Text style={styles.courseDetailText}>{item.category}</Text>
          </View>
          <View style={styles.courseDetail}>
            <Icon name="people" size={16} color="#8A9CAA" />
            <Text style={styles.courseDetailText}>
              {item.studentsCount} students
            </Text>
          </View>
          <View style={styles.courseDetail}>
            <Icon name="star" size={16} color="#FFB300" />
            <Text style={styles.courseDetailText}>{item.rating}</Text>
          </View>
        </View>
      </View>
      <View style={styles.courseActions}>
        <TouchableOpacity style={styles.courseAction}>
          <Icon name="edit" size={20} color="#00434C" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.courseAction}>
          <Icon name="delete" size={20} color="#FF6B6B" />
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Manage Courses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            /* Open add course form */
          }}
        >
          <Icon name="add" size={24} color="#00434C" />
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
          placeholder="Search courses..."
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
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.coursesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={60} color="#8A9CAA" />
            <Text style={styles.emptyText}>No courses found</Text>
          </View>
        }
      />
    </View>
  );
};

export default CoursesScreen;
