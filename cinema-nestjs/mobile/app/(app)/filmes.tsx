import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View, ActivityIndicator } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { api } from '../../src/api/client';
import type { Filme } from '../../src/types';
import { shared } from '../../src/theme';

export default function FilmesScreen() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api<Filme[]>('/filmes');
      setFilmes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar filmes');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={[shared.container, { justifyContent: 'center' }]}>
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={shared.container}>
      {error ? <Text style={shared.error}>{error}</Text> : null}
      <Pressable style={[shared.button, { marginBottom: 12 }]} onPress={load}>
        <Text style={shared.buttonText}>Sincronizar com servidor</Text>
      </Pressable>
      <FlatList
        data={filmes}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            style={shared.card}
            onPress={() =>
              router.push({
                pathname: '/sessoes/[filmeId]',
                params: { filmeId: String(item.id), titulo: item.titulo },
              })
            }
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
              {item.titulo}
            </Text>
            <Text style={{ color: '#94a3b8', marginTop: 4 }}>
              {item.genero?.nome} · {item.duracao} min · {item.classificacao}
            </Text>
            {item.sinopse ? (
              <Text style={{ color: '#cbd5e1', marginTop: 8 }} numberOfLines={2}>
                {item.sinopse}
              </Text>
            ) : null}
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ color: '#94a3b8' }}>Nenhum filme cadastrado. Rode o seed da API.</Text>
        }
      />
    </View>
  );
}
