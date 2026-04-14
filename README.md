# GymApp

App de seguimiento de entrenamientos para iOS y Android. Fotografía tu listado de ejercicios y la IA extrae automáticamente los ejercicios, series y repeticiones.

## Características

- **Escaneo con IA** — Toma una foto o selecciona una imagen de tu listado (escrito a mano o impreso) y Claude Vision extrae todos los ejercicios
- **Revisión y edición** — Corrige cualquier error antes de empezar
- **Tracker en tiempo real** — Marca series como completadas, anota pesos y repeticiones
- **Historial local** — Todos tus entrenamientos guardados en el dispositivo

## Stack

- [Expo](https://expo.dev) (React Native + TypeScript)
- [Claude Sonnet 4.6](https://www.anthropic.com) para análisis de imágenes
- AsyncStorage para persistencia local
- React Navigation v6

## Requisitos

- [Node.js](https://nodejs.org) (LTS)
- [Expo Go](https://expo.dev/go) en tu móvil (iOS o Android)
- Cuenta en [console.anthropic.com](https://console.anthropic.com) con crédito y una API key

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar la API key
# Edita .env y reemplaza el placeholder:
# EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...

# Arrancar
npx expo start
```

Escanea el QR con la app **Expo Go** en tu móvil.

## Estructura del proyecto

```
src/
├── models/types.ts          # Interfaces TypeScript
├── navigation/              # React Navigation
├── screens/                 # Pantallas principales
│   ├── HomeScreen           # Historial de entrenamientos
│   ├── CaptureScreen        # Cámara / galería + llamada a Claude
│   ├── ReviewScreen         # Revisión y edición de ejercicios
│   ├── WorkoutScreen        # Tracker activo
│   └── HistoryDetailScreen  # Detalle de entrenamiento pasado
├── components/              # Componentes reutilizables
├── services/                # Claude API + AsyncStorage
├── hooks/                   # useWorkoutSession, useWorkoutHistory
└── utils/                   # Imagen (resize/base64), fechas
```

## Notas

- La API key de Anthropic **no** está incluida en el repositorio (`.env` está en `.gitignore`)
- El coste por uso es muy bajo: ~$0.01 por imagen analizada
