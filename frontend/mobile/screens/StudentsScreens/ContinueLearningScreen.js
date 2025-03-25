import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { CourseList } from "../../models/courselistmodel";
import { styles } from "../../styles/StudentsScreensStyles/ContinuLearningScreenStyle";

const ContinueLearningScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-left"
            size={20}
            color="#004d40"
            style={styles.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Continue Learning</Text>
      </View>

      {/* Full Course List */}
      <FlatList
        data={CourseList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.courseCard}>
            <Image source={item.image} style={styles.courseImage} />
            <View style={styles.courseDetails}>
              <Text style={styles.courseTitle}>{item.title}</Text>
              <Text style={styles.collegeName}>{item.college}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[styles.progressBar, { width: `${item.progress}%` }]}
                />
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default ContinueLearningScreen;
