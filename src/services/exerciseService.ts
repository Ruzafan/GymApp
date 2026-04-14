import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { ExerciseInfo } from '@/models/types';

const BASE_URL = 'https://exercisedb.p.rapidapi.com';
const CACHE_PREFIX = 'exercise_info_v2_'; // v2 forces fresh cache
const GIF_DIR = FileSystem.documentDirectory + 'exercise_gifs/';

function apiKey() {
  return process.env.EXPO_PUBLIC_RAPIDAPI_KEY ?? '';
}

function rapidHeaders() {
  return {
    'X-RapidAPI-Key': apiKey(),
    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
  };
}

function cacheKey(name: string) {
  return CACHE_PREFIX + name.toLowerCase().trim().replace(/\s+/g, '_');
}

function localGifPath(name: string) {
  return GIF_DIR + name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_') + '.gif';
}

async function fromCache(name: string): Promise<ExerciseInfo | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(name));
    if (!raw) return null;
    const info = JSON.parse(raw) as ExerciseInfo;
    // Must have a local file
    if (!info.localGifUri) return null;
    const stat = await FileSystem.getInfoAsync(info.localGifUri);
    if (!stat.exists) return null;
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

// Download GIF using fetch + base64 write (works around auth header issues with downloadAsync)
async function downloadGifToFile(gifUrl: string, name: string): Promise<string | null> {
  try {
    await FileSystem.makeDirectoryAsync(GIF_DIR, { intermediates: true });

    const localPath = localGifPath(name);
    const stat = await FileSystem.getInfoAsync(localPath);
    if (stat.exists) return localPath;

    const res = await fetch(gifUrl, { headers: rapidHeaders() });
    if (!res.ok) return null;

    const blob = await res.blob();
    const reader = new FileReader();

    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // dataUrl = "data:image/gif;base64,XXXX" — strip prefix
        resolve(dataUrl.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    await FileSystem.writeAsStringAsync(localPath, base64, {
      encoding: 'base64',
    });

    return localPath;
  } catch (e) {
    console.warn('[exerciseService] downloadGifToFile failed:', e);
    return null;
  }
}

export async function fetchExerciseInfo(englishName: string): Promise<ExerciseInfo | null> {
  const key = apiKey();
  if (!key || key.includes('REPLACE')) return null;

  const cached = await fromCache(englishName);
  if (cached) return cached;

  try {
    const encoded = encodeURIComponent(englishName.toLowerCase().trim());
    const res = await fetch(
      `${BASE_URL}/exercises/name/${encoded}?limit=1&offset=0`,
      { headers: rapidHeaders() }
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

    const localGifUri = await downloadGifToFile(data[0].gifUrl, englishName) ?? undefined;

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
  } catch (e) {
    console.warn('[exerciseService] fetchExerciseInfo failed:', e);
    return null;
  }
}
