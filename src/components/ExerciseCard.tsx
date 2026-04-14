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

interface PreviewProps {
  mode: 'preview';
  exercise: ParsedExercise;
  onEdit: (updated: ParsedExercise) => void;
}

interface ActiveProps {
  mode: 'active';
  exercise: SessionExercise;
  onSetComplete: (setIndex: number, weightKg: number, completedReps: number) => void;
}

interface ReadonlyProps {
  mode: 'readonly';
  exercise: SessionExercise;
}

type Props = PreviewProps | ActiveProps | ReadonlyProps;

export default function ExerciseCard(props: Props) {
  const [name, setName] = useState(props.exercise.name);
  const [editingName, setEditingName] = useState(false);

  // Preview-only state
  const [setsValue, setSetsValue] = useState(
    props.mode === 'preview' ? String(props.exercise.sets) : '0'
  );
  const [repsValue, setRepsValue] = useState(
    props.mode === 'preview' ? props.exercise.reps : ''
  );

  function commitName() {
    setEditingName(false);
    if (props.mode === 'preview') {
      props.onEdit({ ...props.exercise, name });
    }
  }

  function commitSets(val: string) {
    if (props.mode !== 'preview') return;
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) {
      props.onEdit({ ...props.exercise, sets: n });
    }
  }

  function commitReps(val: string) {
    if (props.mode !== 'preview') return;
    if (val.trim()) {
      props.onEdit({ ...props.exercise, reps: val.trim() });
    }
  }

  const completedCount =
    props.mode !== 'preview'
      ? props.exercise.sets.filter((s) => s.isComplete).length
      : 0;

  return (
    <View style={styles.card}>
      {/* Name */}
      <View style={styles.header}>
        {editingName && props.mode === 'preview' ? (
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            onBlur={commitName}
            onSubmitEditing={commitName}
            autoFocus
            returnKeyType="done"
          />
        ) : (
          <TouchableOpacity
            onPress={() => props.mode === 'preview' && setEditingName(true)}
            activeOpacity={props.mode === 'preview' ? 0.6 : 1}
            style={styles.nameTouchable}
          >
            <Text style={styles.name}>{name}</Text>
            {props.mode === 'preview' && <Text style={styles.editHint}>✎</Text>}
          </TouchableOpacity>
        )}

        {props.mode !== 'preview' && (
          <Text style={styles.progress}>
            {completedCount}/{(props.exercise as SessionExercise).sets.length}
          </Text>
        )}
      </View>

      {/* Preview mode: editable sets × reps */}
      {props.mode === 'preview' && (
        <View style={styles.previewRow}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>SERIES</Text>
            <TextInput
              style={styles.fieldInput}
              value={setsValue}
              onChangeText={setSetsValue}
              onBlur={() => commitSets(setsValue)}
              onSubmitEditing={() => commitSets(setsValue)}
              keyboardType="number-pad"
              selectTextOnFocus
              returnKeyType="done"
            />
          </View>

          <Text style={styles.times}>×</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>REPS</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputWide]}
              value={repsValue}
              onChangeText={setRepsValue}
              onBlur={() => commitReps(repsValue)}
              onSubmitEditing={() => commitReps(repsValue)}
              selectTextOnFocus
              returnKeyType="done"
              placeholder="ej: 10 ó 12-10-8"
              placeholderTextColor="#444"
            />
          </View>

          {props.exercise.notes ? (
            <Text style={styles.notes} numberOfLines={1}>{props.exercise.notes}</Text>
          ) : null}
        </View>
      )}

      {/* Active mode */}
      {props.mode === 'active' && (
        <View style={styles.setList}>
          <View style={styles.setHeader}>
            <Text style={styles.setHeaderText}>Serie</Text>
            <Text style={[styles.setHeaderText, { flex: 1 }]}>Peso · Reps</Text>
            <Text style={styles.setHeaderText}>Hecho</Text>
          </View>
          {(props.exercise as SessionExercise).sets.map((set, idx) => (
            <SetRow
              key={idx}
              set={set}
              onComplete={(kg, reps) =>
                (props as ActiveProps).onSetComplete(idx, kg, reps)
              }
            />
          ))}
        </View>
      )}

      {/* Readonly mode */}
      {props.mode === 'readonly' && (
        <View style={styles.setList}>
          {(props.exercise as SessionExercise).sets.map((set, idx) => (
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
    marginBottom: 10,
  },
  nameTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: '#e0e0e0',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  editHint: {
    color: '#555',
    fontSize: 13,
  },
  nameInput: {
    color: '#e0e0e0',
    fontSize: 15,
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
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldGroup: {
    alignItems: 'center',
    gap: 3,
  },
  fieldLabel: {
    color: '#555',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: '#111',
    color: '#e0e0e0',
    fontSize: 15,
    fontWeight: '600',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: 'center',
    minWidth: 44,
    borderWidth: 1,
    borderColor: '#333',
  },
  fieldInputWide: {
    minWidth: 80,
  },
  times: {
    color: '#555',
    fontSize: 16,
    marginTop: 12,
  },
  notes: {
    color: '#666',
    fontSize: 12,
    flex: 1,
    marginTop: 12,
    marginLeft: 4,
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
