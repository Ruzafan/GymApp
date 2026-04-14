import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image, ImageLoadEventData, ImageErrorEventData } from 'expo-image';
import { ExerciseInfo } from '@/models/types';
import { fetchExerciseInfo } from '@/services/exerciseService';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  exerciseName: string;    // display name (original language)
  englishName?: string;    // for API lookup
  onClose: () => void;
}

type Status = 'loading' | 'found' | 'not_found' | 'no_key';

export default function ExerciseInfoModal({ visible, exerciseName, englishName, onClose }: Props) {
  const [info, setInfo] = useState<ExerciseInfo | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [gifLoading, setGifLoading] = useState(true);
  const [gifError, setGifError] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setInfo(null);
    setStatus('loading');
    setGifLoading(true);
    setGifError(false);

    const apiKey = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
    if (!apiKey || apiKey.includes('REPLACE')) {
      setStatus('no_key');
      return;
    }

    const nameToSearch = englishName ?? exerciseName;
    fetchExerciseInfo(nameToSearch).then((result) => {
      if (result) {
        setInfo(result);
        setStatus('found');
      } else {
        setStatus('not_found');
      }
    });
  }, [visible, englishName, exerciseName]);

  function capitalise(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>{exerciseName}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Loading */}
          {status === 'loading' && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#e53935" />
              <Text style={styles.statusText}>Buscando ejercicio…</Text>
            </View>
          )}

          {/* No API key */}
          {status === 'no_key' && (
            <View style={styles.center}>
              <Text style={styles.statusIcon}>🔑</Text>
              <Text style={styles.statusTitle}>API key no configurada</Text>
              <Text style={styles.statusText}>
                Añade tu clave de RapidAPI en el archivo .env para ver los GIFs de ejercicios.{'\n\n'}
                EXPO_PUBLIC_RAPIDAPI_KEY=tu_clave
              </Text>
            </View>
          )}

          {/* Not found */}
          {status === 'not_found' && (
            <View style={styles.center}>
              <Text style={styles.statusIcon}>🔍</Text>
              <Text style={styles.statusTitle}>Ejercicio no encontrado</Text>
              <Text style={styles.statusText}>
                No se encontró "{englishName ?? exerciseName}" en la base de datos.
              </Text>
            </View>
          )}

          {/* Found */}
          {status === 'found' && info && (
            <>
              {/* GIF */}
              <View style={styles.gifContainer}>
                {gifLoading && !gifError && (
                  <View style={styles.gifPlaceholder}>
                    <ActivityIndicator size="large" color="#e53935" />
                  </View>
                )}
                {gifError && (
                  <View style={styles.gifPlaceholder}>
                    <Text style={styles.gifErrorIcon}>🖼️</Text>
                    <Text style={styles.gifErrorText}>No se pudo cargar el GIF</Text>
                  </View>
                )}
                <Image
                  source={{
                    uri: info.gifUrl,
                    headers: {
                      'X-RapidAPI-Key': process.env.EXPO_PUBLIC_RAPIDAPI_KEY ?? '',
                      'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
                    },
                  }}
                  style={[styles.gif, gifError && styles.gifHidden]}
                  contentFit="contain"
                  autoplay
                  onLoad={() => setGifLoading(false)}
                  onError={() => { setGifLoading(false); setGifError(true); }}
                />
              </View>

              {/* Muscle tags */}
              <View style={styles.muscleSection}>
                <View style={styles.musclePrimary}>
                  <Text style={styles.muscleLabel}>MÚSCULO PRINCIPAL</Text>
                  <Text style={styles.muscleName}>{capitalise(info.target)}</Text>
                </View>
                <View style={styles.musclePrimary}>
                  <Text style={styles.muscleLabel}>ZONA</Text>
                  <Text style={styles.muscleName}>{capitalise(info.bodyPart)}</Text>
                </View>
              </View>

              {info.secondaryMuscles.length > 0 && (
                <View style={styles.secondarySection}>
                  <Text style={styles.muscleLabel}>MÚSCULOS SECUNDARIOS</Text>
                  <View style={styles.tagRow}>
                    {info.secondaryMuscles.map((m) => (
                      <View key={m} style={styles.tag}>
                        <Text style={styles.tagText}>{capitalise(m)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Instructions */}
              {info.instructions.length > 0 && (
                <View style={styles.instructionsSection}>
                  <Text style={styles.instructionsTitle}>Cómo hacerlo</Text>
                  {info.instructions.map((step, i) => (
                    <View key={i} style={styles.step}>
                      <Text style={styles.stepNumber}>{i + 1}</Text>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
    gap: 12,
  },
  title: {
    flex: 1,
    color: '#e0e0e0',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { color: '#aaa', fontSize: 14 },
  scroll: { padding: 20, paddingBottom: 40 },
  center: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  statusIcon: { fontSize: 48 },
  statusTitle: { color: '#e0e0e0', fontSize: 17, fontWeight: '700' },
  statusText: { color: '#777', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  gifContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    alignItems: 'center',
    minHeight: width - 40,
    justifyContent: 'center',
  },
  gif: { width: width - 40, height: width - 40 },
  gifHidden: { width: 0, height: 0 },
  gifPlaceholder: {
    position: 'absolute',
    width: width - 40,
    height: width - 40,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  gifErrorIcon: { fontSize: 40 },
  gifErrorText: { color: '#666', fontSize: 14 },
  muscleSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  musclePrimary: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  muscleLabel: {
    color: '#555',
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  muscleName: {
    color: '#e53935',
    fontSize: 15,
    fontWeight: '700',
  },
  secondarySection: { marginBottom: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tag: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#333',
  },
  tagText: { color: '#aaa', fontSize: 13 },
  instructionsSection: { gap: 12 },
  instructionsTitle: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNumber: {
    color: '#e53935',
    fontWeight: '700',
    fontSize: 14,
    width: 20,
    marginTop: 1,
  },
  stepText: { color: '#bbb', fontSize: 14, lineHeight: 20, flex: 1 },
});
