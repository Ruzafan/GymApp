/**
 * Health integration for Apple Health (iOS) and Health Connect (Android).
 *
 * IMPORTANT: These native modules do NOT work in Expo Go.
 * You need to build the app with EAS Build. See eas.json and README.
 *
 * What this logs to Health after each workout:
 *  - iOS : HealthKit "Traditional Strength Training" workout entry
 *  - Android: Health Connect "Strength Training" exercise session
 *
 * The Apple Watch and Google Fit will automatically pick it up:
 *  - Activity rings on Apple Watch will count the calories
 *  - The workout appears in the Apple Health / Google Fit timeline
 */

import { Platform } from 'react-native';
import { WorkoutSession } from '@/models/types';

function durationSeconds(session: WorkoutSession): number {
  const end = session.completedAt ?? new Date().toISOString();
  return Math.floor(
    (new Date(end).getTime() - new Date(session.startedAt).getTime()) / 1000
  );
}

// ─── iOS — Apple HealthKit ────────────────────────────────────────────────────

async function initAppleHealth(): Promise<boolean> {
  try {
    const AppleHealthKit = require('react-native-health').default;
    const { Permissions } = require('react-native-health');

    const options = {
      permissions: {
        read: [Permissions.HeartRate, Permissions.ActiveEnergyBurned],
        write: [Permissions.Workout, Permissions.ActiveEnergyBurned],
      },
    };

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(options, (err: Error) => {
        if (err) {
          console.warn('[Health] HealthKit init failed:', err.message);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } catch {
    // Native module not available (Expo Go)
    return false;
  }
}

async function logToAppleHealth(session: WorkoutSession): Promise<void> {
  const ready = await initAppleHealth();
  if (!ready) return;

  const AppleHealthKit = require('react-native-health').default;
  const endDate = session.completedAt ?? new Date().toISOString();

  await new Promise<void>((resolve) => {
    AppleHealthKit.saveWorkout(
      {
        type: 'TraditionalStrengthTraining',
        startDate: session.startedAt,
        endDate,
        duration: durationSeconds(session),
      },
      (err: Error) => {
        if (err) console.warn('[Health] saveWorkout failed:', err.message);
        resolve();
      }
    );
  });
}

// ─── Android — Health Connect ─────────────────────────────────────────────────

async function logToHealthConnect(session: WorkoutSession): Promise<void> {
  try {
    const {
      initialize,
      requestPermission,
      insertRecords,
    } = require('react-native-health-connect');

    const available = await initialize();
    if (!available) return;

    await requestPermission([
      { accessType: 'write', recordType: 'ExerciseSession' },
    ]);

    const endTime = session.completedAt ?? new Date().toISOString();

    await insertRecords([
      {
        recordType: 'ExerciseSession',
        startTime: session.startedAt,
        endTime,
        exerciseType: 'STRENGTH_TRAINING',
        title: 'GymApp Workout',
      },
    ]);
  } catch {
    // Native module not available (Expo Go)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function logWorkoutToHealth(session: WorkoutSession): Promise<void> {
  if (Platform.OS === 'ios') {
    await logToAppleHealth(session);
  } else if (Platform.OS === 'android') {
    await logToHealthConnect(session);
  }
}
