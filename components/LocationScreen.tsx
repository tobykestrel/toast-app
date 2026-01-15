// Imports
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AwaitingStudentsList from "./AwaitingStudentsList";
import { Student, Teacher, getStuArrayByLocID, getStuArrayByLocIDAwaiting, getTeaArrayByLocID, initializeStuData } from "./LocalData";
import MoveStudentModal from "./MoveStudentModal";

type LocationScreenProps = {
  locID: string;
};

type StudentItemProps = {
  student: Student;
  isSelecting: boolean;
  isSelected: boolean;
  onPress: () => void;
  onMove: () => void;
};

const StudentItem = ({ student, isSelecting, isSelected, onPress, onMove }: StudentItemProps) => (
  <TouchableOpacity
    style={[
      styles.itemContainer,
      isSelected && styles.itemContainerSelected
    ]}
    onPress={isSelecting ? onPress : undefined}
    onLongPress={!isSelecting ? onPress : undefined}
    delayLongPress={500}
  >
    <Text style={styles.itemText}>{student.firstName} {student.lastName}</Text>
    {isSelecting ? (
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </View>
    ) : (
      <TouchableOpacity
        style={styles.moveButton}
        onPress={onMove}
      >
        <Text style={styles.moveButtonText}>Move</Text>
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

type TeacherItemProps = {
  teacher: Teacher;
  isSelecting: boolean;
  isSelected: boolean;
  onPress: () => void;
  onMove: () => void;
};

const TeacherItem = ({ teacher, isSelecting, isSelected, onPress, onMove }: TeacherItemProps) => (
  <TouchableOpacity
    style={[
      styles.itemContainer,
      isSelected && styles.itemContainerSelected
    ]}
    onPress={isSelecting ? onPress : undefined}
    onLongPress={!isSelecting ? onPress : undefined}
    delayLongPress={500}
  >
    <Text style={styles.itemText}>{teacher.firstName} {teacher.lastName}</Text>
    {isSelecting ? (
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </View>
    ) : (
      <TouchableOpacity
        style={styles.moveButton}
        onPress={onMove}
      >
        <Text style={styles.moveButtonText}>Move</Text>
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

const SelectionHeader = ({ count, onClose, onMoveAll, itemType = 'Student' }: { count: number; onClose: () => void; onMoveAll: () => void; itemType?: string }) => (
  <View style={styles.selectionHeader}>
    <TouchableOpacity onPress={onClose} style={styles.headerButton}>
      <Text style={styles.headerButtonText}>✕</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{count} {itemType}{count !== 1 ? 's' : ''} Selected</Text>
    <TouchableOpacity onPress={onMoveAll} style={styles.moveAllButton}>
      <Text style={styles.moveAllText}>Move All</Text>
    </TouchableOpacity>
  </View>
);

type StatsHeaderProps = {
  studentCount: number;
  teacherCount: number;
  studentsWithMeds: number;
  showStudents: boolean;
  onToggleView: (value: boolean) => void;
};

const StatsHeader = ({ studentCount, teacherCount, studentsWithMeds, showStudents, onToggleView }: StatsHeaderProps) => {
  const ratio = teacherCount > 0 ? (studentCount / teacherCount).toFixed(1) : 'N/A';
  
  return (
    <View style={styles.statsBox}>
      <View style={styles.statsContent}>
        {showStudents ? (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Students</Text>
              <Text style={styles.statValue}>{studentCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>With Meds</Text>
              <Text style={styles.statValue}>{studentsWithMeds}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ratio</Text>
              <Text style={styles.statValue}>{ratio} : 1</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Teachers</Text>
              <Text style={styles.statValue}>{teacherCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Student/Tea</Text>
              <Text style={styles.statValue}>{ratio}:1</Text>
            </View>
          </>
        )}
      </View>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>{showStudents ? 'Students' : 'Teachers'}</Text>
        <Switch
          value={showStudents}
          onValueChange={onToggleView}
          trackColor={{ false: '#555', true: '#48bb78' }}
          thumbColor={showStudents ? '#fff' : '#ccc'}
        />
      </View>
    </View>
  );
};

export default function LocationScreen({ locID }: LocationScreenProps) {
  // Load students at this location from AsyncStorage.
  const [students, setStudents] = useState<Student[]>([]);
  const [awaitingStudents, setAwaitingStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [showStudents, setShowStudents] = useState(true);
  const justActivatedIDRef = useRef<string | null>(null);
  
  const loadStudents = async () => {
    try {
      const stuArray = await getStuArrayByLocID(locID);
      const awaitingArray = await getStuArrayByLocIDAwaiting(locID);
      const teaArray = await getTeaArrayByLocID(locID);
      setStudents(stuArray);
      setAwaitingStudents(awaitingArray);
      setTeachers(teaArray);
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

  const handleItemPress = (id: string) => {
    // If we just activated selection mode with this same ID, ignore the press
    if (justActivatedIDRef.current === id) {
      justActivatedIDRef.current = null;
      return;
    }

    if (!isSelecting) {
      // Long press - activate selection mode
      justActivatedIDRef.current = id;
      setIsSelecting(true);
      if (showStudents) {
        setSelectedStudents(new Set([id]));
      } else {
        setSelectedTeachers(new Set([id]));
      }
    } else {
      // Toggle selection
      if (showStudents) {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(id)) {
          newSelected.delete(id);
          // Exit selection mode if no students are selected
          if (newSelected.size === 0) {
            setIsSelecting(false);
          }
        } else {
          newSelected.add(id);
        }
        setSelectedStudents(newSelected);
      } else {
        const newSelected = new Set(selectedTeachers);
        if (newSelected.has(id)) {
          newSelected.delete(id);
          // Exit selection mode if no teachers are selected
          if (newSelected.size === 0) {
            setIsSelecting(false);
          }
        } else {
          newSelected.add(id);
        }
        setSelectedTeachers(newSelected);
      }
    }
  };

  const handleMovePress = (id: string) => {
    // This is for the move button when not in selection mode
    if (showStudents) {
      setSelectedStudents(new Set([id]));
    } else {
      setSelectedTeachers(new Set([id]));
    }
    setModalVisible(true);
  };

  const handleExitSelection = () => {
    setIsSelecting(false);
    setSelectedStudents(new Set());
    setSelectedTeachers(new Set());
  };

  const handleMoveAll = () => {
    setModalVisible(true);
  };

  const handleMoveComplete = () => {
    setSelectedStudents(new Set());
    setSelectedTeachers(new Set());
    setIsSelecting(false);
    loadStudents();
  };

  if (loading) { return <Text>Loading students in {locID}...</Text>; }

  const selectedStudentObjects = students.filter(s => selectedStudents.has(s.id));
  const selectedTeacherObjects = teachers.filter(t => selectedTeachers.has(t.id));
  const studentsWithMeds = students.filter(s => s.hasMeds).length;
  const currentSelection = showStudents ? selectedStudents : selectedTeachers;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {isSelecting ? (
          <SelectionHeader
            count={currentSelection.size}
            onClose={handleExitSelection}
            onMoveAll={handleMoveAll}
            itemType={showStudents ? 'Student' : 'Teacher'}
          />
        ) : (
          <StatsHeader
            studentCount={students.length}
            teacherCount={teachers.length}
            studentsWithMeds={studentsWithMeds}
            showStudents={showStudents}
            onToggleView={setShowStudents}
          />
        )}
        <FlatList
          data={showStudents ? students : teachers}
          renderItem={({ item }) => showStudents ? (
            <StudentItem
              student={item as Student}
              isSelecting={isSelecting}
              isSelected={selectedStudents.has(item.id)}
              onPress={() => handleItemPress(item.id)}
              onMove={() => handleMovePress(item.id)}
            />
          ) : (
            <TeacherItem
              teacher={item as Teacher}
              isSelecting={isSelecting}
              isSelected={selectedTeachers.has(item.id)}
              onPress={() => handleItemPress(item.id)}
              onMove={() => handleMovePress(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={showStudents ? <AwaitingStudentsList students={awaitingStudents} onUpdate={loadStudents} /> : undefined}
        />
        <MoveStudentModal
          visible={modalVisible}
          students={showStudents ? selectedStudentObjects : selectedTeacherObjects as any}
          onClose={() => setModalVisible(false)}
          onMove={handleMoveComplete}
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
  statsBox: {
    backgroundColor: '#3c4755',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f35',
  },
  statsContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#48bb78',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  toggleLabel: {
    fontSize: 12,
    color: '#aaa',
    marginRight: 8,
  },
  selectionHeader: {
    backgroundColor: '#3c4755',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f35',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  moveAllButton: {
    backgroundColor: '#48bb78',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  moveAllText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemContainer: {
    backgroundColor: '#3c4755',
    padding: 10,
    marginVertical: 1,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContainerSelected: {
    backgroundColor: 'rgba(72, 187, 120, 0.2)',
    borderWidth: 2,
    borderColor: '#48bb78',
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkboxSelected: {
    backgroundColor: '#48bb78',
    borderColor: '#48bb78',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
