import React, { useEffect, useState } from 'react';
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
import { RootStackParamList } from '@/models/types';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { logWorkoutToHealth } from '@/services/healthService';
import ExerciseCard from '@/components/ExerciseCard';
import { formatElapsed } from '@/utils/dateUtils';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Workout'>;
  route: RouteProp<RootStackParamList, 'Workout'>;
};

export default function WorkoutScreen({ navigation, route }: Props) {
  const { parsedWorkout, imageUri } = route.params;
  const { session, completeSet, finishWorkout, totalSets, completedSets } =
    useWorkoutSession(parsedWorkout, imageUri);
  const { save } = useWorkoutHistory();

  const [elapsed, setElapsed] = useState('0s');

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(formatElapsed(session.startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startedAt]);

  async function handleFinish() {
    Alert.alert(
      'Finalizar entrenamiento',
      `Has completado ${completedSets} de ${totalSets} series. ¿Deseas guardar y salir?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          style: 'default',
          onPress: async () => {
            const completed = finishWorkout();
            await save(completed);
            // Silently logs to Apple Health / Health Connect if available
            logWorkoutToHealth(completed).catch(() => {});
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          },
        },
      ]
    );
  }

  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.timerBlock}>
          <Text style={styles.timerLabel}>TIEMPO</Text>
          <Text style={styles.timerValue}>{elapsed}</Text>
        </View>
        <View style={styles.progressBlock}>
          <Text style={styles.progressLabel}>SERIES</Text>
          <Text style={styles.progressValue}>
            {completedSets}/{totalSets}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {session.exercises.map((ex, exIdx) => (
          <ExerciseCard
            key={ex.id}
            mode="active"
            exercise={ex}
            onSetComplete={(setIdx, kg, reps) => completeSet(exIdx, setIdx, kg, reps)}
          />
        ))}
        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.finishBtn, completedSets === 0 && styles.finishBtnDisabled]}
          onPress={handleFinish}
          activeOpacity={0.8}
        >
          <Text style={styles.finishBtnText}>
            {completedSets === totalSets ? 'Terminar entrenamiento' : 'Guardar y salir'}
          </Text>
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
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 24,
  },
  timerBlock: {},
  timerLabel: {
    color: '#555',
    fontSize: 10,
    letterSpacing: 1,
  },
  timerValue: {
    color: '#e0e0e0',
    fontSize: 20,
    fontWeight: '700',
  },
  progressBlock: {},
  progressLabel: {
    color: '#555',
    fontSize: 10,
    letterSpacing: 1,
  },
  progressValue: {
    color: '#e53935',
    fontSize: 20,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: '#1e1e1e',
    marginHorizontal: 16,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBarFill: {
    height: 3,
    backgroundColor: '#e53935',
    borderRadius: 2,
  },
  scroll: {
    padding: 16,
  },
  spacer: {
    height: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
    backgroundColor: '#0f0f0f',
  },
  finishBtn: {
    backgroundColor: '#e53935',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishBtnDisabled: {
    backgroundColor: '#2a1a1a',
  },
  finishBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
