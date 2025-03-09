import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import styled from "styled-components/native";
import Icon from "react-native-vector-icons/FontAwesome";

const MyCoursesScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState("Saved Courses");
  const [searchQuery, setSearchQuery] = useState("");

  const filters = ["Saved Courses", "In Progress", "Completed"];

  const courses = [
    {
      id: "1",
      title: "Typography and Layout Design",
      college: "Visual Communication College",
      rating: 4.7,
      image: require("../assets/courseimage.jpg"),
      students: 3457,
      status: "Saved Courses",
    },
    {
      id: "2",
      title: "Branding and Identity Design",
      college: "Brand Strategy College",
      rating: 4.4,
      image: require("../assets/courseimage.jpg"),
      students: 1457,
      status: "Saved Courses",
    },
    {
      id: "3",
      title: "Game Design and Development",
      college: "Game Development Academy",
      rating: 4.4,
      image: require("../assets/courseimage.jpg"),
      students: 5679,
      status: "Completed",
    },
    {
      id: "4",
      title: "Animation and Motion Graphics",
      college: "Animation Institute of Digital Arts",
      rating: 4.7,
      image: require("../assets/courseimage.jpg"),
      students: 5679,
      status: "In Progress",
      progress: 50,
    },
  ];

  // Filter courses based on selected status first
  const statusFilteredCourses = courses.filter(
    (course) => course.status === selectedFilter
  );

 //search
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
              <EnrollButton status={item.status}>
                <EnrollText>
                  {item.status === "Saved Courses"
                    ? "Enroll Now"
                    : item.status === "In Progress"
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

export default MyCoursesScreen;

/* Styled Components */
const Container = styled.View`
  flex: 1;
  background-color: #f4f8f9;
  padding: 20px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #004d40;
`;

const FilterContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const FilterButton = styled.TouchableOpacity`
  padding: 8px 15px;
  border-radius: 20px;
  border-width: ${(props) => (props.selected ? "0px" : "1px")};
  background-color: ${(props) => (props.selected ? "#004d40" : "transparent")};
  border-color: #004d40;
`;

const FilterText = styled.Text`
  color: ${(props) => (props.selected ? "#fff" : "#004d40")};
  font-weight: bold;
`;

/* Search Bar Styles */
const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  border: 2px solid #004d40;
  border-radius: 18px;
  padding: 5px 12px;
  height: 45px;
  background-color: transparent;
  margin-bottom: 15px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  margin-left: 8px;
  font-size: 14px;
  color: #004d40;
  padding: 5px; 
  height: 100%;
  background-color: transparent;
  placeholdertextcolor: #004d40;
`;



const CourseCard = styled.View`
  flex-direction: row;
  background-color: white;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const CourseImage = styled.Image`
  width: 100px; 
  height: 150px; 
  border-radius: 10px;
  margin-right: 10px;
`;

const CourseDetails = styled.View`
  flex: 1;
`;

const CourseTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #004d40;
`;

const CollegeName = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const RatingContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const RatingText = styled.Text`
  margin-left: 5px;
  font-size: 14px;
  color: #004d40;
`;

const EnrollButton = styled.TouchableOpacity`
  background-color: #004d40;
  padding: 5px 10px;
  border-radius: 5px;
  margin-top: 5px;
  align-self: flex-start;
`;

const EnrollText = styled.Text`
  color: white;
  font-size: 14px;
  font-weight: bold;
`;

const StudentsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 5px;
  margin-left: 140px;
`;

const StudentsText = styled.Text`
  margin-left: 5px;
  font-size: 14px;
  color: #004d40;
`;
