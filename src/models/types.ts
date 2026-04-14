// ─── Claude API response ─────────────────────────────────────────────────────

export interface ParsedExercise {
  name: string;
  sets: number;
  reps: string;    // "10", "8-12", "AMRAP", etc.
  notes?: string;
  day?: string;    // "PRIMER DIA", "SEGUNDO DIA", etc. if the image has multiple days
}

export interface ParsedWorkout {
  exercises: ParsedExercise[];
  days: string[];  // ordered list of unique day names found
  rawText?: string;
}

// ─── Active / completed session ──────────────────────────────────────────────

export interface SessionSet {
  setNumber: number;
  targetReps: string;
  completedReps?: number;
  weightKg?: number;
  completedAt?: string; // ISO timestamp
  isComplete: boolean;
}

export interface SessionExercise {
  id: string;
  name: string;
  sets: SessionSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  startedAt: string;      // ISO timestamp
  completedAt?: string;   // ISO timestamp
  exercises: SessionExercise[];
  sourceImageUri?: string;
}

// ─── Navigation param types ───────────────────────────────────────────────────

export type RootStackParamList = {
  Home: undefined;
  Capture: undefined;
  Review: { parsedWorkout: ParsedWorkout; imageUri: string };
  Workout: { parsedWorkout: ParsedWorkout; imageUri: string };
  HistoryDetail: { sessionId: string };
};
