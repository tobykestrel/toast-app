import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type CustomCheckboxProps = {
  value: boolean;
  onValueChange: () => void;
  color?: string;
  size?: 'small' | 'medium';
};

const CustomCheckbox = ({
  value,
  onValueChange,
  color = '#aaa',
  size = 'medium',
}: CustomCheckboxProps) => {
  const styles = StyleSheet.create({
    checkbox: {
      borderWidth: 2,
      borderColor: color,
      borderRadius: size === 'small' ? 3 : 4,
      justifyContent: 'center',
      alignItems: 'center',
      width: size === 'small' ? 16 : 20,
      height: size === 'small' ? 16 : 20,
      ...(value && {
        backgroundColor: color,
        borderColor: color,
      }),
    },
    checkmark: {
      fontSize: size === 'small' ? 12 : 14,
      fontWeight: 'bold',
      color: '#fff',
    },
  });

  return (
    <TouchableOpacity style={styles.checkbox} onPress={onValueChange}>
      {value && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
};

export default CustomCheckbox;
