import {StyleSheet, TextInput} from "react-native";
interface GenericTextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  style?: any;

}
export const GenericTextInput = ({ placeholder, value, onChangeText, secureTextEntry, keyboardType, style }: GenericTextInputProps) => {
  return (
      <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          style={[styles.textInput, style]}/>);
}
const styles = StyleSheet.create({
  textInput: {
    height: 40,
    margin: 12,
    padding: 10,
    color: '#000000',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  }
});
