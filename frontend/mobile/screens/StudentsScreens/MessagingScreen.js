import React from "react";
import { FlatList } from "react-native";
import MessageCard from "../../components/MessageCard";
import messages from "../../models/messagesmodel";
import { Container } from "../../styles/StudentsScreensStyles/MessagingScreenStyle";

const StudentMessagingScreen = () => {
  return (
    <Container>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageCard item={item} />}
      />
    </Container>
  );
};

export default StudentMessagingScreen;
