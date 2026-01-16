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
import { Teacher, getTeaArray, updateTeaProfile } from './LocalData';
import CustomCheckbox from './CustomCheckbox';
import ProfileModal from './ProfileModal';


type EditTeachersScreenProps = {
  onBack: () => void;
};

export default function EditTeachersScreen({ onBack }: EditTeachersScreenProps) {
  const { colors } = useTheme();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileVisible, setProfileVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [editForm, setEditForm] = useState<Partial<Teacher>>({});

  const loadTeachers = useCallback(async () => {
    try {
      const teaArray = await getTeaArray();
      setTeachers(teaArray);
    } catch (err) {
      console.error('Failed to load teachers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTeachers();
    }, [loadTeachers])
  );

  useEffect(() => {
    let filtered = teachers
      .filter(t => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return t.firstName.toLowerCase().includes(query) || t.lastName.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        const fnCmp = a.firstName.localeCompare(b.firstName);
        return fnCmp !== 0 ? fnCmp : a.lastName.localeCompare(b.lastName);
      });
    setFilteredTeachers(filtered);
  }, [teachers, searchQuery]);

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditForm({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      dob: teacher.dob,
      days: [...teacher.days],
    });
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTeacher) return;
    try {
      await updateTeaProfile(selectedTeacher.id, editForm);
      await loadTeachers();
      setEditVisible(false);
      setSelectedTeacher(null);
    } catch (err) {
      console.error('Failed to save teacher:', err);
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
    teacherItem: {
      backgroundColor: colors.container,
      padding: 12,
      marginVertical: 1,
      marginHorizontal: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    teacherInfo: {
      flex: 1,
    },
    teacherName: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    teacherButtonRow: {
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
    filterLabel: {
      fontSize: 12,
      color: colors.textMuted,
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
        <Text style={themedStyles.headerTitle}>Edit Teachers</Text>
      </View>

      <TextInput
        style={themedStyles.searchBar}
        placeholder="Search by name..."
        placeholderTextColor={colors.textMuted}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredTeachers}
        renderItem={({ item }) => (
          <View style={themedStyles.teacherItem}>
            <View style={themedStyles.teacherInfo}>
              <Text style={themedStyles.teacherName}>{item.firstName} {item.lastName}</Text>
            </View>
            <View style={themedStyles.teacherButtonRow}>
              <TouchableOpacity
                style={[themedStyles.button, themedStyles.viewButton]}
                onPress={() => {
                  setSelectedTeacher(item);
                  setProfileVisible(true);
                }}
              >
                <Text style={themedStyles.buttonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[themedStyles.button, themedStyles.editButton]}
                onPress={() => handleEditTeacher(item)}
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
        person={selectedTeacher}
        isStudent={false}
        onClose={() => setProfileVisible(false)}
      />

      <Modal visible={editVisible} transparent animationType="fade">
        <View style={themedStyles.modalOverlay}>
          <View style={themedStyles.modalContent}>
            <Text style={themedStyles.modalTitle}>Edit Teacher</Text>

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

            <View style={themedStyles.buttonRow}>
              <TouchableOpacity
                style={themedStyles.cancelButton}
                onPress={() => {
                  setEditVisible(false);
                  setSelectedTeacher(null);
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
