// Imports.
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import CustomCheckbox from "../../components/CustomCheckbox";
import {
  Student,
  Teacher,
  getLocArray,
  getStuArray,
  getTeaArray,
  getGruArray,
  initializeStuData,
  updateStuPresent,
  updateStuAbsent,
  updateTeaPresent,
  updateTeaAbsent,
} from "../../components/LocalData";
import { useTheme } from "../../constants/ThemeContext";

type PersonItem = Student | Teacher;
type PersonItemProps = {
  person: PersonItem;
  isStudent: boolean;
  onOptions: () => void;
  colors: any;
  locationMap: { [key: string]: string };
  colorMap: { [key: string]: string };
};

const HomeStatsBar = ({
  totalStudents,
  totalTeachers,
  showTeachers,
  onToggleTeachers,
  showPresent,
  onTogglePresent,
  selectedGroups,
  onToggleGroup,
  colors,
  colorMap,
  labelMap,
  groupIds,
}: {
  totalStudents: number;
  totalTeachers: number;
  showTeachers: boolean;
  onToggleTeachers: (value: boolean) => void;
  showPresent: boolean;
  onTogglePresent: (value: boolean) => void;
  selectedGroups: Set<string>;
  onToggleGroup: (group: string) => void;
  colors: any;
  colorMap: { [key: string]: string };
  labelMap: { [key: string]: string };
  groupIds: string[];
}) => {
  const themedStyles = StyleSheet.create({
    statsBox: {
      backgroundColor: colors.container,
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statsContent: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 12,
    },
    statItem: {
      alignItems: "center",
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.accent,
    },
    GroupsContainer: {
      marginBottom: 12,
      paddingHorizontal: 5,
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
    },
    groupCheckboxHorizontal: {
      flexDirection: "row",
      alignItems: "center",
    },
    groupLabel: {
      color: colors.textMuted,
      fontSize: 12,
      marginLeft: 8,
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      justifyContent: "center",
    },
    switchItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    switchLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginRight: 8,
    },
  });

  return (
    <View style={themedStyles.statsBox}>
      <View style={themedStyles.statsContent}>
        {showTeachers ? (
          <View style={themedStyles.statItem}>
            <Text style={themedStyles.statLabel}>Teachers</Text>
            <Text style={themedStyles.statValue}>{totalTeachers}</Text>
          </View>
        ) : (
          <View style={themedStyles.statItem}>
            <Text style={themedStyles.statLabel}>Students</Text>
            <Text style={themedStyles.statValue}>{totalStudents}</Text>
          </View>
        )}
      </View>

      <View style={themedStyles.switchContainer}>
        <View style={themedStyles.switchItem}>
          <Text style={themedStyles.switchLabel}>
            {showPresent ? "Present" : "Absent"}
          </Text>
          <Switch
            value={showPresent}
            onValueChange={onTogglePresent}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={showPresent ? colors.text : colors.textMuted}
          />
        </View>
        <View style={themedStyles.switchItem}>
          <Text style={themedStyles.switchLabel}>
            {showTeachers ? "Teachers" : "Students"}
          </Text>
          <Switch
            value={!showTeachers}
            onValueChange={(val) => onToggleTeachers(!val)}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={!showTeachers ? colors.text : colors.textMuted}
          />
        </View>
      </View>

      {!showTeachers && (
        <View style={themedStyles.GroupsContainer}>
          {groupIds.map((groupID) => (
            <View key={groupID} style={themedStyles.groupCheckboxHorizontal}>
              <CustomCheckbox
                value={selectedGroups.has(groupID)}
                onValueChange={() => onToggleGroup(groupID)}
                color={(colorMap as any)[groupID] || "#6b7280"}
              />
              <Text style={themedStyles.groupLabel}>
                {(labelMap as any)[groupID] || "Unknown"}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const PersonListItem = ({
  person,
  isStudent,
  onOptions,
  colors,
  locationMap,
  colorMap,
}: PersonItemProps) => {
  const themedStyles = StyleSheet.create({
    itemContainer: {
      backgroundColor: colors.container,
      padding: 12,
      marginVertical: 1,
      marginHorizontal: 5,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderLeftColor: isStudent
        ? colorMap[(person as Student).groupID] || "#6b7280"
        : colors.textMuted,
      borderLeftWidth: 4,
    },
    itemText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
    },
    itemLocation: {
      fontSize: 12,
      color: colors.textMuted,
    },
    optionsButton: {
      backgroundColor: colors.blue,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 4,
    },
    optionsButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#ffffff",
    },
  });

  const getLocationName = (locID: string): string => {
    return locationMap[locID] || locID;
  };

  return (
    <TouchableOpacity style={themedStyles.itemContainer}>
      <View style={{ flex: 1 }}>
        <Text style={themedStyles.itemText}>
          {person.firstName} {person.lastName}
        </Text>
        <Text style={themedStyles.itemLocation}>
          {person.currentLocID === "none"
            ? "Not present"
            : getLocationName(person.currentLocID)}
        </Text>
      </View>
      <TouchableOpacity style={themedStyles.optionsButton} onPress={onOptions}>
        <Text style={themedStyles.optionsButtonText}>Options</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const OptionsModal = ({
  visible,
  person,
  isStudent,
  onClose,
  onTogglePresence,
  onViewProfile,
  colors,
}: {
  visible: boolean;
  person: PersonItem | null;
  isStudent: boolean;
  onClose: () => void;
  onTogglePresence: () => void;
  onViewProfile: () => void;
  colors: any;
}) => {
  const themedStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    optionsModalContent: {
      backgroundColor: colors.container,
      borderRadius: 12,
      padding: 20,
      width: "80%",
      maxWidth: 400,
    },
    closeButton: {
      position: "absolute",
      top: 10,
      right: 10,
      padding: 10,
    },
    closeButtonText: {
      fontSize: 20,
      color: colors.text,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    optionButton: {
      backgroundColor: colors.blue,
      paddingVertical: 12,
      marginVertical: 8,
      borderRadius: 6,
      alignItems: "center",
    },
    optionText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#ffffff",
    },
    cancelButton: {
      backgroundColor: colors.red,
    },
    cancelText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#ffffff",
    },
  });

  const isPresent = person?.present ?? true;
  const buttonText = isPresent ? "Mark Absent" : "Mark Present";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={themedStyles.modalOverlay}>
        <View style={themedStyles.optionsModalContent}>
          <TouchableOpacity style={themedStyles.closeButton} onPress={onClose}>
            <Text style={themedStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={themedStyles.modalTitle}>
            {person ? `${person.firstName} ${person.lastName}` : ""}
          </Text>

          <TouchableOpacity
            style={themedStyles.optionButton}
            onPress={onTogglePresence}
          >
            <Text style={themedStyles.optionText}>{buttonText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={themedStyles.optionButton}
            onPress={onViewProfile}
          >
            <Text style={themedStyles.optionText}>View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[themedStyles.optionButton, themedStyles.cancelButton]}
            onPress={onClose}
          >
            <Text style={themedStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ProfileModal = ({
  visible,
  person,
  isStudent,
  onClose,
  colors,
  colorMap,
  labelMap,
}: {
  visible: boolean;
  person: PersonItem | null;
  isStudent: boolean;
  onClose: () => void;
  colors: any;
  colorMap: { [key: string]: string };
  labelMap: { [key: string]: string };
}) => {
  if (!person) return null;
  const student = person as Student;
  const daysText = student.days?.join(", ") || "N/A";
  const borderColor = isStudent
    ? colorMap[(student as Student).groupID] || "#6b7280"
    : colors.textMuted;

  const themedStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    profileModalContent: {
      backgroundColor: colors.container,
      borderRadius: 12,
      padding: 20,
      width: "85%",
      maxHeight: "80%",
    },
    closeButton: {
      position: "absolute",
      top: 12,
      right: 12,
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 18,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    closeButtonText: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    profileTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 20,
      marginTop: 10,
      textAlign: "center",
    },
    profileInfo: {
      maxHeight: 400,
    },
    profileRow: {
      flexDirection: "row",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    profileLabel: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: "600",
      width: 100,
    },
    profileValue: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={themedStyles.modalOverlay}>
        <View
          style={[
            themedStyles.profileModalContent,
            { borderColor: `${borderColor}90`, borderWidth: 3 },
          ]}
        >
          <TouchableOpacity style={themedStyles.closeButton} onPress={onClose}>
            <Text style={themedStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={themedStyles.profileTitle}>
            {person.firstName} {person.lastName}
          </Text>

          <ScrollView style={themedStyles.profileInfo}>
            {isStudent && (
              <>
                <View style={themedStyles.profileRow}>
                  <Text style={themedStyles.profileLabel}>Days:</Text>
                  <Text style={themedStyles.profileValue}>{daysText}</Text>
                </View>
                <View style={themedStyles.profileRow}>
                  <Text style={themedStyles.profileLabel}>Group:</Text>
                  <Text style={themedStyles.profileValue}>
                    {labelMap[student.groupID] || "Unknown"}
                  </Text>
                </View>
                <View style={themedStyles.profileRow}>
                  <Text style={themedStyles.profileLabel}>Medication:</Text>
                  <Text style={themedStyles.profileValue}>
                    {student.hasMeds ? "Yes" : "No"}
                  </Text>
                </View>
              </>
            )}
            <View style={themedStyles.profileRow}>
              <Text style={themedStyles.profileLabel}>Location:</Text>
              <Text style={themedStyles.profileValue}>
                {person.currentLocID === "none" ? "N/A" : person.currentLocID}
              </Text>
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
};

export default function Index() {
  const { colors } = useTheme();
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTeachers, setShowTeachers] = useState(false);
  const [showPresent, setShowPresent] = useState(true);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationMap, setLocationMap] = useState<{ [key: string]: string }>({});
  const [colorMap, setColorMap] = useState<{ [key: string]: string }>({});
  const [labelMap, setLabelMap] = useState<{ [key: string]: string }>({});

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
  });

  const loadData = useCallback(async () => {
    try {
      await initializeStuData();
      const stuArray = await getStuArray();
      const teaArray = await getTeaArray();
      const locations = await getLocArray();

      // Create locationMap from locations
      const map: { [key: string]: string } = {};
      locations.forEach((loc) => {
        map[loc.id] = loc.locationName;
      });
      setLocationMap(map);

      // Load color and label maps from settings
      const gruArray = await getGruArray();
      const colors: { [key: string]: string } = {};
      const labels: { [key: string]: string } = {};
      const ids: string[] = [];

      for (const group of gruArray) {
        colors[group.id] = group.color || "#6b7280";
        labels[group.id] = group.name || "Unknown Group";
        ids.push(group.id);
      }

      setColorMap(colors);
      setLabelMap(labels);
      setGroupIds(ids);
      setSelectedGroups(new Set(ids));

      setAllStudents(stuArray);
      setAllTeachers(teaArray);
    } catch (err) {
      console.error("Failed to load data:", err);
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
    }, [loadData]),
  );

  const filteredData = showTeachers
    ? allTeachers
        .filter((t) => t.present === showPresent)
        .filter((t) => {
          if (!searchQuery.trim()) return true;
          const query = searchQuery.toLowerCase();
          return (
            t.firstName.toLowerCase().includes(query) ||
            t.lastName.toLowerCase().includes(query)
          );
        })
        .sort((a, b) => {
          const fnCmp = a.firstName.localeCompare(b.firstName);
          return fnCmp !== 0 ? fnCmp : a.lastName.localeCompare(b.lastName);
        })
    : allStudents
        .filter((s) => selectedGroups.has(s.groupID))
        .filter((s) => s.present === showPresent)
        .filter((s) => {
          if (!searchQuery.trim()) return true;
          const query = searchQuery.toLowerCase();
          return (
            s.firstName.toLowerCase().includes(query) ||
            s.lastName.toLowerCase().includes(query)
          );
        })
        .sort((a, b) => {
          const fnCmp = a.firstName.localeCompare(b.firstName);
          return fnCmp !== 0 ? fnCmp : a.lastName.localeCompare(b.lastName);
        });

  const displayStudentCount = allStudents
    .filter((s) => selectedGroups.has(s.groupID))
    .filter((s) => s.present === showPresent).length;
  const displayTeacherCount = allTeachers.filter(
    (t) => t.present === showPresent,
  ).length;

  const handleOptions = (person: PersonItem) => {
    setSelectedPerson(person);
    setOptionsModalVisible(true);
  };

  const handleTogglePresence = async () => {
    if (!selectedPerson) return;

    try {
      const isStudent = "groupID" in selectedPerson;
      const isCurrentlyPresent = selectedPerson.present;

      if (isCurrentlyPresent) {
        // Mark as absent
        if (isStudent) {
          await updateStuAbsent(selectedPerson.id);
        } else {
          await updateTeaAbsent(selectedPerson.id);
        }
      } else {
        // Mark as present - need to get the default location
        const locations = await getLocArray();
        const defaultLoc = locations.find((l) => l.isDefault);
        const defaultLocID = defaultLoc?.id || "loc001";

        if (isStudent) {
          await updateStuPresent(selectedPerson.id);
        } else {
          await updateTeaPresent(selectedPerson.id);
        }
      }

      await loadData();
    } catch (err) {
      console.error("Failed to toggle presence:", err);
    }
    setOptionsModalVisible(false);
  };

  const handleViewProfile = () => {
    setOptionsModalVisible(false);
    setProfileModalVisible(true);
  };

  const handleToggleGroup = (groupID: string) => {
    const newGroups = new Set(selectedGroups);
    if (newGroups.has(groupID)) {
      newGroups.delete(groupID);
    } else {
      newGroups.add(groupID);
    }
    setSelectedGroups(newGroups);
  };

  if (loading) return <Text>Loading...</Text>;

  const totalStudents = filteredData.filter((p) => "groupID" in p).length;
  const totalTeachers = filteredData.filter((p) => !("groupID" in p)).length;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={themedStyles.container}>
        <HomeStatsBar
          totalStudents={totalStudents}
          totalTeachers={totalTeachers}
          showTeachers={showTeachers}
          onToggleTeachers={setShowTeachers}
          showPresent={showPresent}
          onTogglePresent={setShowPresent}
          selectedGroups={selectedGroups}
          onToggleGroup={handleToggleGroup}
          colors={colors}
          colorMap={colorMap}
          labelMap={labelMap}
          groupIds={groupIds}
        />
        <TextInput
          style={themedStyles.searchBar}
          placeholder="Search by name..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredData}
          renderItem={({ item }) => (
            <PersonListItem
              person={item}
              isStudent={"groupID" in item}
              onOptions={() => handleOptions(item)}
              colors={colors}
              locationMap={locationMap}
              colorMap={colorMap}
            />
          )}
          keyExtractor={(item) => item.id}
        />
        <OptionsModal
          visible={optionsModalVisible}
          person={selectedPerson}
          isStudent={selectedPerson ? "groupID" in selectedPerson : false}
          onClose={() => setOptionsModalVisible(false)}
          onTogglePresence={handleTogglePresence}
          onViewProfile={handleViewProfile}
          colors={colors}
        />
        <ProfileModal
          visible={profileModalVisible}
          person={selectedPerson}
          isStudent={selectedPerson ? "groupID" in selectedPerson : false}
          onClose={() => setProfileModalVisible(false)}
          colors={colors}
          colorMap={colorMap}
          labelMap={labelMap}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
