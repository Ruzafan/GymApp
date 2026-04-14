/**
 * ExerciseDB integration (via RapidAPI).
 * Fetches exercise info + downloads the GIF locally with auth headers.
 * Results cached permanently — each exercise is only downloaded once ever.
 *
 * Get your free key at: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
 * Add it to .env: EXPO_PUBLIC_RAPIDAPI_KEY=your_key_here
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { ExerciseInfo } from '@/models/types';

const BASE_URL = 'https://exercisedb.p.rapidapi.com';
const CACHE_PREFIX = 'exercise_info_';
const GIF_DIR = FileSystem.documentDirectory + 'exercise_gifs/';

const RAPIDAPI_HEADERS = () => ({
  'X-RapidAPI-Key': process.env.EXPO_PUBLIC_RAPIDAPI_KEY ?? '',
  'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
});

function cacheKey(name: string) {
  return CACHE_PREFIX + name.toLowerCase().trim().replace(/\s+/g, '_');
}

function localGifPath(name: string) {
  return GIF_DIR + name.toLowerCase().trim().replace(/\s+/g, '_') + '.gif';
}

async function fromCache(name: string): Promise<ExerciseInfo | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(name));
    if (!raw) return null;
    const info = JSON.parse(raw) as ExerciseInfo;
    // Verify local file still exists
    if (info.localGifUri) {
      const stat = await FileSystem.getInfoAsync(info.localGifUri);
      if (!stat.exists) {
        // File was deleted, clear cache so it re-downloads
        await AsyncStorage.removeItem(cacheKey(name));
        return null;
      }
    }
    return info;
  } catch {
    return null;
  }
}

async function toCache(name: string, info: ExerciseInfo): Promise<void> {
  try {
    await AsyncStorage.setItem(cacheKey(name), JSON.stringify(info));
  } catch {}
}

async function downloadGif(gifUrl: string, name: string): Promise<string | null> {
  try {
    // Ensure directory exists
    await FileSystem.makeDirectoryAsync(GIF_DIR, { intermediates: true });

    const localPath = localGifPath(name);

    // Check if already downloaded
    const stat = await FileSystem.getInfoAsync(localPath);
    if (stat.exists) return localPath;

    // Download with auth headers
    const result = await FileSystem.downloadAsync(gifUrl, localPath, {
      headers: RAPIDAPI_HEADERS(),
    });

    if (result.status === 200) return result.uri;
    return null;
  } catch {
    return null;
  }
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
      { headers: RAPIDAPI_HEADERS() }
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

    // Download the GIF locally so it can be displayed without auth headers
    const localGifUri = await downloadGif(data[0].gifUrl, englishName) ?? undefined;

    const info: ExerciseInfo = {
      gifUrl: data[0].gifUrl,
      localGifUri,
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
