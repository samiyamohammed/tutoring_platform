import React from "react";
import { View, Text, Image } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { styles } from "../styles/HomeScreenStyle";

const CourseCard = ({ course }) => {
  return (
    <View style={styles.courseCard}>
      <Image source={course.image} style={styles.courseImage} />
      <View style={styles.courseDetails}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.collegeName}>{course.college}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{course.rating}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${course.progress}%` }]}
          />
        </View>
      </View>
    </View>
  );
};

export default CourseCard;
