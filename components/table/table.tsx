import { StyleSheet, Text, View } from "react-native";
import React, { ReactNode } from 'react';

interface TableComponentProps {
  header: ReactNode;
  rows: ReactNode[];
}

export const GenericTable = ({ header, rows }: TableComponentProps) => {
  return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>{header}</Text>
        </View>
        {rows.map((row, index) => (
            <View key={index} style={styles.rowContainer}>
              {row}
            </View>
        ))}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    width: '90%',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    borderBottomColor: '#ffffff',
    borderBottomWidth: 1,
  },
  headerContainer: {
    marginBottom: 10,
    borderBottomColor: '#ffffff',
    borderBottomWidth: 3,
  },
  rowContainer: {
    marginBottom: 10,
    borderBottomColor: '#ffffff',
    borderBottomWidth: 1,
  },
});

export default GenericTable;
