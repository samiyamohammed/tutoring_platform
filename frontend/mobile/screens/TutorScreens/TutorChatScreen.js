import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  useColorScheme,
  StatusBar,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import styles from "../../styles/TutorScreensStyles/TutorChatScreenStyle";

// Mock data
const conversations = [
  {
    id: 1,
    user: {
      id: 1,
      name: "Amina Kebede",
      avatar: "https://picsum.photos/id/64/200",
      course: "Introduction to Programming",
      isOnline: true,
    },
    lastMessage: {
      text: "When is our next session?",
      timestamp: "10:30 AM",
      unread: true,
    },
  },
  {
    id: 2,
    user: {
      id: 2,
      name: "Daniel Tesfaye",
      avatar: "https://picsum.photos/id/65/200",
      course: "Advanced Mathematics",
      isOnline: true,
    },
    lastMessage: {
      text: "Thank you for the feedback on my assignment!",
      timestamp: "Yesterday",
      unread: false,
    },
  },
  {
    id: 3,
    user: {
      id: 3,
      name: "Sara Abebe",
      avatar: "https://picsum.photos/id/66/200",
      course: "Introduction to Programming",
      isOnline: false,
    },
    lastMessage: {
      text: "I need help with the assignment due next week",
      timestamp: "Yesterday",
      unread: true,
    },
  },
  {
    id: 4,
    user: {
      id: 4,
      name: "Yonas Melaku",
      avatar: "https://picsum.photos/id/67/200",
      course: "Business Communication",
      isOnline: false,
    },
    lastMessage: {
      text: "Do you have any resources about presentation techniques?",
      timestamp: "Monday",
      unread: false,
    },
  },
];

const messages = [
  {
    id: 1,
    text: "Hello Michael, when is our next session scheduled?",
    timestamp: "10:30 AM",
    senderId: 1, // Amina (student)
    receiverId: 100, // Michael (tutor)
  },
  {
    id: 2,
    text: "Hi Amina! Our next session is scheduled for tomorrow at 2:00 PM.",
    timestamp: "10:35 AM",
    senderId: 100, // Michael (tutor)
    receiverId: 1, // Amina (student)
  },
  {
    id: 3,
    text: "Do you want to cover any specific topics in the session?",
    timestamp: "10:36 AM",
    senderId: 100, // Michael (tutor)
    receiverId: 1, // Amina (student)
  },
  {
    id: 4,
    text: "Yes, I wanted to go over the loops concept in more detail. I'm having trouble understanding nested loops.",
    timestamp: "10:40 AM",
    senderId: 1, // Amina (student)
    receiverId: 100, // Michael (tutor)
  },
  {
    id: 5,
    text: "Sure, we can focus on that. Do you have any specific examples or exercises that are giving you difficulty?",
    timestamp: "10:42 AM",
    senderId: 100, // Michael (tutor)
    receiverId: 1, // Amina (student)
  },
];

const TutorChatScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showConversation, setShowConversation] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] =
    useState(conversations);
  const flatListRef = useRef(null);

  const isDark = colorScheme === "dark";
  const theme = {
    colors: {
      primary: "#5D5CDE",
      secondary: "#7A79E5",
      background: isDark ? "#181818" : "#FFFFFF",
      text: isDark ? "#FFFFFF" : "#333333",
      secondaryText: isDark ? "#AAAAAA" : "#666666",
      card: isDark ? "#2A2A2A" : "#F5F5F5",
      border: isDark ? "#444444" : "#DDDDDD",
      notification: "#FF4B4B",
      success: "#4CAF50",
      warning: "#FFC107",
      bubbleSent: isDark ? "#5D5CDE" : "#5D5CDE",
      bubbleReceived: isDark ? "#383838" : "#F0F0F0",
    },
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = conversations.filter(
        (conversation) =>
          conversation.user.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          conversation.lastMessage.text
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    // In a real app, you would send the message to your backend
    console.log("Sending message:", newMessage);

    // Clear the input
    setNewMessage("");

    // Scroll to the bottom of the message list
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd();
    }
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        { borderBottomColor: theme.colors.border },
      ]}
      onPress={() => {
        setSelectedConversation(item);
        setShowConversation(true);
      }}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        {item.user.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {item.user.name}
          </Text>
          <Text
            style={[styles.timestamp, { color: theme.colors.secondaryText }]}
          >
            {item.lastMessage.timestamp}
          </Text>
        </View>
        <Text style={[styles.courseText, { color: theme.colors.primary }]}>
          {item.user.course}
        </Text>
        <Text
          style={[
            styles.messagePreview,
            {
              color: item.lastMessage.unread
                ? theme.colors.text
                : theme.colors.secondaryText,
            },
          ]}
          numberOfLines={1}
        >
          {item.lastMessage.text}
        </Text>
      </View>
      {item.lastMessage.unread && (
        <View
          style={[
            styles.unreadBadge,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={styles.unreadText}>New</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }) => {
    const isSent = item.senderId === 100; // 100 is the tutor ID in this example

    return (
      <View
        style={[
          styles.messageContainer,
          isSent
            ? styles.sentMessageContainer
            : styles.receivedMessageContainer,
        ]}
      >
        {!isSent && (
          <Image
            source={{ uri: selectedConversation?.user.avatar }}
            style={styles.messageAvatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isSent
              ? [
                  styles.sentBubble,
                  { backgroundColor: theme.colors.bubbleSent },
                ]
              : [
                  styles.receivedBubble,
                  { backgroundColor: theme.colors.bubbleReceived },
                ],
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isSent ? "#FFFFFF" : theme.colors.text },
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.messageTimestamp,
              {
                color: isSent
                  ? "rgba(255, 255, 255, 0.7)"
                  : theme.colors.secondaryText,
              },
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Messages
        </Text>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.colors.card }]}
        >
          <Icon name="filter-variant" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View
        style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}
      >
        <Icon name="magnify" size={20} color={theme.colors.secondaryText} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search conversations..."
          placeholderTextColor={theme.colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Icon name="close" size={20} color={theme.colors.secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.conversationsList}
      />

      <Modal
        animationType="slide"
        transparent={false}
        visible={showConversation}
        onRequestClose={() => setShowConversation(false)}
      >
        <View
          style={[
            styles.chatContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View
            style={[
              styles.chatHeader,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <TouchableOpacity onPress={() => setShowConversation(false)}>
              <Icon name="arrow-left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            {selectedConversation && (
              <View style={styles.chatHeaderInfo}>
                <Image
                  source={{ uri: selectedConversation.user.avatar }}
                  style={styles.chatHeaderAvatar}
                />
                <View>
                  <Text
                    style={[
                      styles.chatHeaderName,
                      { color: theme.colors.text },
                    ]}
                  >
                    {selectedConversation.user.name}
                  </Text>
                  <View style={styles.statusContainer}>
                    {selectedConversation.user.isOnline ? (
                      <>
                        <View style={styles.onlineStatusDot} />
                        <Text
                          style={[
                            styles.statusText,
                            { color: theme.colors.success },
                          ]}
                        >
                          Online
                        </Text>
                      </>
                    ) : (
                      <Text
                        style={[
                          styles.statusText,
                          { color: theme.colors.secondaryText },
                        ]}
                      >
                        Offline
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}
            <View style={styles.chatHeaderActions}>
              <TouchableOpacity style={styles.chatHeaderButton}>
                <Icon name="video" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatHeaderButton}>
                <Icon name="phone" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messagesList}
          />

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.background,
                borderTopColor: theme.colors.border,
              },
            ]}
          >
            <TouchableOpacity style={styles.attachButton}>
              <Icon name="paperclip" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                },
              ]}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.secondaryText}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleSendMessage}
            >
              <Icon name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TutorChatScreen;
