import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import EditStudentsScreen from "../../components/EditStudentsScreen";
import EditTeachersScreen from "../../components/EditTeachersScreen";
import { useTheme } from "../../constants/ThemeContext";

export default function SettingsScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const [showEditStudents, setShowEditStudents] = useState(false);
  const [showEditTeachers, setShowEditTeachers] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [warnThresholdEnabled, setWarnThresholdEnabled] = useState(true);
  const [warnThreshold, setWarnThreshold] = useState("");
  const [maxThresholdEnabled, setMaxThresholdEnabled] = useState(true);
  const [maxThreshold, setMaxThreshold] = useState("");
  const [notifyThresholdPassed, setNotifyThresholdPassed] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsJson = await AsyncStorage.getItem("settings");
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        setSiteName(settings.siteName || "");
        setWarnThresholdEnabled(settings.warnThresholdEnabled !== false);
        setWarnThreshold(settings.warnThreshold?.toString() || "10");
        setMaxThresholdEnabled(settings.maxThresholdEnabled !== false);
        setMaxThreshold(settings.maxThreshold?.toString() || "13");
        setNotifyThresholdPassed(settings.notifyThresholdPassed === true);
      } else {
        // Set defaults if no settings exist
        setWarnThreshold("10");
        setMaxThreshold("13");
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const saveSettings = useCallback(
    async (
      name: string,
      warnEnabled: boolean,
      warnVal: string,
      maxEnabled: boolean,
      maxVal: string,
      notifyVal: boolean,
    ) => {
      try {
        const settingsJson = await AsyncStorage.getItem("settings");
        const settings = settingsJson ? JSON.parse(settingsJson) : {};
        const updatedSettings = {
          ...settings,
          siteName: name || "Afterschool Toast",
          warnThresholdEnabled: warnEnabled,
          warnThreshold: warnEnabled && warnVal ? parseInt(warnVal) : 10,
          maxThresholdEnabled: maxEnabled,
          maxThreshold: maxEnabled && maxVal ? parseInt(maxVal) : 13,
          notifyThresholdPassed: notifyVal,
        };
        await AsyncStorage.setItem("settings", JSON.stringify(updatedSettings));
      } catch (err) {
        console.error("Failed to save settings:", err);
      }
    },
    [],
  );

  // Auto-save whenever any setting changes
  useEffect(() => {
    saveSettings(
      siteName,
      warnThresholdEnabled,
      warnThreshold,
      maxThresholdEnabled,
      maxThreshold,
      notifyThresholdPassed,
    );
  }, [
    siteName,
    warnThresholdEnabled,
    warnThreshold,
    maxThresholdEnabled,
    maxThreshold,
    notifyThresholdPassed,
    saveSettings,
  ]);

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
    content: {
      paddingVertical: 20,
      paddingHorizontal: 20,
      gap: 20,
      flexGrow: 1,
    },
    section: {
      backgroundColor: colors.container,
      borderRadius: 8,
      padding: 16,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textMuted,
      marginBottom: 8,
    },
    settingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
      fontWeight: "500",
    },
    button: {
      backgroundColor: colors.blue,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#ffffff",
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
      fontWeight: "500",
    },
    inputGroup: {
      marginBottom: 12,
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
    },
    checkboxLabel: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    thresholdControl: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    thresholdLabel: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    thresholdInputSmall: {
      backgroundColor: colors.background,
      borderColor: colors.divider,
      borderWidth: 1,
      borderRadius: 6,
      padding: 8,
      color: colors.text,
      fontSize: 14,
      width: 60,
      textAlign: "center",
    },
    thresholdControlRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
  });
  return (
    <SafeAreaProvider>
      <SafeAreaView style={themedStyles.container}>
        <ScrollView contentContainerStyle={themedStyles.content}>
          {/* Manage People Section */}
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
            <View style={themedStyles.thresholdControl}>
              <Text style={themedStyles.thresholdLabel}>Warn Threshold</Text>
              <View style={themedStyles.thresholdControlRight}>
                {warnThresholdEnabled && (
                  <TextInput
                    style={themedStyles.thresholdInputSmall}
                    placeholder="10"
                    placeholderTextColor={colors.textMuted}
                    value={warnThreshold}
                    onChangeText={setWarnThreshold}
                    keyboardType="numeric"
                  />
                )}
                <Switch
                  value={warnThresholdEnabled}
                  onValueChange={setWarnThresholdEnabled}
                  trackColor={{ false: "#cccccc", true: "#48bb78" }}
                  thumbColor={warnThresholdEnabled ? "#ffffff" : "#ffffff"}
                />
              </View>
            </View>
            <View style={themedStyles.thresholdControl}>
              <Text style={themedStyles.thresholdLabel}>Max Threshold</Text>
              <View style={themedStyles.thresholdControlRight}>
                {maxThresholdEnabled && (
                  <TextInput
                    style={themedStyles.thresholdInputSmall}
                    placeholder="13"
                    placeholderTextColor={colors.textMuted}
                    value={maxThreshold}
                    onChangeText={setMaxThreshold}
                    keyboardType="numeric"
                  />
                )}
                <Switch
                  value={maxThresholdEnabled}
                  onValueChange={setMaxThresholdEnabled}
                  trackColor={{ false: "#cccccc", true: "#48bb78" }}
                  thumbColor={maxThresholdEnabled ? "#ffffff" : "#ffffff"}
                />
              </View>
            </View>
            <View style={themedStyles.thresholdControl}>
              <Text style={themedStyles.thresholdLabel}>
                Notify When Threshold Passed
              </Text>
              <Switch
                value={notifyThresholdPassed}
                onValueChange={setNotifyThresholdPassed}
                trackColor={{ false: "#cccccc", true: "#48bb78" }}
                thumbColor={notifyThresholdPassed ? "#ffffff" : "#ffffff"}
              />
            </View>
          </View>

          {/* Appearance Section */}
          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>APPEARANCE</Text>
            <View style={themedStyles.settingRow}>
              <Text style={themedStyles.settingLabel}>Dark Mode</Text>
              <Switch
                value={theme === "dark"}
                onValueChange={toggleTheme}
                trackColor={{ false: "#cccccc", true: "#48bb78" }}
                thumbColor={theme === "dark" ? "#ffffff" : "#ffffff"}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
