import { ParsedWorkout } from '@/models/types';
import { resizeImage, toBase64 } from '@/utils/imageUtils';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `Eres un asistente que analiza fotos de listados de ejercicios de gimnasio.
El usuario te enviara una foto de un listado escrito a mano o impreso con ejercicios, series y repeticiones.
Extrae todos los ejercicios y devuelve UNICAMENTE un objeto JSON valido con este formato exacto:
{
  "days": ["PRIMER DIA", "SEGUNDO DIA"],
  "exercises": [
    { "name": "string", "sets": number, "reps": "string", "day": "string o null", "notes": "string o null" }
  ],
  "rawText": "string con el texto que puedes leer en la imagen"
}
Reglas:
- "days": lista ordenada de los nombres de los dias que aparecen en la imagen (vacio [] si no hay dias)
- "day": nombre del dia al que pertenece el ejercicio, tal como aparece en la imagen (null si no hay dias)
- "name": nombre del ejercicio en el idioma original de la imagen
- "sets": numero entero de series. Si las reps son "15-12-10" son 3 series con reps distintas
- "reps": puede ser "10", "8-12", "15-12-10", "AMRAP", "al fallo", "3x15", etc. Siempre string
- "notes": supersets, descansos especiales, o null si no hay
- No incluyas ningun texto fuera del JSON
- Si no puedes leer algo con claridad, haz tu mejor interpretacion
- Extrae TODOS los ejercicios de TODOS los dias`;

export async function extractWorkout(imageUri: string): Promise<ParsedWorkout> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('REPLACE_WITH_YOUR_KEY')) {
    throw new Error(
      'API key no configurada. Edita el archivo .env y reemplaza el placeholder con tu clave de Anthropic.'
    );
  }

  const resized = await resizeImage(imageUri);
  const base64 = await toBase64(resized);

  const body = {
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64,
            },
          },
          {
            type: 'text',
            text: 'Extrae los ejercicios de esta foto.',
          },
        ],
      },
    ],
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      `Error de API (${response.status}): ${(errorBody as { error?: { message?: string } }).error?.message ?? 'Error desconocido'}`
    );
  }

  const data = await response.json() as {
    content: { type: string; text: string }[];
    stop_reason?: string;
    error?: { message: string };
  };

  // Handle API-level errors returned with 200 status
  if (data.error) {
    throw new Error(`Error de API: ${data.error.message}`);
  }

  const text = data.content?.[0]?.text ?? '';

  if (!text) {
    throw new Error(`Respuesta vacía de la IA. stop_reason: ${data.stop_reason}`);
  }

  // Strip markdown code fences if Claude wraps the JSON
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  try {
    return JSON.parse(cleaned) as ParsedWorkout;
  } catch {
    throw new Error(`La IA respondió pero no en formato JSON.\nRespuesta: ${cleaned.slice(0, 200)}`);
  }
}
