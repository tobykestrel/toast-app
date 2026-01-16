import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../../constants/ThemeContext';
import EditStudentsScreen from '../../components/EditStudentsScreen';
import EditTeachersScreen from '../../components/EditTeachersScreen';

export default function SettingsScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const [showEditStudents, setShowEditStudents] = useState(false);
  const [showEditTeachers, setShowEditTeachers] = useState(false);

  if (showEditStudents) {
    return <EditStudentsScreen onBack={() => setShowEditStudents(false)} />;
  }

  if (showEditTeachers) {
    return <EditTeachersScreen onBack={() => setShowEditTeachers(false)} />;
  }

  const themedStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    content: {
      padding: 20,
      gap: 20,
    },
    section: {
      backgroundColor: colors.container,
      borderRadius: 8,
      padding: 16,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 8,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    settingRowLast: {
      borderBottomWidth: 0,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    button: {
      backgroundColor: colors.blue,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
  });

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.safeArea}>
        <View style={themedStyles.content}>
          {/* Theme Section */}
          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>APPEARANCE</Text>
            <View style={themedStyles.settingRow}>
              <Text style={themedStyles.settingLabel}>Dark Mode</Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: '#cccccc', true: '#48bb78' }}
                thumbColor={theme === 'dark' ? '#ffffff' : '#ffffff'}
              />
            </View>
          </View>

          {/* Edit Students Section */}
          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>MANAGE PEOPLE</Text>
            <TouchableOpacity
              style={themedStyles.button}
              onPress={() => setShowEditStudents(true)}
            >
              <Text style={themedStyles.buttonText}>Edit Students</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={themedStyles.button}
              onPress={() => setShowEditTeachers(true)}
            >
              <Text style={themedStyles.buttonText}>Edit Teachers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}