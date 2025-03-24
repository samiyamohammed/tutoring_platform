import styled from "styled-components/native";

export const Container = styled.View`
  padding: 20px;
  flex: 1;
  background-color: #fff;
`;

export const ProfileContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 20px;
  background-color: #fff;
`;

export const Divider = styled.View`
  height: 1px;
  background-color: #ddd;
  margin: 10px 30px;
`;

export const ProfileImage = styled.Image`
  width: 70px;
  height: 70px;
  border-radius: 35px;
`;

export const ProfileInfo = styled.View`
  flex: 1;
  margin-left: 15px;
`;

export const UserName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #004d40;
`;

export const UserEmail = styled.Text`
  font-size: 14px;
  color: #777;
`;

export const EditButton = styled.TouchableOpacity`
  padding: 5px;
`;

export const MenuContainer = styled.View`
  margin-top: 50px;
`;

export const MenuItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 15px 20px;
`;

export const MenuText = styled.Text`
  flex: 1;
  margin-left: 15px;
  font-size: 16px;
  color: #004d40;
`;

export const Footer = styled.View`
  align-items: center;
  margin-top: 20px;
`;

export const FooterText = styled.Text`
  font-size: 14px;
  color: #777;
  margin-bottom: 5px;
`;

export const BottomNav = styled.View`
  flex-direction: row;
  justify-content: space-around;
  background-color: #004d40;
  padding: 10px;
  position: absolute;
  bottom: 0;
  width: 100%;
`;

export const NavButton = styled.TouchableOpacity`
  padding: 10px;
`;
