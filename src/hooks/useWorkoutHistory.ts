import { useState, useCallback, useEffect } from 'react';
import { WorkoutSession } from '@/models/types';
import * as storageService from '@/services/storageService';

export function useWorkoutHistory() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const all = await storageService.getAllSessions();
    setSessions(all);
    setLoading(false);
  }, []);

  const save = useCallback(async (session: WorkoutSession) => {
    await storageService.saveSession(session);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await storageService.deleteSession(id);
    await refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, loading, refresh, save, remove };
}
