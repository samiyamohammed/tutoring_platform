import React from "react";
import { View, Text, Image } from "react-native";
import { styles } from "../styles/HomeScreenStyle";

const TutorCard = ({ tutor }) => {
  return (
    <View style={styles.tutorCard}>
      <Image source={tutor.image} style={styles.tutorImage} />
      <Text style={styles.tutorName}>{tutor.name}</Text>
      <Text style={styles.tutorSubject}>{tutor.subject}</Text>
    </View>
  );
};

export default TutorCard;
