import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../constants/ThemeContext';
import { Student, getStuArray, updateStuProfile } from './LocalData';
import CustomCheckbox from './CustomCheckbox';
import ProfileModal from './ProfileModal';


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

type EditStudentsScreenProps = {
  onBack: () => void;
};

export default function EditStudentsScreen({ onBack }: EditStudentsScreenProps) {
  const { colors } = useTheme();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrades, setSelectedGrades] = useState<Set<number>>(new Set([2, 3, 4]));
  const [loading, setLoading] = useState(true);
  const [profileVisible, setProfileVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<Partial<Student>>({});

  const loadStudents = useCallback(async () => {
    try {
      const stuArray = await getStuArray();
      setStudents(stuArray);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [loadStudents])
  );

  useEffect(() => {
    let filtered = students
      .filter(s => selectedGrades.has(s.grade))
      .filter(s => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return s.firstName.toLowerCase().includes(query) || s.lastName.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        const fnCmp = a.firstName.localeCompare(b.firstName);
        return fnCmp !== 0 ? fnCmp : a.lastName.localeCompare(b.lastName);
      });
    setFilteredStudents(filtered);
  }, [students, searchQuery, selectedGrades]);

  const handleToggleGrade = (grade: number) => {
    const newGrades = new Set(selectedGrades);
    if (newGrades.has(grade)) {
      newGrades.delete(grade);
    } else {
      newGrades.add(grade);
    }
    setSelectedGrades(newGrades);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setEditForm({
      firstName: student.firstName,
      lastName: student.lastName,
      dob: student.dob,
      grade: student.grade,
      hasMeds: student.hasMeds,
      days: [...student.days],
    });
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedStudent) return;
    try {
      await updateStuProfile(selectedStudent.id, editForm);
      await loadStudents();
      setEditVisible(false);
      setSelectedStudent(null);
    } catch (err) {
      console.error('Failed to save student:', err);
    }
  };


  const toggleDay = (day: string) => {
    const currentDays = editForm.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setEditForm(prev => ({ ...prev, days: newDays }));
  };

  const themedStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    header: {
      backgroundColor: colors.container,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backButton: {
      padding: 8,
    },
    backButtonText: {
      fontSize: 18,
      color: colors.text,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
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
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 12,
      justifyContent: 'center',
    },
    filterCheckbox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    filterLabel: {
      color: colors.textMuted,
      fontSize: 12,
    },
    studentItem: {
      backgroundColor: colors.container,
      padding: 12,
      marginVertical: 1,
      marginHorizontal: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderLeftWidth: 4,
    },
    studentInfo: {
      flex: 1,
    },
    studentName: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    studentGrade: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
    },
    studentButtonRow: {
      flexDirection: 'row',
      gap: 8,
    },
    button: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 4,
    },
    viewButton: {
      backgroundColor: colors.blue,
    },
    editButton: {
      backgroundColor: colors.accent,
    },
    buttonText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#ffffff',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.containerSecondary,
      borderRadius: 12,
      padding: 20,
      width: '90%',
      maxWidth: 500,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    formGroup: {
      marginBottom: 12,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.container,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      padding: 10,
      fontSize: 14,
    },
    dropdown: {
      backgroundColor: colors.container,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      padding: 10,
      color: colors.text,
    },
    daysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    dayCheckbox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 0.48,
    },
    medsCheckbox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
    },
    medsLabel: {
      fontSize: 14,
      color: colors.text,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.red,
      paddingVertical: 12,
      borderRadius: 6,
      alignItems: 'center',
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.accent,
      paddingVertical: 12,
      borderRadius: 6,
      alignItems: 'center',
    },
  });

  if (loading) {
    return (
      <View style={themedStyles.container}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.header}>
        <TouchableOpacity style={themedStyles.backButton} onPress={onBack}>
          <Text style={themedStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>Edit Students</Text>
      </View>

      <TextInput
        style={themedStyles.searchBar}
        placeholder="Search by name..."
        placeholderTextColor={colors.textMuted}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={themedStyles.filterContainer}>
        {[2, 3, 4].map((grade) => (
          <TouchableOpacity
            key={grade}
            style={themedStyles.filterCheckbox}
            onPress={() => handleToggleGrade(grade)}
          >
            <CustomCheckbox
              value={selectedGrades.has(grade)}
              onValueChange={() => handleToggleGrade(grade)}
              color={getGradeColor(grade)}
              size="small"
            />
            <Text style={themedStyles.filterLabel}>{getGradeLabel(grade)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={({ item }) => (
          <View style={[themedStyles.studentItem, { borderLeftColor: getGradeColor(item.grade) }]}>
            <View style={themedStyles.studentInfo}>
              <Text style={themedStyles.studentName}>{item.firstName} {item.lastName}</Text>
              <Text style={themedStyles.studentGrade}>{getGradeLabel(item.grade)}</Text>
            </View>
            <View style={themedStyles.studentButtonRow}>
              <TouchableOpacity
                style={[themedStyles.button, themedStyles.viewButton]}
                onPress={() => {
                  setSelectedStudent(item);
                  setProfileVisible(true);
                }}
              >
                <Text style={themedStyles.buttonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[themedStyles.button, themedStyles.editButton]}
                onPress={() => handleEditStudent(item)}
              >
                <Text style={themedStyles.buttonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      <ProfileModal
        visible={profileVisible}
        person={selectedStudent}
        isStudent={true}
        onClose={() => setProfileVisible(false)}
      />

      <Modal visible={editVisible} transparent animationType="fade">
        <View style={themedStyles.modalOverlay}>
          <View style={themedStyles.modalContent}>
            <Text style={themedStyles.modalTitle}>Edit Student</Text>

            <View style={themedStyles.formGroup}>
              <Text style={themedStyles.label}>First Name</Text>
              <TextInput
                style={themedStyles.input}
                value={editForm.firstName || ''}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, firstName: text }))}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={themedStyles.formGroup}>
              <Text style={themedStyles.label}>Last Name</Text>
              <TextInput
                style={themedStyles.input}
                value={editForm.lastName || ''}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, lastName: text }))}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={themedStyles.formGroup}>
              <Text style={themedStyles.label}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput
                style={themedStyles.input}
                value={editForm.dob || ''}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, dob: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={themedStyles.formGroup}>
              <Text style={themedStyles.label}>Grade</Text>
              <View style={themedStyles.daysContainer}>
                {[2, 3, 4].map((grade) => (
                  <TouchableOpacity
                    key={grade}
                    style={[themedStyles.dayCheckbox]}
                    onPress={() => setEditForm(prev => ({ ...prev, grade }))}
                  >
                    <CustomCheckbox
                      value={editForm.grade === grade}
                      onValueChange={() => setEditForm(prev => ({ ...prev, grade }))}
                      color={getGradeColor(grade)}
                      size="small"
                    />
                    <Text style={themedStyles.filterLabel}>{getGradeLabel(grade)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={themedStyles.formGroup}>
              <Text style={themedStyles.label}>Days</Text>
              <View style={themedStyles.daysContainer}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={themedStyles.dayCheckbox}
                    onPress={() => toggleDay(day)}
                  >
                    <CustomCheckbox
                      value={(editForm.days || []).includes(day)}
                      onValueChange={() => toggleDay(day)}
                      color={colors.blue}
                      size="small"
                    />
                    <Text style={themedStyles.filterLabel}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={themedStyles.medsCheckbox}>
              <CustomCheckbox
                value={editForm.hasMeds || false}
                onValueChange={() => setEditForm(prev => ({ ...prev, hasMeds: !prev.hasMeds }))}
                color={colors.red}
                size="small"
              />
              <Text style={themedStyles.medsLabel}>Requires Medication</Text>
            </View>

            <View style={themedStyles.buttonRow}>
              <TouchableOpacity
                style={themedStyles.cancelButton}
                onPress={() => {
                  setEditVisible(false);
                  setSelectedStudent(null);
                }}
              >
                <Text style={themedStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={themedStyles.saveButton}
                onPress={handleSaveEdit}
              >
                <Text style={themedStyles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
