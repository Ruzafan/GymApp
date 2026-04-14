import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '@/models/types';
import HomeScreen from '@/screens/HomeScreen';
import CaptureScreen from '@/screens/CaptureScreen';
import ReviewScreen from '@/screens/ReviewScreen';
import WorkoutScreen from '@/screens/WorkoutScreen';
import HistoryDetailScreen from '@/screens/HistoryDetailScreen';

const Stack = createStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: '#0f0f0f' },
  headerTintColor: '#e0e0e0',
  headerTitleStyle: { fontWeight: '600' as const },
  cardStyle: { backgroundColor: '#0f0f0f' },
};

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Mis Entrenamientos' }}
      />
      <Stack.Screen
        name="Capture"
        component={CaptureScreen}
        options={{ title: 'Nuevo Entrenamiento' }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: 'Revisar Ejercicios' }}
      />
      <Stack.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{ title: 'Entrenamiento', headerLeft: () => null }}
      />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{ title: 'Detalle' }}
      />
    </Stack.Navigator>
  );
}
