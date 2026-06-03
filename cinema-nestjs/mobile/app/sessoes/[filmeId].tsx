import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { api } from '../../src/api/client';
import type { Sessao } from '../../src/types';
import { shared } from '../../src/theme';

export default function SessoesScreen() {
  const { filmeId, titulo } = useLocalSearchParams<{ filmeId: string; titulo?: string }>();
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api<Sessao[]>(`/sessoes?filmeId=${filmeId}`);
    setSessoes(data);
    setLoading(false);
  }, [filmeId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <>
      <Stack.Screen options={{ title: titulo ?? 'Sessões' }} />
      <View style={shared.container}>
        {loading ? (
          <ActivityIndicator color="#3b82f6" />
        ) : (
          <FlatList
            data={sessoes}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <Pressable
                style={shared.card}
                onPress={() =>
                  router.push({
                    pathname: '/compra/[sessaoId]',
                    params: { sessaoId: String(item.id) },
                  })
                }
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {new Date(item.data).toLocaleString('pt-BR')}
                </Text>
                <Text style={{ color: '#94a3b8', marginTop: 4 }}>
                  Sala {item.sala?.numero} · R$ {item.valorIngresso.toFixed(2)}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={{ color: '#94a3b8' }}>Sem sessões para este filme.</Text>
            }
          />
        )}
      </View>
    </>
  );
}
