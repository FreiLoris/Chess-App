import {Modal, StyleSheet, Text, View} from 'react-native';
import {GenericButton} from "../components/button/button";
import {GenericTextInput} from "../components/text-input/textInput";
import {useEffect, useState} from "react";
import {router} from "expo-router";
import {createRoom} from "../service/room-service";
import {randomUUID} from "expo-crypto";
import {storePlayerId} from "../service/async-storage-service";

export default function Index() {
  const [roomName, setRoomName] = useState('');
  const [nickname, setNickname] = useState('');
  const [createRoomModalVisible, setCreateRoomModalVisible] = useState(false);
  const [findRoomModalVisible, setFindRoomModalVisible] = useState(false);

  const handleCreateRoom = () => {
    const player = {nickname, id: randomUUID()};

    createRoom(roomName, player)
    .then(() => {
      storePlayerId(player.id).then(() => {
        router.push({
          pathname: '/[room]', params: {
            roomName,
          }
        });
        setCreateRoomModalVisible(false);
      });
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });
  }

  const handleFindRoom = () => {
    setFindRoomModalVisible(false);
    router.push("/find-room/"+nickname);
  }

  return (
      <View style={styles.centerScreen}>
        <Text style={styles.title}>Chess App</Text>
        <View style={styles.stack}>
          <GenericButton title="Create room"
                         onPress={() => setCreateRoomModalVisible(true)}
                         fullWidth/>
          <GenericButton title="Find room"
                         onPress={() => setFindRoomModalVisible(true)}
                         backgroundColor="#0891B2"
                         fullWidth/>
        </View>

        <Modal
            transparent={true}
            visible={createRoomModalVisible}
            onRequestClose={() => setCreateRoomModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Create Room</Text>
              <GenericTextInput placeholder="Nickname"
                                value={nickname}
                                onChangeText={setNickname}
                                style={styles.input}/>
              <GenericTextInput placeholder="Room name"
                                value={roomName}
                                onChangeText={setRoomName}
                                style={styles.input}/>
              <View style={styles.flexbox}>
                <GenericButton onPress={() => setCreateRoomModalVisible(false)}
                               title={"Close"}
                               backgroundColor="#F9A8D4"
                               fullWidth/>
                <GenericButton title="Create"
                               onPress={handleCreateRoom}
                               fullWidth/>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
            transparent={true}
            visible={findRoomModalVisible}
            onRequestClose={() => setFindRoomModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Find Room</Text>
              <GenericTextInput placeholder="Nickname"
                                value={nickname}
                                onChangeText={setNickname}
                                style={styles.input}/>
              <View style={styles.flexbox}>
                <GenericButton onPress={() => setFindRoomModalVisible(false)}
                               title={"Close"}
                               backgroundColor="#F9A8D4"
                               fullWidth/>
                <GenericButton title="Find"
                               onPress={handleFindRoom}
                               fullWidth/>
              </View>
            </View>
          </View>
        </Modal>
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
  stack: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
  },
  flexbox: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
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
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 15,
    borderColor: '#000000',
    borderWidth: 1,
  },
  modalCloseButton: {
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: 'blue',
  },
});
