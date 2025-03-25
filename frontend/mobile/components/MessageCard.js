import React from "react";
import { View } from "react-native";
import {
  MessageCardContainer,
  ProfileImage,
  MessageDetails,
  UserName,
  MessageText,
  MessageInfo,
  UnreadBadge,
  UnreadText,
  TimeText,
} from "../styles/StudentsScreensStyles/MessagingScreenStyle";

const MessageCard = ({ item }) => {
  return (
    <MessageCardContainer>
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
    </MessageCardContainer>
  );
};

export default MessageCard;
