import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/models/types';
import { extractWorkout } from '@/services/claudeService';
import LoadingOverlay from '@/components/LoadingOverlay';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Capture'>;
};

export default function CaptureScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  async function handlePickImage(source: 'camera' | 'gallery') {
    let result: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitas permitir el acceso a la camara.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitas permitir el acceso a la galeria.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });
    }

    if (result.canceled || !result.assets[0]) return;

    const imageUri = result.assets[0].uri;

    try {
      setLoadingMessage('Analizando tu entrenamiento...');
      setLoading(true);
      const parsedWorkout = await extractWorkout(imageUri);
      navigation.navigate('Review', { parsedWorkout, imageUri });
    } catch (error) {
      Alert.alert(
        'Error al analizar la imagen',
        error instanceof Error ? error.message : 'Error desconocido. Intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} message={loadingMessage} />

      <View style={styles.hero}>
        <Text style={styles.heroIcon}>📷</Text>
        <Text style={styles.heroTitle}>Fotografía tu listado</Text>
        <Text style={styles.heroSubtitle}>
          Toma una foto o selecciona una imagen de tu listado de ejercicios y la IA extraerá
          todos los ejercicios, series y repeticiones automáticamente.
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => handlePickImage('camera')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonIcon}>📷</Text>
          <Text style={styles.buttonText}>Usar cámara</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => handlePickImage('gallery')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonIcon}>🖼️</Text>
          <Text style={styles.buttonText}>Elegir de galería</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Funciona mejor con fotos nítidas y bien iluminadas
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  buttonPrimary: {
    backgroundColor: '#e53935',
  },
  buttonSecondary: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  hint: {
    textAlign: 'center',
    color: '#555',
    fontSize: 13,
    marginTop: 24,
  },
});
