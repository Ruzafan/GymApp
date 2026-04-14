import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '@/models/types';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import WorkoutSummaryCard from '@/components/WorkoutSummaryCard';
import EmptyState from '@/components/EmptyState';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const { sessions, loading, refresh } = useWorkoutHistory();

  // Refresh history every time we come back to this screen
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WorkoutSummaryCard
            session={item}
            onPress={() => navigation.navigate('HistoryDetail', { sessionId: item.id })}
          />
        )}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="🏋️"
              title="Sin entrenamientos aún"
              subtitle="Toca el botón + para fotografiar tu listado y empezar tu primer entrenamiento."
            />
          )
        }
        contentContainerStyle={sessions.length === 0 ? styles.emptyContent : styles.listContent}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Capture')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContent: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e53935',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 36,
  },
});
