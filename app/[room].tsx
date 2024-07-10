import {StyleSheet, Text, View} from "react-native";
import {router, useLocalSearchParams} from "expo-router";
import GenericTable from "../components/table/table";
import GenericButton from "../components/button/button";
import {useEffect, useState} from "react";
import {
  changeRoomStatus,
  getPlayersFromRoom,
  removePlayerFromRoom,
  subscribeToRoomStatus
} from "../service/room-service";
import {Player, Status} from "../service/moduls";
import {getPlayerId} from "../service/async-storage-service";

export default function Room() {
  const {roomName} = useLocalSearchParams();
  const [myPlayerId, setMyPlayerId] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  useEffect(() => {
    getPlayerId().then((id) => {
      setMyPlayerId(id!);
    });

    getPlayersFromRoom(roomName as string, (players) => {
      setPlayers(players);
    });
    // Abonnieren Sie den Status des Raums
    const unsubscribe = subscribeToRoomStatus(roomName as string, (status) => {
      if (status === Status.PLAYING) {
        router.replace(`/game/${roomName}`);
      }
    });
    // Stellen Sie sicher, dass Sie das Abonnement aufräumen, wenn die Komponente unmountet
    return () => unsubscribe();
  }, [roomName]);
  const rows = players.map(player => {
    return (
        <View key={player.id}>
          <Text style={[styles.rowText, player.id === myPlayerId ? styles.activePlayer : {}]}>
            {player.nickname} {player.id === myPlayerId ? "(You)" : ""}
          </Text>
        </View>
    );
  });
  if (rows.length === 0) return;
  const handleCancel = () => {
    removePlayerFromRoom(roomName as string, myPlayerId as string);
    router.replace("/");
  }
  const handleStart = () => {
    changeRoomStatus(roomName as string, Status.PLAYING).then(() => {
      router.replace(`/game/${roomName}`);
    })
  }
  return (
      <View style={styles.centerScreen}>
        <Text style={styles.title}>{roomName} created!</Text>
        <GenericTable header="Waiting for Player..."
                      rows={rows}/>
        <View style={styles.flexbox}>
          <GenericButton onPress={handleCancel}
                         title={"CANCEL"}
                         width={130}
                         backgroundColor="#F9A8D4"/>
          <GenericButton disabled={players.length < 2}
                         onPress={handleStart}
                         title={"START"}
                         width={130}/>
        </View>
      </View>
  );
}
const styles = StyleSheet.create({
  title: {
    width: '100%',
    textAlign: 'center',
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 50,
  },
  centerScreen: {
    top: -50,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexbox: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  rowText: {
    paddingBottom: 5,
    fontSize: 16,
    color: '#ffffff',
  },
  activePlayer: {
    color: '#00ff26', // Change this to the color you want for the active player
  },
});