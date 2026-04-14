import { useState, useCallback } from 'react';
import * as Crypto from 'expo-crypto';
import { ParsedWorkout, WorkoutSession, SessionExercise, SessionSet } from '@/models/types';

function buildSession(parsed: ParsedWorkout, imageUri: string): WorkoutSession {
  const exercises: SessionExercise[] = parsed.exercises.map((ex) => ({
    id: Crypto.randomUUID(),
    name: ex.name,
    notes: ex.notes,
    sets: Array.from({ length: ex.sets }, (_, i): SessionSet => ({
      setNumber: i + 1,
      targetReps: ex.reps,
      isComplete: false,
    })),
  }));

  return {
    id: Crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    exercises,
    sourceImageUri: imageUri,
  };
}

export function useWorkoutSession(parsed: ParsedWorkout, imageUri: string) {
  const [session, setSession] = useState<WorkoutSession>(() =>
    buildSession(parsed, imageUri)
  );

  const completeSet = useCallback(
    (exerciseIndex: number, setIndex: number, weightKg: number, completedReps: number) => {
      setSession((prev) => {
        const exercises = prev.exercises.map((ex, eIdx) => {
          if (eIdx !== exerciseIndex) return ex;
          const sets = ex.sets.map((s, sIdx) => {
            if (sIdx !== setIndex) return s;
            return {
              ...s,
              weightKg,
              completedReps,
              completedAt: new Date().toISOString(),
              isComplete: true,
            };
          });
          return { ...ex, sets };
        });
        return { ...prev, exercises };
      });
    },
    []
  );

  const finishWorkout = useCallback((): WorkoutSession => {
    const completed: WorkoutSession = {
      ...session,
      completedAt: new Date().toISOString(),
    };
    setSession(completed);
    return completed;
  }, [session]);

  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isComplete).length,
    0
  );

  return { session, completeSet, finishWorkout, totalSets, completedSets };
}
