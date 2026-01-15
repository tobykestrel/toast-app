// Imports
import {Student, initializeStuData, getStuArrayByLocID, getStuArrayByLocIDAwaiting} from "../../components/LocalData";
import AwaitingStudentsList from "../../components/AwaitingStudentsList";
import MoveStudentModal from "../../components/MoveStudentModal";
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type StudentParams = {student: Student, onMove: (student: Student) => void};
const StudentItem = ({student, onMove}: StudentParams) => (
  <TouchableOpacity 
    style={styles.itemContainer}
    onLongPress={() => onMove(student)}
  >
    <Text style={styles.itemText}>{student.firstName} {student.lastName}</Text>
    <TouchableOpacity 
      style={styles.moveButton}
      onPress={() => onMove(student)}
    >
      <Text style={styles.moveButtonText}>Move</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function LocationScreen() {
  const { locID } = useLocalSearchParams();
  const locationID = typeof locID === 'string' ? locID : locID?.[0] || 'unknown';
  
  // Load students at this location from AsyncStorage.
  const [students, setStudents] = useState<Student[]>([]);
  const [awaitingStudents, setAwaitingStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const loadStudents = async () => {
    try {
      const stuArray = await getStuArrayByLocID(locationID);
      const awaitingArray = await getStuArrayByLocIDAwaiting(locationID);
      setStudents(stuArray);
      setAwaitingStudents(awaitingArray);
    } catch (err) {
      console.error(`Failed to load ${locationID} students:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initializeAndLoad() {
      try {
        await initializeStuData();
        await loadStudents();
      } catch (err) {
        console.error(`Failed to initialize ${locationID}:`, err);
        setLoading(false);
      }
    }
    initializeAndLoad();
  }, [locationID]);

  // Refresh data whenever this tab comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [locationID])
  );

  const handleOpenModal = (student: Student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedStudent(null);
  };

  const handleMoveStudent = () => {
    loadStudents();
  };

  if (loading) { return <Text>Loading students in {locationID}...</Text>; }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={students}
          renderItem={({ item }) => <StudentItem student={item} onMove={handleOpenModal} />}
          keyExtractor={(student) => student.id}
          ListHeaderComponent={ <AwaitingStudentsList students={awaitingStudents} onUpdate={loadStudents} /> }
        />
        <MoveStudentModal 
          visible={modalVisible}
          student={selectedStudent}
          onClose={handleCloseModal}
          onMove={handleMoveStudent}
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
  itemContainer: {
    backgroundColor: '#3c4755',
    padding: 5,
    marginVertical: 1,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 32,
    flex: 1,
  },
  moveButton: {
    backgroundColor: '#48bb78',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  moveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});
