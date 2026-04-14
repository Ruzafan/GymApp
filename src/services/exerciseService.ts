/**
 * ExerciseDB integration (via RapidAPI).
 * Fetches animated GIFs and exercise info by English exercise name.
 * Results are cached permanently in AsyncStorage — each exercise is fetched only once.
 *
 * Get your free key at: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
 * Add it to .env: EXPO_PUBLIC_RAPIDAPI_KEY=your_key_here
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseInfo } from '@/models/types';

const BASE_URL = 'https://exercisedb.p.rapidapi.com';
const CACHE_PREFIX = 'exercise_info_';

function cacheKey(name: string) {
  return CACHE_PREFIX + name.toLowerCase().trim().replace(/\s+/g, '_');
}

async function fromCache(name: string): Promise<ExerciseInfo | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(name));
    return raw ? (JSON.parse(raw) as ExerciseInfo) : null;
  } catch {
    return null;
  }
}

async function toCache(name: string, info: ExerciseInfo): Promise<void> {
  try {
    await AsyncStorage.setItem(cacheKey(name), JSON.stringify(info));
  } catch {}
}

export async function fetchExerciseInfo(englishName: string): Promise<ExerciseInfo | null> {
  const apiKey = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
  if (!apiKey || apiKey.includes('REPLACE')) return null;

  // Return cached result if available
  const cached = await fromCache(englishName);
  if (cached) return cached;

  try {
    const encoded = encodeURIComponent(englishName.toLowerCase().trim());
    const res = await fetch(
      `${BASE_URL}/exercises/name/${encoded}?limit=1&offset=0`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
        },
      }
    );

    if (!res.ok) return null;

    const data = await res.json() as Array<{
      gifUrl: string;
      bodyPart: string;
      target: string;
      secondaryMuscles: string[];
      instructions: string[];
    }>;

    if (!data.length) return null;

    const info: ExerciseInfo = {
      gifUrl: data[0].gifUrl,
      bodyPart: data[0].bodyPart,
      target: data[0].target,
      secondaryMuscles: data[0].secondaryMuscles ?? [],
      instructions: data[0].instructions ?? [],
      cachedAt: new Date().toISOString(),
    };

    await toCache(englishName, info);
    return info;
  } catch {
    return null;
  }
}
