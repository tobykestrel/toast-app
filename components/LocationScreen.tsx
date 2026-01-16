// Imports
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AwaitingStudentsList from "./AwaitingStudentsList";
import ConfirmationModal from "./ConfirmationModal";
import CustomCheckbox from "./CustomCheckbox";
import { Student, Teacher, getStuArrayByLocID, getStuArrayByLocIDAwaiting, getTeaArrayByLocID, initializeStuData } from "./LocalData";
import MoveStudentModal from "./MoveStudentModal";
import { useTheme } from "../constants/ThemeContext";

// Ratio thresholds
const RATIO_WARN_THRESHOLD = 10;
const RATIO_MAX_THRESHOLD = 13;

const getLocationName = (locID: string): string => {
  const locationMap: { [key: string]: string } = {
    'loc001': 'Cafeteria',
    'loc002': 'Outside',
    'loc003': 'Gym',
  };
  return locationMap[locID] || locID;
};

type LocationScreenProps = {
  locID: string;
};

// Get color for grade border
const getGradeColor = (grade: number): string => {
  switch (grade) {
    case 2: return '#3b7df6'; // blue
    case 3: return '#1aa783'; // green
    case 4: return '#c45353'; // red
    default: return '#6b7280'; // gray
  }
};

type StudentItemProps = {
  student: Student;
  isSelecting: boolean;
  isSelected: boolean;
  onPress: () => void;
  onMove: () => void;
  colors: any;
};

const StudentItem = ({ student, isSelecting, isSelected, onPress, onMove, colors }: StudentItemProps) => {
  const themedStyles = StyleSheet.create({
    itemContainer: {
      backgroundColor: colors.container,
      padding: 12,
      marginVertical: 1,
      marginHorizontal: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemContainerSelected: {
      backgroundColor: colors.blue + '20',
    },
    itemText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    medsCross: {
      color: colors.accent,
    },
    moveButton: {
      backgroundColor: colors.accent,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 4,
      marginLeft: 10,
    },
    moveButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxSelected: {
      backgroundColor: colors.blue,
      borderColor: colors.blue,
    },
    checkmark: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <TouchableOpacity
      style={[
        themedStyles.itemContainer,
        { borderLeftColor: getGradeColor(student.grade), borderLeftWidth: 4 },
        isSelected && themedStyles.itemContainerSelected
      ]}
      onPress={isSelecting ? onPress : undefined}
      onLongPress={!isSelecting ? onPress : undefined}
      delayLongPress={500}
    >
      <View style={{ flex: 1 }}>
        <Text style={themedStyles.itemText}>
          {student.firstName} {student.lastName}
          {student.hasMeds && <Text style={themedStyles.medsCross}> ✚</Text>}
        </Text>
      </View>
      {isSelecting ? (
        <View style={[themedStyles.checkbox, isSelected && themedStyles.checkboxSelected]}>
          {isSelected && <Text style={themedStyles.checkmark}>✓</Text>}
        </View>
      ) : (
        <TouchableOpacity
          style={themedStyles.moveButton}
          onPress={onMove}
        >
          <Text style={themedStyles.moveButtonText}>Move</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

type TeacherItemProps = {
  teacher: Teacher;
  isSelecting: boolean;
  isSelected: boolean;
  onPress: () => void;
  onMove: () => void;
  colors: any;
};

const TeacherItem = ({ teacher, isSelecting, isSelected, onPress, onMove, colors }: TeacherItemProps) => {
  const themedStyles = StyleSheet.create({
    itemContainer: {
      backgroundColor: colors.container,
      padding: 12,
      marginVertical: 1,
      marginHorizontal: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemContainerSelected: {
      backgroundColor: colors.blue + '20',
    },
    itemText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    moveButton: {
      backgroundColor: colors.accent,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 4,
      marginLeft: 10,
    },
    moveButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxSelected: {
      backgroundColor: colors.blue,
      borderColor: colors.blue,
    },
    checkmark: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <TouchableOpacity
      style={[
        themedStyles.itemContainer,
        isSelected && themedStyles.itemContainerSelected
      ]}
      onPress={isSelecting ? onPress : undefined}
      onLongPress={!isSelecting ? onPress : undefined}
      delayLongPress={500}
    >
      <Text style={themedStyles.itemText}>{teacher.firstName} {teacher.lastName}</Text>
      {isSelecting ? (
        <View style={[themedStyles.checkbox, isSelected && themedStyles.checkboxSelected]}>
          {isSelected && <Text style={themedStyles.checkmark}>✓</Text>}
        </View>
      ) : (
        <TouchableOpacity
          style={themedStyles.moveButton}
          onPress={onMove}
        >
          <Text style={themedStyles.moveButtonText}>Move</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const SelectionHeader = ({ count, onClose, onMoveAll, itemType = 'Student', colors }: { count: number; onClose: () => void; onMoveAll: () => void; itemType?: string; colors: any }) => {
  const themedStyles = StyleSheet.create({
    selectionHeader: {
      backgroundColor: colors.container,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerButton: {
      padding: 8,
    },
    headerButtonText: {
      fontSize: 20,
      color: colors.text,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    moveAllButton: {
      backgroundColor: colors.accent,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
    },
    moveAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
    },
  });

  return (
    <View style={themedStyles.selectionHeader}>
      <TouchableOpacity onPress={onClose} style={themedStyles.headerButton}>
        <Text style={themedStyles.headerButtonText}>✕</Text>
      </TouchableOpacity>
      <Text style={themedStyles.headerTitle}>{count} {itemType}{count !== 1 ? 's' : ''} Selected</Text>
      <TouchableOpacity onPress={onMoveAll} style={themedStyles.moveAllButton}>
        <Text style={themedStyles.moveAllText}>Move All</Text>
      </TouchableOpacity>
    </View>
  );
};

type StatsHeaderProps = {
  studentCount: number;
  teacherCount: number;
  showStudents: boolean;
  onToggleView: (value: boolean) => void;
  selectedGrades: Set<number>;
  onToggleGrade: (grade: number) => void;
  colors: any;
};

const getGradeLabel = (grade: number): string => {
  return `${grade}${grade === 2 ? 'nd' : grade === 3 ? 'rd' : 'th'} Grade`;
};

const getRatioColor = (ratio: number): string => {
  if (ratio > RATIO_MAX_THRESHOLD) return '#ef4444'; // red
  if (ratio > RATIO_WARN_THRESHOLD) return '#eab308'; // yellow
  return '#48bb78';
};

const StatsHeader = ({ studentCount, teacherCount, showStudents, onToggleView, selectedGrades, onToggleGrade, colors }: StatsHeaderProps) => {
  const ratio = teacherCount > 0 ? (studentCount / teacherCount) : 0;
  const ratioText = teacherCount > 0 ? ratio.toFixed(1) : 'N/A';
  
  const themedStyles = StyleSheet.create({
    statsBox: {
      backgroundColor: colors.container,
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statsTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    statsContent: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      flex: 1,
    },
    statItem: {
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.accent,
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    toggleLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    gradesContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
    },
    gradeCheckbox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    gradeLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
  });

  return (
    <View style={themedStyles.statsBox}>
      <View style={themedStyles.statsTopRow}>
        <View style={themedStyles.statsContent}>
          {showStudents ? (
            <>
              <View style={themedStyles.statItem}>
                <Text style={themedStyles.statLabel}>Students</Text>
                <Text style={themedStyles.statValue}>{studentCount}</Text>
              </View>
              <View style={themedStyles.statItem}>
                <Text style={themedStyles.statLabel}>Ratio</Text>
                <Text style={[themedStyles.statValue, { color: getRatioColor(ratio) }]}>{ratioText} : 1</Text>
              </View>
            </>
          ) : (
            <>
              <View style={themedStyles.statItem}>
                <Text style={themedStyles.statLabel}>Teachers</Text>
                <Text style={themedStyles.statValue}>{teacherCount}</Text>
              </View>
              <View style={themedStyles.statItem}>
                <Text style={themedStyles.statLabel}>Ratio</Text>
                <Text style={[themedStyles.statValue, { color: getRatioColor(ratio) }]}>{ratioText} : 1</Text>
              </View>
            </>
          )}
        </View>

        <View style={themedStyles.toggleContainer}>
          <Text style={themedStyles.toggleLabel}>{showStudents ? 'Students' : 'Teachers'}</Text>
          <Switch
            value={showStudents}
            onValueChange={onToggleView}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={showStudents ? colors.text : colors.textMuted}
          />
        </View>
      </View>

      {showStudents && (
        <View style={themedStyles.gradesContainer}>
          {[2, 3, 4].map((grade) => (
            <View key={grade} style={themedStyles.gradeCheckbox}>
              <CustomCheckbox
                value={selectedGrades.has(grade)}
                onValueChange={() => onToggleGrade(grade)}
                color={getGradeColor(grade)}
                size="small"
              />
              <Text style={themedStyles.gradeLabel}>{getGradeLabel(grade)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function LocationScreen({ locID }: LocationScreenProps) {
  const { colors } = useTheme();
  
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
  const [selectedGrades, setSelectedGrades] = useState<Set<number>>(new Set([2, 3, 4]));
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationCallback, setConfirmationCallback] = useState<(() => void) | null>(null);
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

  // Sort students and teachers alphabetically by first name, then last name, filtered by grade
  const sortedStudents = [...students]
    .filter(s => selectedGrades.has(s.grade))
    .filter(s => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return s.firstName.toLowerCase().includes(query) || s.lastName.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      const firstNameCompare = a.firstName.localeCompare(b.firstName);
      return firstNameCompare !== 0 ? firstNameCompare : a.lastName.localeCompare(b.lastName);
    });

  const sortedTeachers = [...teachers]
    .filter(t => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return t.firstName.toLowerCase().includes(query) || t.lastName.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      const firstNameCompare = a.firstName.localeCompare(b.firstName);
      return firstNameCompare !== 0 ? firstNameCompare : a.lastName.localeCompare(b.lastName);
    });

  const sortedAwaitingStudents = [...awaitingStudents]
    .filter(s => selectedGrades.has(s.grade))
    .filter(s => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return s.firstName.toLowerCase().includes(query) || s.lastName.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      const firstNameCompare = a.firstName.localeCompare(b.firstName);
      return firstNameCompare !== 0 ? firstNameCompare : a.lastName.localeCompare(b.lastName);
    });

  const selectedStudentObjects = students.filter(s => selectedStudents.has(s.id));
  const selectedTeacherObjects = teachers.filter(t => selectedTeachers.has(t.id));
  const currentSelection = showStudents ? selectedStudents : selectedTeachers;

  const handleToggleGrade = (grade: number) => {
    const newGrades = new Set(selectedGrades);
    if (newGrades.has(grade)) {
      newGrades.delete(grade);
    } else {
      newGrades.add(grade);
    }
    setSelectedGrades(newGrades);
  };

  const themedStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    searchBar: {
      backgroundColor: colors.container,
      color: colors.text,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginHorizontal: 12,
      marginVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 14,
    },
    itemContainer: {
      backgroundColor: colors.container,
      padding: 12,
      marginVertical: 1,
      marginHorizontal: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemContainerSelected: {
      backgroundColor: colors.blue + '20',
    },
    itemText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    medsCross: {
      color: colors.accent,
    },
    moveButton: {
      backgroundColor: colors.blue,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 4,
      marginLeft: 10,
    },
    moveButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxSelected: {
      backgroundColor: colors.blue,
      borderColor: colors.blue,
    },
    checkmark: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={themedStyles.container}>
        {isSelecting ? (
          <SelectionHeader
            count={currentSelection.size}
            onClose={handleExitSelection}
            onMoveAll={handleMoveAll}
            itemType={showStudents ? 'Student' : 'Teacher'}
            colors={colors}
          />
        ) : (
          <StatsHeader
            studentCount={sortedStudents.length}
            teacherCount={sortedTeachers.length}
            showStudents={showStudents}
            onToggleView={setShowStudents}
            selectedGrades={selectedGrades}
            onToggleGrade={handleToggleGrade}
            colors={colors}
          />
        )}
        <TextInput
          style={themedStyles.searchBar}
          placeholder="Search by name..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={showStudents ? sortedStudents : sortedTeachers}
          renderItem={({ item }) => showStudents ? (
            <StudentItem
              student={item as Student}
              isSelecting={isSelecting}
              isSelected={selectedStudents.has(item.id)}
              onPress={() => handleItemPress(item.id)}
              onMove={() => handleMovePress(item.id)}
              colors={colors}
            />
          ) : (
            <TeacherItem
              teacher={item as Teacher}
              isSelecting={isSelecting}
              isSelected={selectedTeachers.has(item.id)}
              onPress={() => handleItemPress(item.id)}
              onMove={() => handleMovePress(item.id)}
              colors={colors}
            />
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={showStudents ? <AwaitingStudentsList students={sortedAwaitingStudents} onUpdate={loadStudents} /> : undefined}
        />
        <MoveStudentModal
          visible={modalVisible}
          students={showStudents ? selectedStudentObjects : selectedTeacherObjects as any}
          onClose={() => setModalVisible(false)}
          onMove={handleMoveComplete}
          currentLocID={locID}
          onConfirmationNeeded={(message, callback) => {
            setConfirmationMessage(message);
            setConfirmationCallback(() => callback);
            setConfirmationVisible(true);
          }}
        />
        <ConfirmationModal
          visible={confirmationVisible}
          title={confirmationMessage}
          onCancel={() => setConfirmationVisible(false)}
          onConfirm={() => {
            confirmationCallback?.();
            setConfirmationVisible(false);
          }}
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
  searchBar: {
    backgroundColor: '#3c4755',
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    fontSize: 14,
  },
  statsBox: {
    backgroundColor: '#3c4755',
    flexDirection: 'column',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f35',
  },
  statsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  gradesContainer: {
    marginTop: 12,
    paddingHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gradeCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeLabel: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 8,
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
    borderWidth: .3,
    borderColor: '#48bb78',
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  medsCross: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
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
