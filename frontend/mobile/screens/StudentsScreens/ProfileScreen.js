import React from "react";
import { TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useNavigation , useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Container,
  ProfileContainer,
  Divider,
  ProfileImage,
  ProfileInfo,
  UserName,
  UserEmail,
  EditButton,
  MenuContainer,
  MenuItem,
  MenuText,
  Footer,
  FooterText,
} from "../../styles/StudentsScreensStyles/ProfileScreenStyle";
import Icon from "react-native-vector-icons/Feather";
import { CommonActions } from "@react-navigation/native";

const StudentProfileScreen = () => {
  const { signOut } = useAuth(); // Get signOut function from AuthContext
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
  
      await signOut(); // Wait for signOut to complete
  
      Alert.alert("Logged Out", "You have been successfully logged out.", [
        {
          text: "OK",          
        },
      ]);
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <Container>
      {/* Profile Section */}
      <ProfileContainer>
        <ProfileImage source={require("../../assets/ladyprofile.jpg")} />
        <ProfileInfo>
          <UserName>Sidra Idrees</UserName>
          <UserEmail>youremail@gmail.com</UserEmail>
        </ProfileInfo>

        <EditButton>
          <Icon name="edit-2" size={20} color="#004d40" />
        </EditButton>
      </ProfileContainer>

      <Divider />

      {/* Menu Options */}
      <MenuContainer>
        <TouchableOpacity>
          <MenuItem>
            <Icon name="file-text" size={22} color="#004d40" />
            <MenuText>My Certificates</MenuText>
            <Icon name="chevron-right" size={22} color="#004d40" />
          </MenuItem>
        </TouchableOpacity>

        <TouchableOpacity>
          <MenuItem>
            <Icon name="headphones" size={22} color="#004d40" />
            <MenuText>Help Center</MenuText>
            <Icon name="chevron-right" size={22} color="#004d40" />
          </MenuItem>
        </TouchableOpacity>

        <TouchableOpacity>
          <MenuItem>
            <Icon name="send" size={22} color="#004d40" />
            <MenuText>Invite Friends</MenuText>
            <Icon name="chevron-right" size={22} color="#004d40" />
          </MenuItem>
        </TouchableOpacity>

        {/* Logout Button - Now Works Correctly */}
        <TouchableOpacity >
          <MenuItem onPress={handleLogout}>
            <Icon name="log-out" size={22} color="#004d40" />
            <MenuText>Log out</MenuText>
            <Icon name="chevron-right" size={22} color="#004d40" />
          </MenuItem>
        </TouchableOpacity>
      </MenuContainer>

      {/* Footer Links */}
      <Footer>
        <FooterText>Privacy Policy</FooterText>
        <FooterText>Terms and Conditions</FooterText>
      </Footer>
    </Container>
  );
};

export default StudentProfileScreen;
