import {StyleSheet, Text, View} from "react-native";
import GenericTable from "../../components/table/table";
import {router, useLocalSearchParams} from "expo-router";
import {addPlayerToRoom, getAllRooms} from "../../service/room-service";
import {useEffect, useState} from "react";
import GenericButton from "../../components/button/button";
import {randomUUID} from "expo-crypto";
import {Player, Room} from "../../service/moduls";
import {storePlayerId} from "../../service/async-storage-service";

export default function FindRoom() {
  const {nickname} = useLocalSearchParams();
  const [rooms, setRooms] = useState<{[key: string]: Room}>({});
  useEffect(() => {
    getAllRooms((rooms) => {
      setRooms(rooms);
    });

  }, []);

  const handleJoin = (roomName: string) => {
    const player:Player = {nickname: nickname as string, id: randomUUID()};
    addPlayerToRoom(roomName, player)
    .then(() => {
      storePlayerId(player.id).then(() => {
        router.push({
          pathname: '/[room]', params: {
            roomName,
          }
        });
      });
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });
  }

  const rows = Object.values(rooms).map(room => {
    return (
        <View key={room.name} style={styles.rowContainer}>
          <Text style={styles.rowText}>
            {room.name}
          </Text>
          <GenericButton onPress={() => handleJoin(room.name)} title={"JOIN"}/>
        </View>
    );
  });
  return (
      <View style={styles.centerScreen}>
        <Text style={styles.title}>Find room</Text>
        <GenericTable header={"Rooms"} rows={rows}/>
        <GenericButton onPress={() => router.replace("/")} title={"CANCEL"} width={'90%'} backgroundColor="#F9A8D4"/>
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
  rowText: {
    paddingBottom: 5,
    fontSize: 16,
    color: '#ffffff',
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#ffffff',
    borderBottomWidth: 1,
  }
});
