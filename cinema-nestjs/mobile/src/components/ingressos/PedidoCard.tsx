import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { shared, colors } from '../../theme';
import type { Pedido } from '../../types';

type Props = { pedido: Pedido };

export function PedidoCard({ pedido }: Props) {
  return (
    <Pressable
      style={shared.card}
      onPress={() =>
        router.push({
          pathname: '/comprovante/[pedidoId]',
          params: { pedidoId: String(pedido.id) },
        })
      }
    >
      <Text style={{ color: colors.text, fontWeight: '600' }}>
        Pedido #{pedido.id} · R$ {pedido.valorTotal.toFixed(2)}
      </Text>
      <Text style={{ color: colors.muted, marginTop: 4 }}>
        {new Date(pedido.dataHora).toLocaleString('pt-BR')} · {pedido.status}
      </Text>
      <Text style={{ color: '#cbd5e1', marginTop: 4 }}>
        {pedido.ingressos.length} ingresso(s)
        {pedido.lanches.length ? ` · ${pedido.lanches.length} combo(s)` : ''}
      </Text>
    </Pressable>
  );
}
