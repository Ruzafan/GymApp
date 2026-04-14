import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SessionSet } from '@/models/types';

interface Props {
  set: SessionSet;
  onComplete: (weightKg: number, completedReps: number) => void;
}

export default function SetRow({ set, onComplete }: Props) {
  const [weight, setWeight] = useState(set.weightKg?.toString() ?? '');
  const [reps, setReps] = useState(
    set.completedReps?.toString() ?? (isNumeric(set.targetReps) ? set.targetReps : '')
  );

  function isNumeric(str: string) {
    return /^\d+$/.test(str.trim());
  }

  function handleComplete() {
    const kg = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || parseInt(set.targetReps, 10) || 0;
    onComplete(kg, r);
  }

  return (
    <View style={[styles.row, set.isComplete && styles.rowDone]}>
      <Text style={styles.setNumber}>{set.setNumber}</Text>

      <View style={styles.inputs}>
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, set.isComplete && styles.inputDone]}
            value={weight}
            onChangeText={setWeight}
            placeholder="kg"
            placeholderTextColor="#444"
            keyboardType="decimal-pad"
            editable={!set.isComplete}
            selectTextOnFocus
          />
          <Text style={styles.inputLabel}>kg</Text>
        </View>

        <Text style={styles.separator}>×</Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, set.isComplete && styles.inputDone]}
            value={reps}
            onChangeText={setReps}
            placeholder={set.targetReps}
            placeholderTextColor="#444"
            keyboardType="number-pad"
            editable={!set.isComplete}
            selectTextOnFocus
          />
          <Text style={styles.inputLabel}>reps</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.checkBtn, set.isComplete && styles.checkBtnDone]}
        onPress={handleComplete}
        disabled={set.isComplete}
        activeOpacity={0.7}
      >
        <Text style={styles.checkIcon}>{set.isComplete ? '✓' : '○'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  rowDone: {
    opacity: 0.5,
  },
  setNumber: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    width: 20,
    textAlign: 'center',
  },
  inputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    flex: 1,
  },
  input: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    minWidth: 32,
    textAlign: 'center',
  },
  inputDone: {
    color: '#555',
  },
  inputLabel: {
    color: '#555',
    fontSize: 12,
  },
  separator: {
    color: '#555',
    fontSize: 16,
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBtnDone: {
    backgroundColor: '#e53935',
    borderColor: '#e53935',
  },
  checkIcon: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '700',
  },
});
