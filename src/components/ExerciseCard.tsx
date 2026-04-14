import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SessionExercise, ParsedExercise } from '@/models/types';
import SetRow from '@/components/SetRow';

// Preview mode: shows a parsed exercise before the workout starts
interface PreviewProps {
  mode: 'preview';
  exercise: ParsedExercise;
  onEdit?: (updated: ParsedExercise) => void;
}

// Active mode: shows a live session exercise with set tracking
interface ActiveProps {
  mode: 'active';
  exercise: SessionExercise;
  onSetComplete: (setIndex: number, weightKg: number, completedReps: number) => void;
}

// Read-only mode: for history detail
interface ReadonlyProps {
  mode: 'readonly';
  exercise: SessionExercise;
}

type Props = PreviewProps | ActiveProps | ReadonlyProps;

export default function ExerciseCard(props: Props) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(
    props.mode === 'preview' ? props.exercise.name : props.exercise.name
  );

  function commitName() {
    setEditingName(false);
    if (props.mode === 'preview' && props.onEdit) {
      props.onEdit({ ...props.exercise, name: nameValue });
    }
  }

  const completedCount =
    props.mode !== 'preview'
      ? props.exercise.sets.filter((s) => s.isComplete).length
      : 0;
  const totalCount =
    props.mode === 'preview'
      ? props.exercise.sets
      : props.exercise.sets.length;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        {editingName && props.mode === 'preview' ? (
          <TextInput
            style={styles.nameInput}
            value={nameValue}
            onChangeText={setNameValue}
            onBlur={commitName}
            onSubmitEditing={commitName}
            autoFocus
            returnKeyType="done"
          />
        ) : (
          <TouchableOpacity
            onPress={() => props.mode === 'preview' && setEditingName(true)}
            activeOpacity={props.mode === 'preview' ? 0.6 : 1}
          >
            <Text style={styles.name}>{nameValue}</Text>
          </TouchableOpacity>
        )}

        {props.mode !== 'preview' && (
          <Text style={styles.progress}>
            {completedCount}/{props.exercise.sets.length}
          </Text>
        )}
      </View>

      {/* Preview mode: simple summary */}
      {props.mode === 'preview' && (
        <Text style={styles.summary}>
          {props.exercise.sets} series × {props.exercise.reps} reps
          {props.exercise.notes ? `  ·  ${props.exercise.notes}` : ''}
        </Text>
      )}

      {/* Active mode: set rows */}
      {props.mode === 'active' && (
        <View style={styles.setList}>
          <View style={styles.setHeader}>
            <Text style={styles.setHeaderText}>Serie</Text>
            <Text style={[styles.setHeaderText, { flex: 1 }]}>Peso · Reps</Text>
            <Text style={styles.setHeaderText}>Hecho</Text>
          </View>
          {props.exercise.sets.map((set, idx) => (
            <SetRow
              key={idx}
              set={set}
              onComplete={(kg, reps) => props.onSetComplete(idx, kg, reps)}
            />
          ))}
        </View>
      )}

      {/* Readonly mode: completed sets summary */}
      {props.mode === 'readonly' && (
        <View style={styles.setList}>
          {props.exercise.sets.map((set, idx) => (
            <View key={idx} style={styles.readonlyRow}>
              <Text style={styles.readonlySetNum}>{set.setNumber}</Text>
              <Text style={styles.readonlyDetails}>
                {set.weightKg != null ? `${set.weightKg} kg  ×  ` : ''}
                {set.completedReps ?? set.targetReps} reps
              </Text>
              <Text style={styles.readonlyCheck}>{set.isComplete ? '✓' : '—'}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    color: '#e0e0e0',
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  nameInput: {
    color: '#e0e0e0',
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e53935',
    paddingVertical: 2,
  },
  progress: {
    color: '#e53935',
    fontWeight: '700',
    fontSize: 15,
  },
  summary: {
    color: '#888',
    fontSize: 14,
  },
  setList: {
    marginTop: 4,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  setHeaderText: {
    color: '#555',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    width: 20,
    textAlign: 'center',
  },
  readonlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  readonlySetNum: {
    color: '#666',
    fontSize: 14,
    width: 20,
    textAlign: 'center',
  },
  readonlyDetails: {
    color: '#bbb',
    fontSize: 14,
    flex: 1,
  },
  readonlyCheck: {
    color: '#e53935',
    fontSize: 14,
    fontWeight: '700',
  },
});
