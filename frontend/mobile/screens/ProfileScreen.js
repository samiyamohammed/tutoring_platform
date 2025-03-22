import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import styled from "styled-components/native";
import Icon from "react-native-vector-icons/Feather";

const ProfileScreen = () => {
  return (
    <Container>
      {/* Header
      <Header>
        <Title>My Profile</Title>
      </Header> */}

      {/* Profile Section */}
      <ProfileContainer>
        <ProfileImage source={require("../assets/ladyprofile.jpg")} />
        <ProfileInfo>
          <UserName>
            <Text>Sidra Idrees</Text>
          </UserName>
          <UserEmail>
            <Text>youremail@gmail.com</Text>
          </UserEmail>
        </ProfileInfo>

        <EditButton>
          <Icon name="edit-2" size={20} color="#004d40" />
        </EditButton>
      </ProfileContainer>

      <Divider />

      {/* Menu List */}
      <MenuContainer>
        <MenuItem>
          <Icon name="credit-card" size={22} color="#004d40" />
          <MenuText>Payment Method</MenuText>
          <Icon name="chevron-right" size={22} color="#004d40" />
        </MenuItem>

        <MenuItem>
          <Icon name="file-text" size={22} color="#004d40" />
          <MenuText>My Certificates</MenuText>
          <Icon name="chevron-right" size={22} color="#004d40" />
        </MenuItem>

        <MenuItem>
          <Icon name="headphones" size={22} color="#004d40" />
          <MenuText>Help Center</MenuText>
          <Icon name="chevron-right" size={22} color="#004d40" />
        </MenuItem>

        <MenuItem>
          <Icon name="send" size={22} color="#004d40" />
          <MenuText>Invite Friends</MenuText>
          <Icon name="chevron-right" size={22} color="#004d40" />
        </MenuItem>

        <MenuItem>
          <Icon name="log-out" size={22} color="#004d40" />
          <MenuText>Log out</MenuText>
          <Icon name="chevron-right" size={22} color="#004d40" />
        </MenuItem>
      </MenuContainer>

      {/* Footer Links */}
      <Footer>
        <FooterText>Privacy Policy</FooterText>
        <FooterText>Terms and Conditions</FooterText>
      </Footer>
    </Container>
  );
};

export default ProfileScreen;
const Container = styled.View`
  flex: 1;
  background-color: #fff;
`;

const Header = styled.View`
  padding: 20px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #004d40;
`;

const ProfileContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 20px;
  background-color: #fff;
`;

const Divider = styled.View`
  height: 1px;
  background-color: #ddd;
  margin: 10px 30px;
`;

<<<<<<< HEAD

=======
>>>>>>> cdba7a38dbc4e26b7100f559e40f8964dc0acfb4
const ProfileImage = styled.Image`
  width: 70px;
  height: 70px;
  border-radius: 35px;
`;

const ProfileInfo = styled.View`
  flex: 1;
  margin-left: 15px;
`;

const UserName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #004d40;
`;

const UserEmail = styled.Text`
  font-size: 14px;
  color: #777;
`;

const EditButton = styled.TouchableOpacity`
  padding: 5px;
`;

const MenuContainer = styled.View`
<<<<<<< HEAD
  margin-top: 70px; 
=======
  margin-top: 70px;
>>>>>>> cdba7a38dbc4e26b7100f559e40f8964dc0acfb4
`;

const MenuItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 15px 20px;
`;

const MenuText = styled.Text`
  flex: 1;
  margin-left: 15px;
  font-size: 16px;
  color: #004d40;
`;

const Footer = styled.View`
  align-items: center;
  margin-top: 20px;
`;

const FooterText = styled.Text`
  font-size: 14px;
  color: #777;
  margin-bottom: 5px;
`;

const BottomNav = styled.View`
  flex-direction: row;
  justify-content: space-around;
  background-color: #004d40;
  padding: 10px;
  position: absolute;
  bottom: 0;
  width: 100%;
`;

const NavButton = styled.TouchableOpacity`
  padding: 10px;
`;
