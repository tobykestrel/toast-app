// Imports
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AwaitingStudentsList from "./AwaitingStudentsList";
import { Student, getStuArrayByLocID, getStuArrayByLocIDAwaiting, initializeStuData } from "./LocalData";
import MoveStudentModal from "./MoveStudentModal";

type LocationScreenProps = {
  locID: string;
};

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

export default function LocationScreen({ locID }: LocationScreenProps) {
  // Load students at this location from AsyncStorage.
  const [students, setStudents] = useState<Student[]>([]);
  const [awaitingStudents, setAwaitingStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const loadStudents = async () => {
    try {
      const stuArray = await getStuArrayByLocID(locID);
      const awaitingArray = await getStuArrayByLocIDAwaiting(locID);
      setStudents(stuArray);
      setAwaitingStudents(awaitingArray);
    } catch (err) {
      console.error(`Failed to load ${locID} students:`, err);
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
        console.error(`Failed to initialize ${locID}:`, err);
        setLoading(false);
      }
    }
    initializeAndLoad();
  }, [locID]);

  // Refresh data whenever this tab comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [locID])
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

  if (loading) { return <Text>Loading students in {locID}...</Text>; }

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
