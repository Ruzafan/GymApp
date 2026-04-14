import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WorkoutSession } from '@/models/types';
import { formatDate, formatTime, formatDuration } from '@/utils/dateUtils';

interface Props {
  session: WorkoutSession;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function WorkoutSummaryCard({ session, onPress, onLongPress }: Props) {
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
    <TouchableOpacity style={styles.card} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.75} delayLongPress={400}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(session.startedAt)}</Text>
        <Text style={styles.time}>{formatTime(session.startedAt)}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{session.exercises.length}</Text>
          <Text style={styles.statLabel}>ejercicios</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{completedSets}/{totalSets}</Text>
          <Text style={styles.statLabel}>series</Text>
        </View>
        {duration && (
          <>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{duration}</Text>
              <Text style={styles.statLabel}>duración</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.exerciseList}>
        {session.exercises.slice(0, 3).map((ex) => (
          <Text key={ex.id} style={styles.exerciseName} numberOfLines={1}>
            · {ex.name}
          </Text>
        ))}
        {session.exercises.length > 3 && (
          <Text style={styles.more}>+{session.exercises.length - 3} más</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  date: {
    color: '#e0e0e0',
    fontWeight: '600',
    fontSize: 15,
  },
  time: {
    color: '#666',
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#e53935',
    fontWeight: '700',
    fontSize: 18,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#2a2a2a',
  },
  exerciseList: {
    gap: 2,
  },
  exerciseName: {
    color: '#888',
    fontSize: 13,
  },
  more: {
    color: '#555',
    fontSize: 12,
    marginTop: 2,
  },
});
