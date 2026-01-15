import React from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Student, updateStuConfirmArrival, updateStuRejectArrival } from './LocalData';

type AwaitingStudentsListProps = {
  students: Student[];
  onUpdate: () => void;
};

const AwaitingStudentItem = ({student, onConfirm, onReject}: {student: Student, onConfirm: ()=>void, onReject: ()=>void}) => (
  <View style={styles.itemContainer}>
    <Text style={styles.itemText}>{student.firstName} {student.lastName}</Text>
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
        <Text style={styles.buttonText}>✓</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={onReject}>
        <Text style={styles.buttonText}>✕</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function AwaitingStudentsList({students, onUpdate}: AwaitingStudentsListProps) {
  const handleConfirm = async (stuID: string) => {
    try {
      await updateStuConfirmArrival(stuID);
      onUpdate();
    } catch (err) {
      console.error(`Failed to confirm student ${stuID}:`, err);
    }
  };

  const handleReject = async (stuID: string) => {
    try {
      await updateStuRejectArrival(stuID);
      onUpdate();
    } catch (err) {
      console.error(`Failed to reject student ${stuID}:`, err);
    }
  };

  if (students.length === 0) { return null; }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Awaiting Confirmation</Text>
      <FlatList
        data={students}
        renderItem={({ item }) => (
          <AwaitingStudentItem
            student={item}
            onConfirm={() => handleConfirm(item.id)}
            onReject={() => handleReject(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 5,
    marginVertical: 10,
    borderTopWidth: 2,
    borderTopColor: '#ffa500',
    paddingTop: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffa500',
    marginBottom: 8,
    marginLeft: 5,
  },
  itemContainer: {
    backgroundColor: '#4a5568',
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 4,
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#48bb78',
  },
  rejectButton: {
    backgroundColor: '#f56565',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});
