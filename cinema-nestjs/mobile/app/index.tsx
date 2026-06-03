import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  if (user) return <Redirect href="/(app)/filmes" />;
  return <Redirect href="/(auth)/login" />;
}
