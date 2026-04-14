import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, ParsedExercise, ParsedWorkout } from '@/models/types';
import ExerciseCard from '@/components/ExerciseCard';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Review'>;
  route: RouteProp<RootStackParamList, 'Review'>;
};

export default function ReviewScreen({ navigation, route }: Props) {
  const { parsedWorkout: initial, imageUri } = route.params;
  const [exercises, setExercises] = useState<ParsedExercise[]>(initial.exercises);
  const [selectedDay, setSelectedDay] = useState<string | null>(
    initial.days?.length > 0 ? initial.days[0] : null
  );

  const hasDays = initial.days?.length > 0;

  const visibleExercises = selectedDay
    ? exercises.filter((ex) => ex.day === selectedDay)
    : exercises;

  function handleEdit(index: number, updated: ParsedExercise) {
    // index is relative to visibleExercises, find the real index
    const realIndex = exercises.indexOf(visibleExercises[index]);
    const copy = [...exercises];
    copy[realIndex] = updated;
    setExercises(copy);
  }

  function handleStart() {
    if (visibleExercises.length === 0) {
      Alert.alert('Sin ejercicios', 'No hay ejercicios para este día.');
      return;
    }
    const workout: ParsedWorkout = {
      ...initial,
      exercises: visibleExercises,
      days: selectedDay ? [selectedDay] : [],
    };
    navigation.replace('Workout', { parsedWorkout: workout, imageUri });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Day selector */}
        {hasDays && (
          <View style={styles.daySelector}>
            <Text style={styles.daySelectorLabel}>Selecciona el día que vas a entrenar:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabs}>
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
          {visibleExercises.length} ejercicios · Toca el nombre para corregirlo
        </Text>

        {visibleExercises.map((ex, idx) => (
          <ExerciseCard
            key={idx}
            mode="preview"
            exercise={ex}
            onEdit={(updated) => handleEdit(idx, updated)}
          />
        ))}

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.retakeBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.retakeBtnText}>Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text style={styles.startBtnText}>Empezar entrenamiento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  scroll: {
    padding: 16,
  },
  daySelector: {
    marginBottom: 16,
  },
  daySelectorLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 10,
  },
  dayTabs: {
    flexDirection: 'row',
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
  },
  dayTabActive: {
    backgroundColor: '#e53935',
    borderColor: '#e53935',
  },
  dayTabText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  dayTabTextActive: {
    color: '#fff',
  },
  subtitle: {
    color: '#888',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  spacer: {
    height: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
    backgroundColor: '#0f0f0f',
  },
  retakeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  retakeBtnText: {
    color: '#aaa',
    fontWeight: '600',
    fontSize: 16,
  },
  startBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#e53935',
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
