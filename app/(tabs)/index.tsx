// Imports.
import {Student, initializeStuData, getStuArray} from "../../components/LocalData";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type ItemParams = {listItemText: string};
const ListItem = ({listItemText}: ItemParams) => (
  <View style={styles.listItem}>
    <Text style={styles.listItemText}>{listItemText}</Text>
  </View>
);

export default function Index() {

  // Load students from AsyncStorage.
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadStudents() {
      try {
        await initializeStuData();
        const stuArray = await getStuArray();
        setStudents(stuArray);
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);
  if (loading) { return <Text>Loading students...</Text>; }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={students}
          renderItem={({ item }) => <ListItem listItemText={item.firstName + " " + item.lastName} />}
          keyExtractor={(listItem) => listItem.id}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#25292e',
    flex: 1,
  },
  listItem: {
    backgroundColor: '#3c4755',
    padding: 5,
    marginVertical: 1,
    marginHorizontal: 5,
  },
  listItemText: {
    fontSize: 32,
  },
})