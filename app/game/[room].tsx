import React, {useEffect, useState} from 'react';
import {Alert, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {router, useLocalSearchParams} from "expo-router";
import {
  changeRoomStatus,
  deleteRoom,
  getCurrentPlayerFromRoom,
  getPlayersFromRoom,
  getRoomWinner, setPlayerProfileImage,
  setRoomWinner
} from "../../service/room-service";
import {Player, Status} from "../../service/moduls";
import {getPlayerId} from "../../service/async-storage-service";
import * as ImagePicker from 'expo-image-picker'
import CustomChessboard from "../../components/chessboard/chessboard";

export default function Game() {
  const {room} = useLocalSearchParams();
  const [seconds, setSeconds] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [myPlayerId, setMyPlayerId] = useState('');
  const [winner, setWinner] = useState('');
  const [profileImage, setProfileImage] = useState('')

  // Calculate minutes and seconds from the total seconds
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = seconds % 60;

  // Format time to ensure two digits are displayed
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = secondsLeft.toString().padStart(2, '0');

  // Combine minutes and seconds into a time string
  const timeString = `${formattedMinutes}:${formattedSeconds}`;

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(seconds => seconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPlayerId = async () => {
      const id = await getPlayerId();
      setMyPlayerId(id!);
    };

    fetchPlayerId();

    getPlayersFromRoom(room as string, (players) => {
      setPlayers(players);
    });

    getCurrentPlayerFromRoom(room as string, (currentPlayer) => {
      setCurrentPlayer(currentPlayer);
    });

    getRoomWinner(room as string, (winner) => {
      setWinner(winner);
    });

  }, [room]);

  useEffect(() => {
    // Assuming `winner` is a state that gets updated when a winner is determined
    if (winner) {
      const winnerNickname = players.find(player => player.id === winner)?.nickname;
      if (winnerNickname) {
        Alert.alert(
            "Game Over",
            `The winner is ${winnerNickname}`,
            [
              {
                text: "OK",
                onPress: () => {
                  changeRoomStatus(room as string, Status.FINISHED).then(() => {
                    deleteRoom(room as string).then(() => {
                      router.replace('/');
                    });
                  });
                }
              }
            ],
            {cancelable: false}
        );
      }
    }
  }, [winner]);

  const handleForfeit = () => {
    setRoomWinner(room as string, players.find(player => player.id !== myPlayerId)?.id as string);
  }


  async function handleTakeProfileImage(id: string | undefined) {
    if (!id) return

    const {status} = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 1
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPlayerProfileImage(room as string, id, result.assets[0].base64 as string);
    }
  }

  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.player}>
            <TouchableOpacity disabled={myPlayerId !== players[0]?.id} onPress={() => handleTakeProfileImage(players[0]?.id)}>
              {players[0]?.profileImage ? (
                  <Image source={{uri: `data:image/jpeg;base64,${players[0].profileImage}`}} style={{width: 50, height: 50, borderRadius: 25}}/>) : (
                  <View style={[styles.playerIcon, {backgroundColor: 'red'}, players[0]?.id === currentPlayer ? styles.greenBorder : {}]}>
                    <Text style={styles.playerIconText}>{players[0]?.nickname.charAt(0)}</Text>
                  </View>
              )}
            </TouchableOpacity>
            <Text style={[styles.playerName, players[0]?.id === currentPlayer ? {color: 'green'} : {}]}>{players[0]?.nickname}</Text>
            <Text style={[styles.playerName, players[0]?.id === currentPlayer ? {color: 'green'} : {}]}>({players[0]?.color})</Text>
          </View>
          <Text style={styles.timer}>{timeString}</Text>
          <View style={styles.player}>
            <TouchableOpacity disabled={myPlayerId !== players[1]?.id}onPress={() => handleTakeProfileImage(players[1]?.id)}>
              {players[1]?.profileImage ? (
                  <Image source={{uri: `data:image/jpeg;base64,${players[1].profileImage}`}} style={{width: 50, height: 50, borderRadius: 25}}/>) : (
                  <View style={[styles.playerIcon, {backgroundColor: 'blue'}, players[1]?.id === currentPlayer ? styles.greenBorder : {}]}>
                    <Text style={styles.playerIconText}>{players[1]?.nickname.charAt(0)}</Text>
                  </View>
              )}
            </TouchableOpacity>
            <Text style={[styles.playerName, players[1]?.id === currentPlayer ? {color: 'green'} : {}]}>{players[1]?.nickname}</Text>
            <Text style={[styles.playerName, players[1]?.id === currentPlayer ? {color: 'green'} : {}]}>({players[1]?.color})</Text>
          </View>
        </View>
        <GestureHandlerRootView style={styles.container}>
          <CustomChessboard room={room as string}/>
        </GestureHandlerRootView>
        <TouchableOpacity style={styles.forfeitButton}
                          onPress={handleForfeit}>
          <Text style={styles.forfeitButtonText}>FORFEIT</Text>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginBottom: 20,
    top: +100,
    zIndex: 6000
  },
  player: {
    alignItems: 'center',
  },
  greenBorder: {
    borderColor: 'green',
    borderWidth: 4,
  },
  playerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerIconText: {
    color: 'white',
    fontSize: 24,
  },
  playerName: {
    color: 'white',
    marginTop: 5,
  },
  timer: {
    color: 'white',
    fontSize: 20,
  },
  chessboard: {
    flex: 1,
    width: '90%',
  },
  forfeitButton: {
    backgroundColor: 'pink',
    padding: 15,
    borderRadius: 10,
    position: 'absolute',
    bottom: 20,
  },
  forfeitButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
