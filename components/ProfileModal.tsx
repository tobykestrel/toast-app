import React from 'react';
import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Student, Teacher } from './LocalData';
import { useTheme } from '../constants/ThemeContext';

type PersonItem = Student | Teacher;

type ProfileModalProps = {
  visible: boolean;
  person: PersonItem | null;
  isStudent: boolean;
  onClose: () => void;
};

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

export default function ProfileModal({
  visible,
  person,
  isStudent,
  onClose,
}: ProfileModalProps) {
  const { colors } = useTheme();

  if (!person) return null;
  const student = person as Student;
  const daysText = student.days?.join(', ') || 'N/A';
  const borderColor = isStudent ? getGradeColor((person as Student).grade) : '#6b7280';

  const themedStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileModalContent: {
      backgroundColor: colors.containerSecondary,
      borderRadius: 12,
      padding: 20,
      width: '80%',
      maxWidth: 400,
      borderColor: `${borderColor}90`,
      borderWidth: 3,
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
      color: colors.text,
    },
    profileTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      marginRight: 30,
    },
    profileInfo: {
      maxHeight: 300,
    },
    profileRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    profileLabel: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '600',
    },
    profileValue: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
      textAlign: 'right',
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={themedStyles.modalOverlay}>
        <View style={themedStyles.profileModalContent}>
          <TouchableOpacity style={themedStyles.closeButton} onPress={onClose}>
            <Text style={themedStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={themedStyles.profileTitle}>{person.firstName} {person.lastName}</Text>

          <ScrollView style={themedStyles.profileInfo}>
            {isStudent && (
              <>
                <View style={themedStyles.profileRow}>
                  <Text style={themedStyles.profileLabel}>Days:</Text>
                  <Text style={themedStyles.profileValue}>{daysText}</Text>
                </View>
                <View style={themedStyles.profileRow}>
                  <Text style={themedStyles.profileLabel}>Grade:</Text>
                  <Text style={themedStyles.profileValue}>{getGradeLabel(student.grade)}</Text>
                </View>
                <View style={themedStyles.profileRow}>
                  <Text style={themedStyles.profileLabel}>Medication:</Text>
                  <Text style={themedStyles.profileValue}>{student.hasMeds ? 'Yes' : 'No'}</Text>
                </View>
              </>
            )}
            {!isStudent && (
              <View style={themedStyles.profileRow}>
                <Text style={themedStyles.profileLabel}>Days:</Text>
                <Text style={themedStyles.profileValue}>{daysText}</Text>
              </View>
            )}
            <View style={themedStyles.profileRow}>
              <Text style={themedStyles.profileLabel}>Location:</Text>
              <Text style={themedStyles.profileValue}>{person.currentLocID === 'none' ? 'N/A' : person.currentLocID}</Text>
            </View>
            <View style={themedStyles.profileRow}>
              <Text style={themedStyles.profileLabel}>DOB:</Text>
              <Text style={themedStyles.profileValue}>{person.dob}</Text>
            </View>
            <View style={themedStyles.profileRow}>
              <Text style={themedStyles.profileLabel}>ID:</Text>
              <Text style={themedStyles.profileValue}>{person.id}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
