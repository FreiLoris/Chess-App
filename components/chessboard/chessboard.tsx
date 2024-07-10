import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { PanGestureHandler, PanGestureHandlerStateChangeEvent, State } from 'react-native-gesture-handler';
import {
  getCurrentPlayerId, getPlayerColor,
  getPlayerIdsFromRoom,
  getPlayersFromRoom,
  setCurrentPlayer,
  setPlayerColor, setRoomWinner, subscribeToBoardUpdates, updateBoardInFirebase
} from "../../service/room-service";
import {getPlayerId} from "../../service/async-storage-service";
import {BoardSetup, PieceImageKey, Player, RowType} from "../../service/moduls";

const pieceImages: Record<PieceImageKey, ReturnType<NodeRequire>> = {
  wb: require('../../assets/wb.png'),
  wk: require('../../assets/wk.png'),
  wn: require('../../assets/wn.png'),
  wp: require('../../assets/wp.png'),
  wq: require('../../assets/wq.png'),
  wr: require('../../assets/wr.png'),
  bb: require('../../assets/bb.png'),
  bk: require('../../assets/bk.png'),
  bn: require('../../assets/bn.png'),
  bp: require('../../assets/bp.png'),
  bq: require('../../assets/bq.png'),
  br: require('../../assets/br.png'),
};


const initialBoardSetup: BoardSetup = [
  ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
  ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
  ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'],
];

const CustomChessboard = ({room}: {room: string}) => {
  const [board, setBoard] = useState<BoardSetup>(initialBoardSetup);
  const [draggingPiece, setDraggingPiece] = useState<string | null>(null);
  const [draggingFromPosition, setDraggingFromPosition] = useState<{ row: number, col: number } | null>(null);
  const [whitePlayerId, setWhitePlayerId] = useState<string>();
  const [blackPlayerId, setBlackPlayerId] = useState<string>();
  // Reset dragging states when the board is re-rendered
  useEffect(() => {
    setDraggingPiece(null);
    setDraggingFromPosition(null);
    checkForWinner();
  }, [board]);

  useEffect(() => {
    const unsubscribe = subscribeToBoardUpdates(room, setBoard);
    const startNewGame = async () => {
      const players = await getPlayerIdsFromRoom(room);
      const randomIndex = Math.floor(Math.random() * players.length);
      const whitePlayer = players[randomIndex];
      const blackPlayer = players[1 - randomIndex];
      setWhitePlayerId(whitePlayer);
      setBlackPlayerId(blackPlayer);
      await setPlayerColor(room, whitePlayer, 'white');
      await setPlayerColor(room, blackPlayer, 'black');
      await setCurrentPlayer(room, whitePlayer);
    };

    startNewGame();
    // Unsubscribe from the listener when the component is unmounted
    return () => unsubscribe();
  }, []);
  const switchPlayer = async () => {
    const playerIds = await getPlayerIdsFromRoom(room);
    const currentPlayerId = await getPlayerId();

    // Switch to the other player
    const otherPlayerId = currentPlayerId === playerIds[0] ? playerIds[1] : playerIds[0];

    await setCurrentPlayer(room, otherPlayerId);
  };

  const checkForWinner = useCallback(() => {
    let whiteKingExists = false;
    let blackKingExists = false;
    for (const row of board) {
      for (const piece of row) {
        if (piece === 'wk') whiteKingExists = true;
        if (piece === 'bk') blackKingExists = true;
      }
    }
    if (!whiteKingExists) setRoomWinner(room, blackPlayerId!);
    if (!blackKingExists) setRoomWinner(room, whitePlayerId!);
  }, [board]);

  const onDrag = useCallback(async (piece: PieceImageKey, from: { row: number, col: number }, to: {
    row: number,
    col: number
  }) => {
    // Get the current user's ID from AsyncStorage
    const currentUserId = await getPlayerId();

    // Get the current player's ID from Firebase
    const currentPlayerId = await getCurrentPlayerId(room);

    // Get the current player's color from Firebase
    const currentPlayerColor = await getPlayerColor(room, currentPlayerId);

    // Only allow the move if the current user is the current player and the piece color matches the player's color
    if (currentUserId === currentPlayerId && piece[0].toLowerCase() === currentPlayerColor[0].toLowerCase()) {
      const newBoard: BoardSetup = board.map((row, i) => row.map((cell, j) => {
        if (i === from.row && j === from.col) return null;
        if (i === to.row && j === to.col) {
          // If a pawn reaches the other end of the board, promote it to a queen
          if (piece.toLowerCase() === 'wp' && to.row === 0) return 'wq';
          if (piece.toLowerCase() === 'bp' && to.row === 7) return 'bq';
          return piece;
        }
        return cell;
      }));
      setBoard(newBoard);
      switchPlayer();
      updateBoardInFirebase(room, newBoard);
    }
  }, [board]);
  const isPathClear = (from: { row: number, col: number }, to: { row: number, col: number }) => {
    const dx = to.col - from.col;
    const dy = to.row - from.row;
    const xStep = dx === 0 ? 0 : dx > 0 ? 1 : -1;
    const yStep = dy === 0 ? 0 : dy > 0 ? 1 : -1;
    let x = from.col + xStep;
    let y = from.row + yStep;
    while (x !== to.col || y !== to.row) {
      if (board[y][x] !== null) {
        return false;
      }
      x += xStep;
      y += yStep;
    }
    return true;
  };

  const isValidMove = (piece: string, from: { row: number, col: number }, to: { row: number, col: number }) => {
    const dx = to.col - from.col;
    const dy = to.row - from.row;
    const targetPiece = board[to.row][to.col];
    if (targetPiece && targetPiece[0] === piece[0]) {
      return false;
    }
    switch (piece.toLowerCase()) {
      case 'wk':
      case 'bk':
        // The king can move one square in any direction
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
      case 'wq':
      case 'bq':
        // The queen can move any number of squares along a rank, file, or diagonal
        return (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) && isPathClear(from, to);
      case 'wr':
      case 'br':
        // The rook can move any number of squares along a rank or file
        return (dx === 0 || dy === 0) && isPathClear(from, to);
      case 'wb':
      case 'bb':
        // The bishop can move any number of squares diagonally
        return Math.abs(dx) === Math.abs(dy) && isPathClear(from, to);
      case 'wn':
      case 'bn':
        // The knight moves to any of the squares immediately adjacent to it and then makes one further step at a right angle
        return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
      case 'wp':
        // The white pawn can move forward one square, with the option to move two squares if it has not yet moved
        // It can move diagonally only if it is capturing an opponent's piece
        return (dx === 0 && dy === -1 && targetPiece === null) ||
            (dx === 0 && dy === -2 && from.row === 6 && targetPiece === null) ||
            (Math.abs(dx) === 1 && dy === -1 && targetPiece !== null && targetPiece[0] === 'b');
      case 'bp':
        // The black pawn can move forward one square, with the option to move two squares if it has not yet moved
        // It can move diagonally only if it is capturing an opponent's piece
        return (dx === 0 && dy === 1 && targetPiece === null) ||
            (dx === 0 && dy === 2 && from.row === 1 && targetPiece === null) ||
            (Math.abs(dx) === 1 && dy === 1 && targetPiece !== null && targetPiece[0] === 'w');
      default:
        return false;
    }
  };

  const handleGesture = useCallback((event: PanGestureHandlerStateChangeEvent, piece: PieceImageKey, row: number, col: number) => {
    const { translationX, translationY, state } = event.nativeEvent;
    if (state === State.ACTIVE) {
      setDraggingPiece(piece);
      setDraggingFromPosition({ row, col });
    } else if (state === State.END) {
      let newRow = Math.round((row * 50 + translationY) / 50);
      let newCol = Math.round((col * 50 + translationX) / 50);
      // If the new position is outside the board, reset the piece to its original position
      if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) {
        setBoard(prevBoard => prevBoard.map((r, i) => r.map((c, j) => {
          if (i === row && j === col) return piece;
          return c;
        })));
      } else {
        // Only move the piece if the new position is different from the original position and the move is valid
        if (newRow !== row || newCol !== col) {
          if (isValidMove(piece, { row, col }, { row: newRow, col: newCol })) {
            onDrag(piece, { row, col }, { row: newRow, col: newCol });
          } else {
            // If the move is not valid, reset the piece to its original position
            setBoard(prevBoard => prevBoard.map((r, i) => r.map((c, j) => {
              if (i === row && j === col) return piece;
              return c;
            })));
          }
        }
      }
      setDraggingPiece(null);
      setDraggingFromPosition(null);
    }
  }, [onDrag]);

  const renderSquare = useCallback((i: number, j: number) => {
    const piece = board[i][j];
    const backgroundColor = (i + j) % 2 === 0 ? 'white' : 'gray';
    return (
        <View key={`${i}-${j}`} style={[styles.square, { backgroundColor }]}>
          {piece && (
              <PanGestureHandler
                  onGestureEvent={(e) => handleGesture(e as any, piece, i, j)}
                  onHandlerStateChange={(e) => handleGesture(e as any, piece, i, j)}
              >
                <Image source={pieceImages[piece]} style={styles.piece} />
              </PanGestureHandler>
          )}
        </View>
    );
  }, [board, handleGesture]);

  const renderRow = useCallback((i: number) => {
    const squares = [];
    for (let j = 0; j < 8; j++) {
      squares.push(renderSquare(i, j));
    }
    return <View key={i} style={styles.row}>{squares}</View>;
  }, [renderSquare]);

  const renderBoard = useMemo(() => {
    const rows = [];
    for (let i = 0; i < 8; i++) {
      rows.push(renderRow(i));
    }
    return rows;
  }, [renderRow]);

  return (
      <View style={styles.board}>
        {renderBoard}
      </View>
  );
};

const styles = StyleSheet.create({
  board: {
    width: 400,
    height: 400,
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  piece: {
    width: 50,
    height: 50,
  },
});

export default CustomChessboard;