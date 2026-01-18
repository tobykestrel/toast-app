import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getLocArray,
  getStuArrayByLocID,
  getTeaArrayByLocID,
  Location,
  Student,
  Teacher,
  updateStuLocation,
  updateTeaLocation,
} from "./LocalData";

type MoveItemModalProps = {
  visible: boolean;
  students: (Student | Teacher)[];
  onClose: () => void;
  onMove: () => void;
  currentLocID?: string;
  onConfirmationNeeded?: (message: string, onConfirm: () => void) => void;
};

export default function MoveStudentModal({
  visible,
  students,
  onClose,
  onMove,
  currentLocID,
  onConfirmationNeeded,
}: MoveItemModalProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadLocations();
    }
  }, [visible]);

  const loadLocations = async () => {
    try {
      const locs = await getLocArray();
      // Filter out the current location(s) - if all items are at the same location, filter that one
      const currentLocs = new Set(students.map((s) => s.currentLocID));
      setLocations(
        locs.filter((loc) => loc.isActive && !currentLocs.has(loc.id)),
      );
    } catch (err) {
      console.error("Failed to load locations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveItems = async (locID: string) => {
    if (students.length > 0) {
      try {
        // Load notification settings
        const settingsJson = await AsyncStorage.getItem("settings");
        const settings = settingsJson ? JSON.parse(settingsJson) : {};
        const notifyThresholdPassed = settings.notifyThresholdPassed === true; // Must be explicitly true
        const maxThresholdEnabled = settings.maxThresholdEnabled !== false; // Defaults to true
        const maxThreshold = settings.maxThreshold || 13;

        // Check if we're dealing with students or teachers
        const isStudent = (item: any) => "hasMeds" in item;
        const hasStudents = students.some(isStudent);
        const hasTeachers = students.some((item: any) => !("hasMeds" in item));

        if (hasStudents) {
          // Check if we need to show a confirmation modal for ratio threshold
          const studentIds = (students as Student[]).map((s) => s.id);
          const targetLocStudents = await getStuArrayByLocID(locID);
          const targetLocTeachers = await getTeaArrayByLocID(locID);

          const newStudentCount = targetLocStudents.length + studentIds.length;
          const teacherCount = targetLocTeachers.length;
          const newRatio =
            teacherCount > 0 ? newStudentCount / teacherCount : 0;

          if (
            notifyThresholdPassed &&
            maxThresholdEnabled &&
            newRatio > maxThreshold
          ) {
            // Ratio exceeds max threshold - need confirmation
            const studentLabel =
              studentIds.length === 1 ? "this student" : "these students";
            const targetLocName =
              locations.find((l) => l.id === locID)?.locationName || locID;
            const message = `Moving ${studentLabel} to ${targetLocName} will cause the ratio to go above the maximum ratio of ${maxThreshold}:1. Are you sure you want to continue?`;

            onConfirmationNeeded?.(message, async () => {
              await updateStuLocation(studentIds, locID);
              onMove();
              onClose();
            });
            return;
          }

          await updateStuLocation(studentIds, locID);
        } else if (hasTeachers) {
          // Handle teachers - check ratio threshold
          if (notifyThresholdPassed && maxThresholdEnabled) {
            const targetLocStudents = await getStuArrayByLocID(locID);
            const targetLocTeachers = await getTeaArrayByLocID(locID);

            // Calculate new teacher count after move
            const newTeacherCount = targetLocTeachers.length + students.length;
            const studentCount = targetLocStudents.length;
            const newRatio =
              newTeacherCount > 0 ? studentCount / newTeacherCount : 0;

            if (newRatio > maxThreshold) {
              // Ratio would exceed max threshold - need confirmation
              const teacherLabel =
                students.length === 1 ? "this teacher" : "these teachers";
              const targetLocName =
                locations.find((l) => l.id === locID)?.locationName || locID;
              const message = `Moving ${teacherLabel} to ${targetLocName} will cause the ratio to go below ${maxThreshold}:1 (${newRatio.toFixed(1)}:1). Are you sure you want to continue?`;

              onConfirmationNeeded?.(message, async () => {
                for (const teacher of students as Teacher[]) {
                  await updateTeaLocation(teacher.id, locID);
                }
                onMove();
                onClose();
              });
              return;
            }
          }

          for (const teacher of students as Teacher[]) {
            await updateTeaLocation(teacher.id, locID);
          }
        }

        onMove();
        onClose();
      } catch (err) {
        console.error(`Failed to move items:`, err);
      }
    }
  };

  if (students.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>
            Move{" "}
            {students.length !== 1
              ? `${students.length} Items`
              : `${students[0].firstName} ${students[0].lastName}`}{" "}
            to...
          </Text>

          {/* Locations List */}
          <FlatList
            data={locations}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.locationOption}
                onPress={() => handleMoveItems(item.id)}
              >
                <Text style={styles.locationText}>{item.locationName}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#25292e",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
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
    color: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    marginRight: 30,
  },
  locationOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    backgroundColor: "#3c4755",
    borderRadius: 8,
  },
  locationText: {
    fontSize: 16,
    color: "#fff",
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#f56565",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
