import React from "react";
import { FlatList, View, Text, Image, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import Icon from "react-native-vector-icons/Feather";

const messages = [
  {
    id: "1",
    name: "Michael",
    message: "Hello! Good Morning.",
    time: "7:00 pm",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: "2",
    name: "Daniel",
    message: "Hello! Good Morning.",
    time: "7:00 pm",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: "3",
    name: "Ali",
    message: "Hello! Good Morning.",
    time: "7:00 pm",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    id: "4",
    name: "Daniela",
    message: "Hello! Good Morning.",
    time: "7:00 pm",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    id: "5",
    name: "Jackson",
    message: "Hello! Good Morning.",
    time: "7:00 pm",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    id: "6",
    name: "David",
    message: "Hello! Good Morning.",
    time: "7:00 pm",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
  },
];

const MessagingScreen = () => {
  return (
    <Container>
      {/* Message List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageCard>
            <ProfileImage source={{ uri: item.image }} />
            <MessageDetails>
              <UserName>{item.name}</UserName>
              <MessageText>{item.message}</MessageText>
            </MessageDetails>
            <MessageInfo>
              <UnreadBadge>
                <UnreadText>03</UnreadText>
              </UnreadBadge>
              <TimeText>{item.time}</TimeText>
            </MessageInfo>
          </MessageCard>
        )}
      />
    </Container>
  );
};

export default MessagingScreen;

const Container = styled.View`
  flex: 1;
  background-color: #ffffff;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  justify-content: space-between;
`;

const BackButton = styled.TouchableOpacity`
  padding: 5px;
`;

const SearchButton = styled.TouchableOpacity`
  padding: 5px;
`;

const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #004d40;
`;

const MessageCard = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
`;

const ProfileImage = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-right: 15px;
`;

const MessageDetails = styled.View`
  flex: 1;
`;

const UserName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #004d40;
`;

const MessageText = styled.Text`
  font-size: 14px;
  color: #666;
`;

const MessageInfo = styled.View`
  align-items: flex-end;
`;

const UnreadBadge = styled.View`
  background-color: #004d40;
  width: 25px;
  height: 25px;
  border-radius: 12.5px;
  align-items: center;
  justify-content: center;
`;

const UnreadText = styled.Text`
  color: #fff;
  font-size: 12px;
  font-weight: bold;
`;

const TimeText = styled.Text`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
`;

const BottomNav = styled.View`
  flex-direction: row;
  background-color: #00695c;
  padding: 10px;
  justify-content: space-around;
`;

const NavButton = styled.TouchableOpacity`
  padding: 10px;
  opacity: ${(props) => (props.active ? 1 : 0.5)};
`;
