import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";
import React from "react";

interface GenericButtonProps {
  onPress: () => void;
  title: string;
  backgroundColor?: string;
  fullWidth?: boolean;
  width?: number | string;  // Erlaube "string" für Breitenangaben wie "50%"
  textStyle?: TextStyle; // Neue Prop für den Textstil
  disabled?: boolean;
}

export const GenericButton = ({ onPress, title, backgroundColor = '#059669', fullWidth, width, textStyle, disabled }: GenericButtonProps) => {
  const dynamicButtonStyle: ViewStyle = {
    backgroundColor,
    ...(fullWidth ? { width: '100%' } : {}),
    ...(width ? { width } : {})
  };

  return (
      <TouchableOpacity disabled={disabled} onPress={onPress} style={disabled ? styles.disabled :[styles.button, dynamicButtonStyle]}>
        {/* Kombiniere Stile hier */}
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderColor: '#22D3EE',
    borderWidth: 2,
    borderStyle: 'solid',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
  },
  disabled: {
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  }
});

export default GenericButton;
