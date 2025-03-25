import React, { useState } from "react";
import { View, Pressable, Text } from "react-native";
import { styles } from "../styles/HomeScreenStyle";

const FilterChips = ({ options, onSelect }) => {
  const [selected, setSelected] = useState(null);

  const handlePress = (option) => {
    const newSelected = selected === option ? null : option; 
    setSelected(newSelected);
    onSelect(newSelected); 
  };

  return (
    <View style={styles.chipContainer}>
      {options.map((option, index) => (
        <Pressable
          key={index}
          style={[
            styles.categoryChip,
            selected === option && styles.categoryChipSelected,
          ]}
          onPress={() => handlePress(option)}
        >
          <Text
            style={[
              styles.categoryText,
              selected === option && styles.categoryTextSelected,
            ]}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

export default FilterChips;
