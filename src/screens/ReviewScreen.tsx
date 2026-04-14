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

  function handleEdit(index: number, updated: ParsedExercise) {
    const copy = [...exercises];
    copy[index] = updated;
    setExercises(copy);
  }

  function handleStart() {
    if (exercises.length === 0) {
      Alert.alert('Sin ejercicios', 'No se encontraron ejercicios. Intenta con otra foto.');
      return;
    }
    const workout: ParsedWorkout = { ...initial, exercises };
    navigation.replace('Workout', { parsedWorkout: workout, imageUri });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          Se encontraron {exercises.length} ejercicios. Toca el nombre para corregirlo.
        </Text>

        {exercises.map((ex, idx) => (
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
  subtitle: {
    color: '#888',
    fontSize: 14,
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
