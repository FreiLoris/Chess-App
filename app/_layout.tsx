import {Slot} from 'expo-router';
import {ImageBackground, StyleSheet, Text} from "react-native";

export default function HomeLayout() {
  const image = require('../assets/chess-board-background.png');

  return (
      <>
        <ImageBackground source={image} style={styles.container}>
          <Slot/>
        </ImageBackground>
      </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#171717',
  },
});
