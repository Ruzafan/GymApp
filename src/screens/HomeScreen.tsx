import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, WorkoutTemplate } from '@/models/types';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { getAllTemplates, deleteTemplate } from '@/services/storageService';
import { Alert } from 'react-native';
import WorkoutSummaryCard from '@/components/WorkoutSummaryCard';
import EmptyState from '@/components/EmptyState';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const { sessions, loading, refresh, remove } = useWorkoutHistory();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);

  async function loadTemplates() {
    const all = await getAllTemplates();
    setTemplates(all);
  }

  useFocusEffect(
    useCallback(() => {
      refresh();
      loadTemplates();
    }, [refresh])
  );

  function handleDeleteSession(id: string) {
    Alert.alert(
      'Eliminar entrenamiento',
      '¿Eliminar este entrenamiento del historial?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => remove(id) },
      ]
    );
  }

  function handleDeleteTemplate(id: string, name: string) {
    Alert.alert(
      'Eliminar rutina',
      `¿Eliminar la rutina "${name}"? El historial de entrenamientos no se verá afectado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteTemplate(id);
            loadTemplates();
          },
        },
      ]
    );
  }

  function handleStartTemplate(template: WorkoutTemplate) {
    navigation.navigate('Review', {
      parsedWorkout: {
        exercises: template.exercises,
        days: template.days,
      },
      imageUri: template.sourceImageUri ?? '',
      fromTemplate: true,
    });
  }

  const hasSessions = sessions.length > 0;
  const hasTemplates = templates.length > 0;
  const isEmpty = !loading && !hasSessions && !hasTemplates;

  return (
    <View style={styles.container}>
      {isEmpty ? (
        <EmptyState
          icon="🏋️"
          title="Sin entrenamientos aún"
          subtitle="Toca el botón + para fotografiar tu listado y empezar tu primer entrenamiento."
        />
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          keyExtractor={() => ''}
          ListHeaderComponent={
            <>
              {/* Saved routines */}
              {hasTemplates && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Mis Rutinas</Text>
                  {templates.map((t) => (
                    <View key={t.id} style={styles.templateCard}>
                      <TouchableOpacity
                        style={styles.templateMain}
                        onPress={() => handleStartTemplate(t)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.templateName}>{t.name}</Text>
                        <Text style={styles.templateMeta}>
                          {t.days.length > 0
                            ? t.days.join(' · ')
                            : `${t.exercises.length} ejercicios`}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteTemplateBtn}
                        onPress={() => handleDeleteTemplate(t.id, t.name)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.deleteIcon}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* History */}
              {hasSessions && (
                <Text style={styles.sectionTitle}>Historial</Text>
              )}
            </>
          }
          ListFooterComponent={
            <>
              {sessions.map((item) => (
                <WorkoutSummaryCard
                  key={item.id}
                  session={item}
                  onPress={() =>
                    navigation.navigate('HistoryDetail', { sessionId: item.id })
                  }
                  onLongPress={() => handleDeleteSession(item.id)}
                />
              ))}
              <View style={styles.bottomPad} />
            </>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

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
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  listContent: { paddingTop: 16 },
  section: { marginBottom: 8 },
  sectionTitle: {
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
  },
  templateMain: {
    flex: 1,
    padding: 14,
  },
  templateName: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  templateMeta: {
    color: '#666',
    fontSize: 13,
  },
  deleteTemplateBtn: {
    padding: 16,
  },
  deleteIcon: {
    color: '#444',
    fontSize: 14,
  },
  bottomPad: { height: 100 },
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
  fabIcon: { color: '#fff', fontSize: 32, fontWeight: '300', lineHeight: 36 },
});
