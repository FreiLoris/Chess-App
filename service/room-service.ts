import {get, onValue, ref, set, update} from "firebase/database";
import {db} from "./firebase-config";

import {BoardSetup, RowType, Player, Room, Status} from "./moduls";

export const createRoom = async (roomName: string, player: Player) => {
  return await set(ref(db, 'room/' + roomName), {
    name: roomName,
    status: Status.WAITING,
    players: [
      player
    ]
  });
}
export const getPlayersFromRoom = (roomName: string, callback: (players: Player[]) => void) => {
  const roomRef = ref(db, 'room/' + roomName + '/players');

  onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    } else {
      console.log(`No players found in room: ${roomName}`);
      callback([]);
    }
  }, (error) => {
    console.error("Error getting players from room: ", error);
    callback([]);
  });
};
export const getCurrentPlayerFromRoom = (roomName: string, callback: (playerId: string) => void) => {
  const roomRef = ref(db, `room/${roomName}/currentPlayer`);

  onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    } else {
      console.log(`No current player found in room: ${roomName}`);
      callback('');
    }
  }, (error) => {
    console.error("Error getting current player from room: ", error);
    callback('');
  });
}
export const addPlayerToRoom = async (roomName: string, player: Player) => {
  try {
    // Referenz zum spezifischen Raum
    const roomRef = ref(db, `room/${roomName}/players`);

    // Holen Sie die aktuelle Liste der Spieler
    const snapshot = await get(roomRef);
    let players = [];

    if (snapshot.exists()) {
      players = snapshot.val(); // Die bestehende Liste der Spieler
    }
    console.log("players", players)
    // Fügen Sie den neuen Spieler zur Liste hinzu
    players.push(player);

    // Aktualisieren Sie die Datenbank mit der neuen Spieler-Liste
    const updates: {[key: string]: Player[]} = {};
    updates[`room/${roomName}/players`] = players;

    await update(ref(db), updates);

    console.log(`Player ${player.nickname} added to room ${roomName}`);
  } catch (error) {
    console.error("Error adding player to room: ", error);
  }
};
export const removePlayerFromRoom = async (roomName: string, playerId: string) => {
  try {
    // Referenz zum spezifischen Raum
    const roomRef = ref(db, `room/${roomName}/players`);

    // Holen Sie die aktuelle Liste der Spieler
    const snapshot = await get(roomRef);
    let players: Player[] = [];

    if (snapshot.exists()) {
      players = snapshot.val(); // Die bestehende Liste der Spieler
    }

    // Entfernen Sie den Spieler aus der Liste
    const updatedPlayers = players.filter(player => player.id !== playerId);

    // Aktualisieren Sie die Datenbank mit der neuen Spieler-Liste
    const updates: {[key: string]: Player[]} = {};
    updates[`room/${roomName}/players`] = updatedPlayers;

    await update(ref(db), updates);

    console.log(`Player ${playerId} removed from room ${roomName}`);
  } catch (error) {
    console.error("Error removing player from room: ", error);
  }
}

export const getAllRooms = (callback: (rooms: {[key: string]: Room}) => void) => {
  const roomsRef = ref(db, 'room');

  onValue(roomsRef, (snapshot) => {
    const rooms: {[key: string]: Room} = snapshot.val();

    if (rooms) {
      // Filtere die Räume, um nur die Räume mit weniger als zwei Spielern zurückzugeben
      const filteredRooms = Object.keys(rooms).filter(roomKey => {
        const players = rooms[roomKey].players || [];
        return players.length < 2;
      }).reduce((acc: {[key: string]: Room}, roomKey) => {
        acc[roomKey] = rooms[roomKey];
        return acc;
      }, {});

      callback(filteredRooms);
    } else {
      console.log("No rooms available");
      callback({});
    }
  }, (error) => {
    console.error("Error monitoring rooms: ", error);
    callback({});
  });
}
export const changeRoomStatus = async (roomName: string, status: Status) => {
  try {
    await set(ref(db, `room/${roomName}/status`), status);
    console.log(`Room ${roomName} status changed to ${status}`);
  } catch (error) {
    console.error("Error changing room status: ", error);
  }
}

export const setCurrentPlayer = async (roomName: string, playerId: string) => {
  try {
    const updates: {[key: string]: string} = {};
    updates[`room/${roomName}/currentPlayer`] = playerId;

    await update(ref(db), updates);

    console.log(`Current player in room ${roomName} set to ${playerId}`); // Add console log
  } catch (error) {
    console.error("Error setting current player: ", error);
  }
};
export const getCurrentPlayerId = async (roomName: string): Promise<string> => {
  const roomRef = ref(db, `room/${roomName}/currentPlayer`);
  const snapshot = await get(roomRef);
  return snapshot.val() || '';
}

export const setPlayerColor = async (roomName: string, playerId: string, color: string) => {
  try {
    const roomRef = ref(db, `room/${roomName}/players`);
    const snapshot = await get(roomRef);
    let players: Player[] = [];

    if (snapshot.exists()) {
      players = snapshot.val(); // Die bestehende Liste der Spieler
    }

    // Find the player and set their color
    const playerIndex = players.findIndex(player => player.id === playerId);
    if (playerIndex !== -1) {
      players[playerIndex].color = color;

      // Aktualisieren Sie die Datenbank mit der neuen Spieler-Liste
      const updates: {[key: string]: Player[]} = {};
      updates[`room/${roomName}/players`] = players;

      await update(ref(db), updates);

      console.log(`Color for player ${playerId} in room ${roomName} set to ${color}`);
    } else {
      console.error(`Player ${playerId} not found in room ${roomName}`);
    }
  } catch (error) {
    console.error("Error setting player color: ", error);
  }
}
export const getPlayerColor = async (roomName: string, playerId: string): Promise<string> => {
  const roomRef = ref(db, `room/${roomName}/players`);
  const snapshot = await get(roomRef);
  const players: Player[] = snapshot.val() || [];
  const player = players.find(player => player.id === playerId);
  return player?.color!;
}
export const updateBoardInFirebase = async (roomName: string, newBoard: BoardSetup) => {
  try {
    // Replace null values with empty string
    const boardToSave = newBoard.map((row: (RowType)[]) => row.map((cell: RowType) => cell === null ? "" : cell));

    await set(ref(db, `room/${roomName}/board`), boardToSave);
    console.log(`Board in room ${roomName} updated`);
  } catch (error) {
    console.error("Error updating board: ", error);
  }
};
export const subscribeToBoardUpdates = (roomName: string, callback: (newBoard: BoardSetup) => void) => {
  const boardRef = ref(db, `room/${roomName}/board`);

  return onValue(boardRef, (snapshot) => {
    let updatedBoard: BoardSetup  = snapshot.val();
    if (updatedBoard) {
      // Convert empty strings back to null
      updatedBoard = updatedBoard.map(row => row.map(cell => cell === "" ? null : cell));

      console.log(updatedBoard);
      callback(updatedBoard);
    } else {
      console.log('updatedBoard is undefined');
    }
  });
};
export const subscribeToRoomStatus = (roomName: string, callback: (status: Status) => void) => {
  const roomStatusRef = ref(db, `room/${roomName}/status`);
  const unsubscribe = onValue(roomStatusRef, (snapshot) => {
    const status = snapshot.val();
    callback(status);
  });

  // Rückgabe der Abmeldefunktion, damit sie später aufgerufen werden kann
  return unsubscribe;
};
export const getPlayerIdsFromRoom = async (roomName: string):Promise<string[]> => {
  const roomRef = ref(db, `room/${roomName}/players`);
  const snapshot = await get(roomRef);
  const players: Player[] = snapshot.val() || [];
  return players.map(player => player.id);
}
export const setRoomWinner = async (roomName: string, winnerId: string) => {
  try {
    await set(ref(db, `room/${roomName}/winner`), winnerId);
    console.log(`Winner in room ${roomName} set to ${winnerId}`);
  } catch (error) {
    console.error("Error setting room winner: ", error);
  }
}
export const getRoomWinner = async (roomName: string, callback: (playerId: string) => void) => {
  const roomRef = ref(db, `room/${roomName}/winner`);

  onValue(roomRef, (snapshot) => {
    const winnerId = snapshot.val();
    callback(winnerId);
  }, (error) => {
    console.error("Error getting room winner: ", error);
  });
}
export const deleteRoom = async (roomName: string) => {
  try {
    await set(ref(db, `room/${roomName}`), null);
    console.log(`Room ${roomName} deleted`);
  } catch (error) {
    console.error("Error deleting room: ", error);
  }
}
export const setPlayerProfileImage = async (roomName: string, playerId: string, profileImage: string) => {
  try {
    const roomRef = ref(db, `room/${roomName}/players`);
    const snapshot = await get(roomRef);
    let players: Player[] = [];

    if (snapshot.exists()) {
      players = snapshot.val(); // Die bestehende Liste der Spieler
    }

    // Find the player and set their profile image
    const playerIndex = players.findIndex(player => player.id === playerId);
    if (playerIndex !== -1) {
      players[playerIndex].profileImage = profileImage;

      // Aktualisieren Sie die Datenbank mit der neuen Spieler-Liste
      const updates: {[key: string]: Player[]} = {};
      updates[`room/${roomName}/players`] = players;

      await update(ref(db), updates);

      console.log(`Profile image for player ${playerId} in room ${roomName}`);
    } else {
      console.error(`Player ${playerId} not found in room ${roomName}`);
    }
  } catch (error) {
    console.error("Error setting player profile image: ", error);
  }
}
