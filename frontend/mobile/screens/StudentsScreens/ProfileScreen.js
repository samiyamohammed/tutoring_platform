import React from "react";
import { TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Check if storage is cleared
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

const StudentProfileScreen = () => {
  const { signOut } = useAuth(); 
  const navigation = useNavigation();

  const handleLogout = async () => {
    
    const { signOut } = useAuth(); 
    try {
      await signOut(); 

      // Double-check AsyncStorage
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userRole");

      Alert.alert("Logged Out", "You have been successfully logged out.", [
        { text: "OK", onPress: () => navigation.replace("SignIn") },
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

      {/* List of options */}
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

        {/* Logout Button */}
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
