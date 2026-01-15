import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { Location, Student, updateStuLocation, getLocArray } from './LocalData';

type MoveStudentModalProps = {
  visible: boolean;
  student: Student | null;
  onClose: () => void;
  onMove: (studentId: string, locID: string) => void;
};

export default function MoveStudentModal({ visible, student, onClose, onMove }: MoveStudentModalProps) {
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
      setLocations(locs.filter(loc => loc.isActive && student?.currentLocID !== loc.id));
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStudent = async (locID: string) => {
    if (student) {
      try {
        await updateStuLocation(student.id, locID);
        onMove(student.id, locID);
        onClose();
      } catch (err) {
        console.error(`Failed to move student ${student.id}:`, err);
      }
    }
  };

  if (!student) return null;

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
            Move {student.firstName} {student.lastName} to...
          </Text>

          {/* Locations List */}
          <FlatList
            data={locations}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.locationOption}
                onPress={() => handleMoveStudent(item.id)}
              >
                <Text style={styles.locationText}>{item.locationName}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#25292e',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginRight: 30,
  },
  locationOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#3c4755',
    borderRadius: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#fff',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#f56565',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
