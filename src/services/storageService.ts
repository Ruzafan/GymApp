import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession } from '@/models/types';

const HISTORY_KEY = 'workout_history';

export async function saveSession(session: WorkoutSession): Promise<void> {
  const existing = await getAllSessions();
  const updated = [session, ...existing.filter((s) => s.id !== session.id)];
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function getAllSessions(): Promise<WorkoutSession[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as WorkoutSession[];
}

export async function getSessionById(id: string): Promise<WorkoutSession | null> {
  const sessions = await getAllSessions();
  return sessions.find((s) => s.id === id) ?? null;
}

export async function deleteSession(id: string): Promise<void> {
  const existing = await getAllSessions();
  const updated = existing.filter((s) => s.id !== id);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}
