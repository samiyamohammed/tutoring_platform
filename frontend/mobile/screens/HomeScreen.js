import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import styled from "styled-components/native";
import Icon from "react-native-vector-icons/FontAwesome";

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const courses = [
    {
      id: "1",
      title: "UI/UX Design Essentials",
      college: "Tech Innovations University",
      rating: 4.9,
      image: require("../assets/courseimage.jpg"),
      progress: 79,
    },
    {
      id: "2",
      title: "Graphic Design Fundamentals",
      college: "Creative Arts Institute",
      rating: 4.7,
      image: require("../assets/courseimage.jpg"),
      progress: 35,
    },
  ];

  const categories = ["Graphic Design", "User Interface", "User Experience"];

  const suggestions = [
    {
      id: "1",
      title: "Typography and Layout Design",
      college: "Visual Communication College",
      rating: 4.7,
      image: require("../assets/courseimage.jpg"),
    },
    {
      id: "2",
      title: "Branding and Identity Design",
      college: "Innovation and Design School",
      rating: 4.4,
      image: require("../assets/courseimage.jpg"),
    },
    {
      id: "3",
      title: "Web Design Fundamentals",
      college: "Web Development University",
      rating: 4.9,
      image: require("../assets/courseimage.jpg"),
    },
  ];

  const tutors = [
    {
      id: "1",
      name: "Aisha Khan",
      subject: "UI/UX Design Expert",
      image: require("../assets/ladyprofile.jpg"),
    },
    {
      id: "2",
      name: "Michael Smith",
      subject: "Graphic Design Instructor",
      image: require("../assets/ladyprofile.jpg"),
    },
    {
      id: "3",
      name: "Emily Johnson",
      subject: "Product Design Specialist",
      image: require("../assets/ladyprofile.jpg"),
    },
  ];

  return (
    <FlatList
      data={courses}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          {/* Header */}
          <Header>
            <Icon name="bars" size={24} color="#004d40" />
            <TitleContainer>
              <Title>
                <Text>Welcome </Text>
                <UserName>Sidra</UserName>
              </Title>
            </TitleContainer>
            <Icon name="bell" size={22} color="#004d40" />
          </Header>

          {/* Search Bar */}
          <SearchContainer>
            <Icon name="search" size={18} color="#888" />
            <SearchInput
              placeholder="Search courses..."
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
            <FilterButton>
              <Icon name="filter" size={16} color="#004d40" />
              <FilterText>Filter</FilterText>
            </FilterButton>
          </SearchContainer>

          <SectionTitle>Continue Learning</SectionTitle>
          <FlatList
            data={courses}
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
                  <ProgressBarContainer>
                    <ProgressBar width={item.progress} />
                  </ProgressBarContainer>
                </CourseDetails>
              </CourseCard>
            )}
          />

          {/* Categories */}
          <SectionHeader>
            <SectionTitle>Categories</SectionTitle>
          </SectionHeader>
          <CategoriesContainer>
            {categories.map((category) => (
              <CategoryChip key={category}>
                <CategoryText>{category}</CategoryText>
              </CategoryChip>
            ))}
          </CategoriesContainer>

          {/* Suggestions */}
          <SectionHeader>
            <SectionTitle>Suggestions for You</SectionTitle>
            <SeeAll>See All</SeeAll>
          </SectionHeader>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <SuggestionCard>
                <SaveButton>
                  <Icon name="bookmark" size={16} color="#004d40" />
                </SaveButton>
                <SuggestionImage source={item.image} />
                <SuggestionTitle>{item.title}</SuggestionTitle>
                <SuggestionCollege>{item.college}</SuggestionCollege>
              </SuggestionCard>
            )}
          />
          <SectionHeader>
            <SectionTitle>Top Courses</SectionTitle> <SeeAll>See All</SeeAll>
          </SectionHeader>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <SuggestionCard>
                <SaveButton>
                  <Icon name="bookmark" size={16} color="#004d40" />
                </SaveButton>
                <SuggestionImage source={item.image} />
                <SuggestionTitle>{item.title}</SuggestionTitle>
                <SuggestionCollege>{item.college}</SuggestionCollege>
              </SuggestionCard>
            )}
          />

          {/* Tutors Section */}
          <SectionHeader>
            <SectionTitle>Tutors</SectionTitle>
            <SeeAll>See All</SeeAll>
          </SectionHeader>

          <FlatList
            data={tutors}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TutorCard>
                <TutorImage source={item.image} />
                <TutorName>{item.name}</TutorName>
                <TutorSubject>{item.subject}</TutorSubject>
              </TutorCard>
            )}
          />
        </>
      }
    />
  );
};

// Styled Components
const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
`;

const MenuIcon = styled(Icon)``;
const NotificationIcon = styled(Icon)``;

const TitleContainer = styled.View`
  flex: 1;
  align-items: flex-start;
  margin-left: 20px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #333;
`;

const UserName = styled.Text`
  color: #004d40;
`;

const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  border: 2px solid #004d40;
  border-radius: 20px;
  padding: 5px 12px;
  height: 45px;
  background-color: white;
  margin-top: 15px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  margin-left: 8px;
  font-size: 14px;
  height: 100%;
  padding: 5px;
  color: #004d40;
`;

const FilterButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 5px 10px;
  background-color: #e0f2f1;
  border-radius: 10px;
  margin-left: 10px;
`;

const FilterText = styled.Text`
  margin-left: 5px;
  color: #004d40;
  font-size: 14px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-top: 20px;
  padding-left: 15px;
`;

const CategoriesContainer = styled.View`
  flex-direction: row;
  margin-top: 10px;
  padding-left: 15px;
`;

const CategoryChip = styled.TouchableOpacity`
  border: 1px solid #004d40;
  border-radius: 20px;
  padding: 5px 12px;
  margin-right: 10px;
`;

const CategoryText = styled.Text`
  color: #004d40;
  font-size: 14px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 0 15px;
`;

const SeeAll = styled.Text`
  font-size: 14px;
  color: #004d40;
  font-weight: bold;
`;

const CourseCard = styled.View`
  flex-direction: row;
  background-color: white;
  border-radius: 10px;
  padding: 10px;
  margin-top: 10px;
  margin-left: 15px;
  margin-right: 15px;
`;

const CourseImage = styled.Image`
  width: 90px;
  height: 90px;
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

const ProgressBarContainer = styled.View`
  width: 100%;
  height: 6px;
  background-color: #ddd;
  border-radius: 5px;
  margin-top: 5px;
`;

const ProgressBar = styled.View`
  height: 6px;
  background-color: #004d40;
  border-radius: 5px;
  width: ${(props) => props.width}%;
`;

const SuggestionCard = styled.View`
  width: 150px;
  background-color: white;
  border-radius: 10px;
  padding: 10px;
  margin-right: 10px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const SuggestionImage = styled.Image`
  width: 100%;
  height: 80px;
  border-radius: 8px;
`;

const SuggestionTitle = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #004d40;
  margin-top: 5px;
`;

const SuggestionCollege = styled.Text`
  font-size: 12px;
  color: #666;
`;

const TutorCard = styled.View`
  width: 120px;
  background-color: white;
  border-radius: 10px;
  padding: 10px;
  margin-right: 10px;
  align-items: center;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const TutorImage = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  margin-bottom: 5px;
`;

const TutorName = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #004d40;
  text-align: center;
`;

const TutorSubject = styled.Text`
  font-size: 12px;
  color: #666;
  text-align: center;
`;

const SaveButton = styled.View`
  position: relative;
  margin-left: 110px;
`;


export default HomeScreen;
