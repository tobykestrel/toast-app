import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../constants/ThemeContext';
import EditStudentsScreen from '../../components/EditStudentsScreen';
import EditTeachersScreen from '../../components/EditTeachersScreen';

export default function SettingsScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const [showEditStudents, setShowEditStudents] = useState(false);
  const [showEditTeachers, setShowEditTeachers] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [warnThreshold, setWarnThreshold] = useState('');
  const [maxThreshold, setMaxThreshold] = useState('');
  const [notifyThresholdPassed, setNotifyThresholdPassed] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsJson = await AsyncStorage.getItem('settings');
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        setSiteName(settings.siteName || '');
        setWarnThreshold(settings.warnThreshold?.toString() || '');
        setMaxThreshold(settings.maxThreshold?.toString() || '');
        setNotifyThresholdPassed(settings.notifyThresholdPassed || false);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const saveSettings = async () => {
    try {
      const settingsJson = await AsyncStorage.getItem('settings');
      const settings = settingsJson ? JSON.parse(settingsJson) : {};
      const updatedSettings = {
        ...settings,
        siteName: siteName || 'Afterschool Toast',
        warnThreshold: warnThreshold ? parseInt(warnThreshold) : 10,
        maxThreshold: maxThreshold ? parseInt(maxThreshold) : 13,
        notifyThresholdPassed,
      };
      await AsyncStorage.setItem('settings', JSON.stringify(updatedSettings));
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

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
    input: {
      backgroundColor: colors.background,
      borderColor: colors.divider,
      borderWidth: 1,
      borderRadius: 6,
      padding: 10,
      color: colors.text,
      fontSize: 14,
    },
    inputLabel: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 6,
      fontWeight: '500',
    },
    inputGroup: {
      marginBottom: 12,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    checkboxLabel: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
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

          {/* Site Settings Section */}
          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>SITE SETTINGS</Text>
            <View style={themedStyles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Site Name</Text>
              <TextInput
                style={themedStyles.input}
                placeholder="Site Name"
                placeholderTextColor={colors.textMuted}
                value={siteName}
                onChangeText={setSiteName}
              />
            </View>
            <View style={themedStyles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Warn Threshold</Text>
              <TextInput
                style={themedStyles.input}
                placeholder="Warn Threshold"
                placeholderTextColor={colors.textMuted}
                value={warnThreshold}
                onChangeText={setWarnThreshold}
                keyboardType="numeric"
              />
            </View>
            <View style={themedStyles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Max Threshold</Text>
              <TextInput
                style={themedStyles.input}
                placeholder="Max Threshold"
                placeholderTextColor={colors.textMuted}
                value={maxThreshold}
                onChangeText={setMaxThreshold}
                keyboardType="numeric"
              />
            </View>
            <View style={themedStyles.checkboxRow}>
              <Text style={themedStyles.checkboxLabel}>Notify When Threshold Passed</Text>
              <Switch
                value={notifyThresholdPassed}
                onValueChange={setNotifyThresholdPassed}
                trackColor={{ false: '#cccccc', true: '#48bb78' }}
                thumbColor={notifyThresholdPassed ? '#ffffff' : '#ffffff'}
              />
            </View>
            <TouchableOpacity
              style={[themedStyles.button, { marginTop: 12 }]}
              onPress={saveSettings}
            >
              <Text style={themedStyles.buttonText}>Save Settings</Text>
            </TouchableOpacity>
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