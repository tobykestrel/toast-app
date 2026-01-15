// Imports.
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Student, Teacher, getStuArray, getTeaArray, initializeStuData, updateStuLocation } from "../../components/LocalData";

const getGradeColor = (grade: number): string => {
  switch (grade) {
    case 2: return '#3b82f6';
    case 3: return '#22c55e';
    case 4: return '#ef4444';
    default: return '#6b7280';
  }
};

const getGradeLabel = (grade: number): string => {
  return `${grade}${grade === 2 ? 'nd' : grade === 3 ? 'rd' : 'th'} Grade`;
};

const getLocationName = (locID: string): string => {
  const locationMap: { [key: string]: string } = {
    'loc001': 'Cafeteria',
    'loc002': 'Outside',
    'loc003': 'Gym',
  };
  return locationMap[locID] || locID;
};

const CustomCheckbox = ({ value, onValueChange }: { value: boolean; onValueChange: () => void }) => (
  <TouchableOpacity
    style={[styles.customCheckbox, value && styles.customCheckboxChecked]}
    onPress={onValueChange}
  >
    {value && <Text style={styles.checkmark}>✓</Text>}
  </TouchableOpacity>
);

type PersonItem = Student | Teacher;

const HomeStatsBar = ({
  totalStudents,
  totalTeachers,
  showTeachers,
  onToggleTeachers,
  showNonPresent,
  onToggleNonPresent,
  selectedGrades,
  onToggleGrade,
}: {
  totalStudents: number;
  totalTeachers: number;
  showTeachers: boolean;
  onToggleTeachers: (value: boolean) => void;
  showNonPresent: boolean;
  onToggleNonPresent: (value: boolean) => void;
  selectedGrades: Set<number>;
  onToggleGrade: (grade: number) => void;
}) => (
  <View style={styles.statsBox}>
    <View style={styles.statsContent}>
      {showTeachers ? (
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Teachers</Text>
          <Text style={styles.statValue}>{totalTeachers}</Text>
        </View>
      ) : (
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Students</Text>
          <Text style={styles.statValue}>{totalStudents}</Text>
        </View>
      )}
    </View>

    {!showTeachers && (
      <View style={styles.gradesContainer}>
        {[2, 3, 4].map((grade) => (
          <View key={grade} style={styles.gradeCheckboxHorizontal}>
            <CustomCheckbox
              value={selectedGrades.has(grade)}
              onValueChange={() => onToggleGrade(grade)}
            />
            <Text style={styles.gradeLabel}>{getGradeLabel(grade)}</Text>
          </View>
        ))}
      </View>
    )}

    <View style={styles.switchContainer}>
      <View style={styles.switchItem}>
        <Text style={styles.switchLabel}>Non-Present</Text>
        <Switch
          value={showNonPresent}
          onValueChange={onToggleNonPresent}
          trackColor={{ false: '#555', true: '#48bb78' }}
          thumbColor={showNonPresent ? '#fff' : '#ccc'}
        />
      </View>
      <View style={styles.switchItem}>
        <Text style={styles.switchLabel}>{showTeachers ? 'Teachers' : 'Students'}</Text>
        <Switch
          value={!showTeachers}
          onValueChange={(val) => onToggleTeachers(!val)}
          trackColor={{ false: '#555', true: '#48bb78' }}
          thumbColor={!showTeachers ? '#fff' : '#ccc'}
        />
      </View>
    </View>
  </View>
);

type PersonItemProps = {
  person: PersonItem;
  isStudent: boolean;
  onOptions: () => void;
};

const PersonListItem = ({ person, isStudent, onOptions }: PersonItemProps) => (
  <TouchableOpacity style={[styles.itemContainer, { borderLeftColor: isStudent ? getGradeColor((person as Student).grade) : '#6b7280', borderLeftWidth: 4 }]}>
    <View style={{ flex: 1 }}>
      <Text style={styles.itemText}>{person.firstName} {person.lastName}</Text>
      <Text style={styles.itemLocation}>{person.currentLocID === 'none' ? 'Not present' : getLocationName(person.currentLocID)}</Text>
    </View>
    <TouchableOpacity style={styles.optionsButton} onPress={onOptions}>
      <Text style={styles.optionsButtonText}>Options</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

const OptionsModal = ({
  visible,
  person,
  isStudent,
  onClose,
  onNotPresent,
  onViewProfile,
}: {
  visible: boolean;
  person: PersonItem | null;
  isStudent: boolean;
  onClose: () => void;
  onNotPresent: () => void;
  onViewProfile: () => void;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.optionsModalContent}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.modalTitle}>{person ? `${person.firstName} ${person.lastName}` : ''}</Text>

        <TouchableOpacity style={styles.optionButton} onPress={onNotPresent}>
          <Text style={styles.optionText}>Not-Present</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={onViewProfile}>
          <Text style={styles.optionText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionButton, styles.cancelButton]} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const ProfileModal = ({
  visible,
  person,
  isStudent,
  onClose,
}: {
  visible: boolean;
  person: PersonItem | null;
  isStudent: boolean;
  onClose: () => void;
}) => {
  if (!person) return null;
  const student = person as Student;
  const daysText = student.days?.join(', ') || 'N/A';
  const borderColor = isStudent ? getGradeColor(student.grade) : '#6b7280';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.profileModalContent, { borderColor: `${borderColor}90`, borderWidth: 3 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.profileTitle}>{person.firstName} {person.lastName}</Text>

          <ScrollView style={styles.profileInfo}>
            {isStudent && (
              <>
                <View style={styles.profileRow}>
                  <Text style={styles.profileLabel}>Days:</Text>
                  <Text style={styles.profileValue}>{daysText}</Text>
                </View>
                <View style={styles.profileRow}>
                  <Text style={styles.profileLabel}>Grade:</Text>
                  <Text style={styles.profileValue}>{getGradeLabel(student.grade)}</Text>
                </View>
                <View style={styles.profileRow}>
                  <Text style={styles.profileLabel}>Medication:</Text>
                  <Text style={styles.profileValue}>{student.hasMeds ? 'Yes' : 'No'}</Text>
                </View>
              </>
            )}
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Location:</Text>
              <Text style={styles.profileValue}>{person.currentLocID === 'none' ? 'N/A' : person.currentLocID}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>DOB:</Text>
              <Text style={styles.profileValue}>{person.dob}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>ID:</Text>
              <Text style={styles.profileValue}>{person.id}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function Index() {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTeachers, setShowTeachers] = useState(false);
  const [showNonPresent, setShowNonPresent] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<Set<number>>(new Set([2, 3, 4]));
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      await initializeStuData();
      const stuArray = await getStuArray();
      const teaArray = await getTeaArray();
      setAllStudents(stuArray);
      setAllTeachers(teaArray);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredData = showTeachers
    ? allTeachers
        .filter((t) => {
          if (!searchQuery.trim()) return true;
          const query = searchQuery.toLowerCase();
          return t.firstName.toLowerCase().includes(query) || t.lastName.toLowerCase().includes(query);
        })
        .sort((a, b) => {
          const fnCmp = a.firstName.localeCompare(b.firstName);
          return fnCmp !== 0 ? fnCmp : a.lastName.localeCompare(b.lastName);
        })
    : allStudents
        .filter((s) => selectedGrades.has(s.grade))
        .filter((s) => showNonPresent || s.present === true)
        .filter((s) => {
          if (!searchQuery.trim()) return true;
          const query = searchQuery.toLowerCase();
          return s.firstName.toLowerCase().includes(query) || s.lastName.toLowerCase().includes(query);
        })
        .sort((a, b) => {
          const fnCmp = a.firstName.localeCompare(b.firstName);
          return fnCmp !== 0 ? fnCmp : a.lastName.localeCompare(b.lastName);
        });

  const displayStudentCount = allStudents
    .filter((s) => selectedGrades.has(s.grade))
    .filter((s) => showNonPresent || s.present === true).length;
  const displayTeacherCount = allTeachers.length;

  const handleOptions = (person: PersonItem) => {
    setSelectedPerson(person);
    setOptionsModalVisible(true);
  };

  const handleNotPresent = async () => {
    if (selectedPerson && 'grade' in selectedPerson) {
      await updateStuLocation(selectedPerson.id, 'none');
      const updatedStudents = allStudents.map(s =>
        s.id === selectedPerson.id ? { ...s, present: false } : s
      );
      setAllStudents(updatedStudents);
      await loadData();
    }
    setOptionsModalVisible(false);
  };

  const handleViewProfile = () => {
    setOptionsModalVisible(false);
    setProfileModalVisible(true);
  };

  const handleToggleGrade = (grade: number) => {
    const newGrades = new Set(selectedGrades);
    if (newGrades.has(grade)) {
      newGrades.delete(grade);
    } else {
      newGrades.add(grade);
    }
    setSelectedGrades(newGrades);
  };

  if (loading) return <Text>Loading...</Text>;

  const totalStudents = filteredData.filter((p) => 'grade' in p).length;
  const totalTeachers = filteredData.filter((p) => !('grade' in p)).length;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <HomeStatsBar
          totalStudents={totalStudents}
          totalTeachers={totalTeachers}
          showTeachers={showTeachers}
          onToggleTeachers={setShowTeachers}
          showNonPresent={showNonPresent}
          onToggleNonPresent={setShowNonPresent}
          selectedGrades={selectedGrades}
          onToggleGrade={handleToggleGrade}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredData}
          renderItem={({ item }) => (
            <PersonListItem
              person={item}
              isStudent={'grade' in item}
              onOptions={() => handleOptions(item)}
            />
          )}
          keyExtractor={(item) => item.id}
        />
        <OptionsModal
          visible={optionsModalVisible}
          person={selectedPerson}
          isStudent={selectedPerson ? 'grade' in selectedPerson : false}
          onClose={() => setOptionsModalVisible(false)}
          onNotPresent={handleNotPresent}
          onViewProfile={handleViewProfile}
        />
        <ProfileModal
          visible={profileModalVisible}
          person={selectedPerson}
          isStudent={selectedPerson ? 'grade' in selectedPerson : false}
          onClose={() => setProfileModalVisible(false)}
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f35',
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
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
    marginBottom: 12,
    paddingHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  gradeCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  gradeCheckboxHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeLabel: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 12,
    color: '#aaa',
    marginRight: 8,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#aaa',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCheckboxChecked: {
    backgroundColor: '#48bb78',
    borderColor: '#48bb78',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemContainer: {
    backgroundColor: '#3c4755',
    padding: 12,
    marginVertical: 1,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  itemLocation: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  optionsButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 10,
  },
  optionsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModalContent: {
    backgroundColor: '#25292e',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  profileModalContent: {
    backgroundColor: '#25292e',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 10,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#3c4755',
    borderRadius: 6,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  cancelText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  profileInfo: {
    maxHeight: 400,
  },
  profileRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3c4755',
  },
  profileLabel: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: '600',
    width: 100,
  },
  profileValue: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
});