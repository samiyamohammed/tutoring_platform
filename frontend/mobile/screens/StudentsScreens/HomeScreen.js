import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { CourseList } from "../../models/courselistmodel";
import { TutorList } from "../../models/tutormodel";
import { styles } from "../../styles/StudentsScreensStyles/HomeScreenStyle";

const StudentHomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigation = useNavigation();
  const categories = ["Graphic Design", "User Interface", "User Experience"];

  const filteredCourses = CourseList.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tutorList = new TutorList();
  const tutors = tutorList.getTutors();

  return (
    <FlatList
      data={filteredCourses}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          {/* Header */}
          <View style={styles.header}>
            <Icon name="bars" size={24} color="#004d40" />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                Welcome <Text style={styles.userName}>Sidra</Text>
              </Text>
            </View>
            <Icon name="bell" size={22} color="#004d40" />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={18} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses..."
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Icon name="filter" size={16} color="#004d40" />
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Continue Learning Section */}
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <FlatList
            data={CourseList.slice(0, 1)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.courseCard}>
                <Image source={item.image} style={styles.courseImage} />
                <View style={styles.courseDetails}>
                  <Text style={styles.courseTitle}>{item.title}</Text>
                  <Text style={styles.collegeName}>{item.college}</Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${item.progress}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}
          />
          {CourseList.length > 1 && (
            <TouchableOpacity
              style={[
                styles.seeAllButton,
                { alignSelf: "flex-end", marginRight: 15 },
              ]}
              onPress={() => navigation.navigate("ContinueLearning")}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          )}

          {/* Categories - Filter Chips */}
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.selectedCategoryChip, // Apply green color when selected
                ]}
                onPress={() =>
                  setSelectedCategory(
                    category === selectedCategory ? null : category
                  )
                } // Toggle selection
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category &&
                      styles.selectedCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Course Suggestions Section */}
          <Text style={styles.sectionTitle}>Suggested Courses</Text>
          <FlatList
            data={filteredCourses}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.courseCard, styles.suggestedCourseCard]}>
                <Image source={item.image} style={styles.courseImage} />
                <View style={styles.courseDetails}>
                  <Text style={styles.courseTitle}>{item.title}</Text>
                  <Text style={styles.collegeName}>{item.college}</Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Tutors Section */}
          <View style={styles.tutorsContainer}>
            <Text style={styles.sectionTitle}>Tutors</Text>
            <FlatList
              data={tutors}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={[styles.tutorCard, styles.suggestedCourseCard]}>
                  <Image source={item.profileImage} style={styles.tutorImage} />
                  <Text style={styles.tutorName}>{item.name}</Text>
                  <Text style={styles.tutorSubject}>{item.experience}</Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </>
      }
    />
  );
};

export default StudentHomeScreen;
