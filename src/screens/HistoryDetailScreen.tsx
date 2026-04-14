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
import { RootStackParamList, WorkoutSession } from '@/models/types';
import { getSessionById } from '@/services/storageService';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import ExerciseCard from '@/components/ExerciseCard';
import { formatDate, formatTime, formatDuration } from '@/utils/dateUtils';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'HistoryDetail'>;
  route: RouteProp<RootStackParamList, 'HistoryDetail'>;
};

export default function HistoryDetailScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const { remove } = useWorkoutHistory();

  useEffect(() => {
    getSessionById(sessionId).then(setSession);
  }, [sessionId]);

  function handleDelete() {
    Alert.alert(
      'Eliminar entrenamiento',
      '¿Seguro que quieres eliminar este entrenamiento? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await remove(sessionId);
            navigation.goBack();
          },
        },
      ]
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isComplete).length,
    0
  );
  const duration =
    session.completedAt
      ? formatDuration(session.startedAt, session.completedAt)
      : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Summary header */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryDate}>
            {formatDate(session.startedAt)} · {formatTime(session.startedAt)}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{session.exercises.length}</Text>
              <Text style={styles.statLabel}>ejercicios</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{completedSets}/{totalSets}</Text>
              <Text style={styles.statLabel}>series</Text>
            </View>
            {duration && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{duration}</Text>
                  <Text style={styles.statLabel}>duración</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Exercise list */}
        {session.exercises.map((ex) => (
          <ExerciseCard key={ex.id} mode="readonly" exercise={ex} />
        ))}

        {/* Delete button */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>Eliminar entrenamiento</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  scroll: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  summaryDate: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#e53935',
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#2a2a2a',
  },
  deleteBtn: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1a0a0a',
    borderWidth: 1,
    borderColor: '#4a1a1a',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#e53935',
    fontWeight: '600',
    fontSize: 15,
  },
  spacer: {
    height: 32,
  },
});
