// screens/AllIdeasScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AllIdeasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>All Ideas Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFF",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
