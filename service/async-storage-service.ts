import AsyncStorage from '@react-native-async-storage/async-storage';

export const storePlayerId = async (myPlayerId: string) => {
  try {
    await AsyncStorage.setItem('@myPlayerId', myPlayerId);
  } catch (e) {
    // saving error
    console.error("Error saving playerId to AsyncStorage: ", e);
  }
}
export const getPlayerId = async () => {
  try {
    const myPlayerId = await AsyncStorage.getItem('@myPlayerId');
    if(myPlayerId !== null) {
      // value previously stored
      return myPlayerId;
    }
  } catch(e) {
    // error reading value
    console.error("Error reading playerId from AsyncStorage: ", e);
  }
}