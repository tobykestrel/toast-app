// Imports.
import {Student, initializeStuData, getStuArray} from "../../components/LocalData";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type ItemParams = {title: string};
const ListItem = ({title}: ItemParams) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
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
          renderItem={({ item }) => <ListItem title={item.firstName + " " + item.lastName} />}
          keyExtractor={(item) => item.id}
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
  item: {
    backgroundColor: '#3c4755',
    padding: 5,
    marginVertical: 1,
    marginHorizontal: 5,
  },
  title: {
    fontSize: 32,
  },
})