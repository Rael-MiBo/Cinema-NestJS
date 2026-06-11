import { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { getPedidoLocal } from '../../src/db/tickets';
import { api, getToken } from '../../src/api/client';
import { savePedidoLocal } from '../../src/db/tickets';
import { API_URL } from '../../src/config';
import type { Pedido } from '../../src/types';
import { shared } from '../../src/theme';
import { Buffer } from 'buffer';

let FileSystem: any = null;
let Sharing: any = null;

if (Platform.OS !== 'web') {
  FileSystem = require('expo-file-system');
  Sharing = require('expo-sharing');
}

export default function ComprovanteScreen() {
  const { pedidoId } = useLocalSearchParams<{ pedidoId: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  useEffect(() => {
    (async () => {
      const id = Number(pedidoId);
      let p = await getPedidoLocal(id);
      if (!p) {
        try {
          p = await api<Pedido>(`/pedidos/${pedidoId}`);
          await savePedidoLocal(p, true);
        } catch {
          /* ignore */
        }
      }
      setPedido(p);
    })();
  }, [pedidoId]);

  if (!pedido) {
    return (
      <View style={[shared.container, { justifyContent: 'center' }]}>
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  const emitirComprovante = async () => {
    setLoadingPdf(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${API_URL}/pedidos/${pedidoId}/comprovante`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error('Erro ao gerar comprovante');

      if (Platform.OS === 'web') {
        // Web: Open PDF in new tab
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        // Native: Save and share
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        const fileUri = `${FileSystem.documentDirectory}comprovante_${pedidoId}.pdf`;

        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: `Comprovante Pedido #${pedidoId}`,
          });
        } else {
          Alert.alert('Sucesso', 'Comprovante salvo com sucesso!');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o comprovante');
      console.error(error);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Comprovante' }} />
      <ScrollView style={shared.container}>
        <View style={shared.card}>
          <Text style={{ color: '#22c55e', fontSize: 20, fontWeight: '700' }}>
            Pagamento confirmado
          </Text>
          <Text style={{ color: '#94a3b8', marginTop: 8 }}>
            Pedido #{pedido.id}
          </Text>
          <Text style={{ color: '#94a3b8' }}>
            {new Date(pedido.dataHora).toLocaleString('pt-BR')}
          </Text>
          <Text style={{ color: '#fff', marginTop: 12, fontSize: 18 }}>
            Total: R$ {pedido.valorTotal.toFixed(2)}
          </Text>
          {pedido.metodoPagamento ? (
            <Text style={{ color: '#cbd5e1' }}>
              Pagamento: {pedido.metodoPagamento}
            </Text>
          ) : null}
        </View>

        <Text style={shared.title}>Ingressos</Text>
        {pedido.ingressos.map((ing) => (
          <View key={ing.id} style={shared.card}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {ing.sessao?.filme?.titulo ?? 'Filme'}
            </Text>
            <Text style={{ color: '#94a3b8' }}>
              {ing.sessao?.data
                ? new Date(ing.sessao.data).toLocaleString('pt-BR')
                : ''}{' '}
              · Sala {ing.sessao?.sala?.numero}
            </Text>
            <Text style={{ color: '#cbd5e1', marginTop: 4 }}>
              Fila {ing.fila + 1} · Assento {ing.assento + 1} · {ing.tipo} · R${' '}
              {ing.valorPago.toFixed(2)}
            </Text>
          </View>
        ))}

        {pedido.lanches.length > 0 && (
          <>
            <Text style={shared.title}>Combos</Text>
            {pedido.lanches.map((item) => (
              <View key={item.lanche.id} style={shared.card}>
                <Text style={{ color: '#fff' }}>
                  {item.quantidade}x {item.lanche.nome}
                </Text>
              </View>
            ))}
          </>
        )}

        <Pressable
              style={[shared.button, { marginTop: 24, marginBottom: 32 }]}
              onPress={emitirComprovante}
              disabled={loadingPdf}
            >
              <Text style={shared.buttonText}>
                {loadingPdf ? 'Gerando PDF...' : '📄 Emitir Comprovante (PDF)'}
              </Text>
            </Pressable>
      </ScrollView>
    </>
  );
}
