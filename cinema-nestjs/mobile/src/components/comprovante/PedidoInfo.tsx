import { Text, View } from 'react-native';
import { shared, colors } from '../../theme';
import type { Pedido } from '../../types';

type Props = { pedido: Pedido };

export function PedidoInfo({ pedido }: Props) {
  return (
    <View style={shared.card}>
      <Text style={{ color: colors.success, fontSize: 20, fontWeight: '700' }}>
        ✅ Pagamento confirmado
      </Text>
      <Text style={{ color: colors.muted, marginTop: 8 }}>Pedido #{pedido.id}</Text>
      <Text style={{ color: colors.muted }}>
        {new Date(pedido.dataHora).toLocaleString('pt-BR')}
      </Text>
      <Text style={{ color: colors.text, marginTop: 12, fontSize: 18 }}>
        Total: R$ {pedido.valorTotal.toFixed(2)}
      </Text>
      {pedido.metodoPagamento ? (
        <Text style={{ color: '#cbd5e1' }}>Pagamento: {pedido.metodoPagamento}</Text>
      ) : null}
    </View>
  );
}
