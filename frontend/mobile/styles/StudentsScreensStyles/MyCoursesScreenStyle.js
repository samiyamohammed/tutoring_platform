import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background-color: #f4f8f9;
  padding: 20px;
`;

export const FilterContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 15px;
`;

export const FilterButton = styled.TouchableOpacity`
  padding: 8px 15px;
  border-radius: 20px;
  border-width: ${(props) => (props.selected ? "0px" : "1px")};
  background-color: ${(props) => (props.selected ? "#004d40" : "transparent")};
  border-color: #004d40;
`;

export const FilterText = styled.Text`
  color: ${(props) => (props.selected ? "#fff" : "#004d40")};
  font-weight: bold;
`;

export const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  border: 2px solid #004d40;
  border-radius: 18px;
  padding: 5px 12px;
  height: 45px;
  background-color: transparent;
  margin-bottom: 15px;
`;

export const SearchInput = styled.TextInput`
  flex: 1;
  margin-left: 8px;
  font-size: 14px;
  color: #004d40;
  padding: 5px;
  height: 100%;
  background-color: transparent;
  placeholdertextcolor: #004d40;
`;

export const CourseCard = styled.View`
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

export const CourseImage = styled.Image`
  width: 100px;
  height: 150px;
  border-radius: 10px;
  margin-right: 10px;
`;

export const CourseDetails = styled.View`
  flex: 1;
`;

export const CourseTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #004d40;
`;

export const CollegeName = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

export const RatingContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const RatingText = styled.Text`
  margin-left: 5px;
  font-size: 14px;
  color: #004d40;
`;

export const EnrollButton = styled.TouchableOpacity`
  background-color: #004d40;
  padding: 5px 10px;
  border-radius: 5px;
  margin-top: 5px;
  align-self: flex-start;
`;

export const EnrollText = styled.Text`
  color: white;
  font-size: 14px;
  font-weight: bold;
`;

export const StudentsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 5px;
  margin-left: 140px;
`;

export const StudentsText = styled.Text`
  margin-left: 5px;
  font-size: 14px;
  color: #004d40;
`;
