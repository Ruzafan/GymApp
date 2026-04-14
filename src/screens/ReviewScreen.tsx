import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { RootStackParamList, ParsedExercise, ParsedWorkout, WorkoutTemplate } from '@/models/types';
import ExerciseCard from '@/components/ExerciseCard';
import { saveTemplate } from '@/services/storageService';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Review'>;
  route: RouteProp<RootStackParamList, 'Review'>;
};

export default function ReviewScreen({ navigation, route }: Props) {
  const { parsedWorkout: initial, imageUri, fromTemplate } = route.params;

  const [exercises, setExercises] = useState<ParsedExercise[]>(initial.exercises);
  const [selectedDay, setSelectedDay] = useState<string | null>(
    initial.days?.length > 0 ? initial.days[0] : null
  );
  const [routineName, setRoutineName] = useState('');
  const [saving, setSaving] = useState(false);

  const hasDays = (initial.days?.length ?? 0) > 0;

  // Exercises visible for the selected day
  const visibleExercises = selectedDay
    ? exercises.filter((ex) => ex.day === selectedDay)
    : exercises;

  const handleEdit = useCallback((exerciseName: string, updated: ParsedExercise) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.name === exerciseName && ex.day === updated.day ? updated : ex))
    );
  }, []);

  async function handleSaveAndStart() {
    if (visibleExercises.length === 0) {
      Alert.alert('Sin ejercicios', 'No hay ejercicios para este día.');
      return;
    }

    const workoutToDo: ParsedWorkout = {
      ...initial,
      exercises: visibleExercises,
      days: selectedDay ? [selectedDay] : [],
    };

    // Save as template if user entered a name
    if (routineName.trim() && !fromTemplate) {
      setSaving(true);
      const template: WorkoutTemplate = {
        id: uuidv4(),
        name: routineName.trim(),
        createdAt: new Date().toISOString(),
        exercises: exercises, // save ALL days
        days: initial.days ?? [],
        sourceImageUri: imageUri,
      };
      await saveTemplate(template);
      setSaving(false);
    }

    navigation.replace('Workout', {
      parsedWorkout: workoutToDo,
      imageUri,
      templateName: selectedDay ?? routineName.trim() ?? undefined,
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Routine name input — only when coming from a new scan */}
        {!fromTemplate && (
          <View style={styles.nameSection}>
            <Text style={styles.nameLabel}>Nombre de la rutina (opcional)</Text>
            <TextInput
              style={styles.nameInput}
              value={routineName}
              onChangeText={setRoutineName}
              placeholder="ej: Enero, Volumen, Full Body…"
              placeholderTextColor="#444"
              returnKeyType="done"
            />
            {routineName.trim().length > 0 && (
              <Text style={styles.saveHint}>Se guardará para reutilizarla sin volver a escanear</Text>
            )}
          </View>
        )}

        {/* Day selector */}
        {hasDays && (
          <View style={styles.daySelector}>
            <Text style={styles.daySelectorLabel}>¿Qué día entrenas hoy?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {initial.days.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayTab, selectedDay === day && styles.dayTabActive]}
                  onPress={() => setSelectedDay(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayTabText, selectedDay === day && styles.dayTabTextActive]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.subtitle}>
          {visibleExercises.length} ejercicios · Edita series, reps o nombre si hay errores
        </Text>

        {visibleExercises.map((ex) => (
          <ExerciseCard
            key={`${ex.day ?? ''}-${ex.name}`}
            mode="preview"
            exercise={ex}
            onEdit={(updated) => handleEdit(ex.name, updated)}
          />
        ))}

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        {!fromTemplate && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backBtnText}>Volver</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.startBtn, saving && styles.startBtnDisabled]}
          onPress={handleSaveAndStart}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.startBtnText}>
            {saving
              ? 'Guardando…'
              : routineName.trim() && !fromTemplate
              ? 'Guardar y entrenar'
              : 'Empezar entrenamiento'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  scroll: { padding: 16 },
  nameSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  nameLabel: { color: '#888', fontSize: 12, marginBottom: 8 },
  nameInput: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 6,
  },
  saveHint: { color: '#e53935', fontSize: 11, marginTop: 6 },
  daySelector: { marginBottom: 16 },
  daySelectorLabel: { color: '#888', fontSize: 13, marginBottom: 10 },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
  },
  dayTabActive: { backgroundColor: '#e53935', borderColor: '#e53935' },
  dayTabText: { color: '#888', fontSize: 13, fontWeight: '600' },
  dayTabTextActive: { color: '#fff' },
  subtitle: { color: '#666', fontSize: 12, marginBottom: 12, textAlign: 'center' },
  spacer: { height: 16 },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
    backgroundColor: '#0f0f0f',
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  backBtnText: { color: '#aaa', fontWeight: '600', fontSize: 16 },
  startBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#e53935',
    alignItems: 'center',
  },
  startBtnDisabled: { backgroundColor: '#4a1a1a' },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
