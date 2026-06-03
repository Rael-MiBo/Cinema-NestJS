import { Tabs, router } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function AppLayout() {
  const { logout, user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#1e293b' },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#94a3b8',
        headerRight: () => (
          <Pressable
            onPress={async () => {
              await logout();
              router.replace('/(auth)/login');
            }}
            style={{ marginRight: 12 }}
          >
            <Text style={{ color: '#ef4444' }}>Sair</Text>
          </Pressable>
        ),
        title: user?.name ?? 'Cinema',
      }}
    >
      <Tabs.Screen name="filmes" options={{ title: 'Filmes', tabBarLabel: 'Filmes' }} />
      <Tabs.Screen name="ingressos" options={{ title: 'Meus ingressos', tabBarLabel: 'Ingressos' }} />
    </Tabs>
  );
}
