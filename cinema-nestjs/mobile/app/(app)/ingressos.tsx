import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View, ActivityIndicator } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { listPedidosLocal } from '../../src/db/tickets';
import { syncPedidosFromServer } from '../../src/services/sync';
import type { Pedido } from '../../src/types';
import { shared } from '../../src/theme';

export default function IngressosScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await syncPedidosFromServer();
    } catch {
    }
    const local = await listPedidosLocal();
    setPedidos(local);
    setLoading(false);
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
      <Pressable style={[shared.button, { marginBottom: 12 }]} onPress={load}>
        <Text style={shared.buttonText}>Sincronizar com servidor</Text>
      </Pressable>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            style={shared.card}
            onPress={() =>
              router.push({
                pathname: '/comprovante/[pedidoId]',
                params: { pedidoId: String(item.id) },
              })
            }
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              Pedido #{item.id} · R$ {item.valorTotal.toFixed(2)}
            </Text>
            <Text style={{ color: '#94a3b8', marginTop: 4 }}>
              {new Date(item.dataHora).toLocaleString('pt-BR')} · {item.status}
            </Text>
            <Text style={{ color: '#cbd5e1', marginTop: 4 }}>
              {item.ingressos.length} ingresso(s)
              {item.lanches.length ? ` · ${item.lanches.length} combo(s)` : ''}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ color: '#94a3b8' }}>Nenhum ingresso ainda. Compre na aba Filmes.</Text>
        }
      />
    </View>
  );
}
