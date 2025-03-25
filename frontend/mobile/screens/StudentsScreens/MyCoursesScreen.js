import React, { useState } from "react";
import { FlatList } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
//import { filters, courses } from "../models/courselistmodel";
import {
  Container,
  FilterContainer,
  FilterButton,
  FilterText,
  SearchContainer,
  SearchInput,
  CourseCard,
  CourseImage,
  CourseDetails,
  CourseTitle,
  CollegeName,
  RatingContainer,
  RatingText,
  EnrollButton,
  EnrollText,
  StudentsContainer,
  StudentsText,
} from "../../styles/StudentsScreensStyles/MyCoursesScreenStyle";
import  {CourseList,filters}  from "../../models/courselistmodel";

const StudentMyCoursesScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState("Saved Courses");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter courses based on selected status first
  const statusFilteredCourses = CourseList.filter(
    (course) => course.coursestatus === selectedFilter
  );
  // Search filtering
  const finalFilteredCourses = statusFilteredCourses.filter((course) =>
    course.title.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  return (
    <Container>
      {/* Filters */}
      <FilterContainer>
        {filters.map((filter) => (
          <FilterButton
            key={filter}
            selected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
          >
            <FilterText selected={selectedFilter === filter}>
              {filter}
            </FilterText>
          </FilterButton>
        ))}
      </FilterContainer>

      {/* Search Bar */}
      <SearchContainer>
        <Icon name="search" size={18} color="#888" />
        <SearchInput
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </SearchContainer>

      {/* Course List */}
      <FlatList
        data={finalFilteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CourseCard>
            <CourseImage source={item.image} />
            <CourseDetails>
              <CourseTitle>{item.title}</CourseTitle>
              <CollegeName>{item.college}</CollegeName>
              <RatingContainer>
                <Icon name="star" size={14} color="#FFD700" />
                <RatingText>{item.rating}</RatingText>
              </RatingContainer>

              {/* Dynamic Button */}
              <EnrollButton>
                <EnrollText>
                  {item.coursestatus === "Saved Courses"
                    ? "Enroll Now"
                    : item.coursestatus === "In Progress"
                    ? "Continue"
                    : "View Certification"}
                </EnrollText>
              </EnrollButton>

              <StudentsContainer>
                <Icon name="users" size={14} color="#004d40" />
                <StudentsText>{item.students}</StudentsText>
              </StudentsContainer>
            </CourseDetails>
          </CourseCard>
        )}
      />
    </Container>
  );
};

export default StudentMyCoursesScreen;
