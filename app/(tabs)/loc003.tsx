import { StyleSheet, Text, View } from "react-native";

export default function Location3Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Location 3 screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
  }
})