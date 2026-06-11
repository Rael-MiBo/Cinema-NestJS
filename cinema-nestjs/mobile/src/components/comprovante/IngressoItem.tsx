import { Text, View } from 'react-native';
import { shared, colors } from '../../theme';
import type { Pedido } from '../../types';

type Ingresso = Pedido['ingressos'][number];
type Props = { ingresso: Ingresso };

export function IngressoItem({ ingresso }: Props) {
  return (
    <View style={shared.card}>
      <Text style={{ color: colors.text, fontWeight: '600' }}>
        {ingresso.sessao?.filme?.titulo ?? 'Filme'}
      </Text>
      <Text style={{ color: colors.muted }}>
        {ingresso.sessao?.data ? new Date(ingresso.sessao.data).toLocaleString('pt-BR') : ''}
        {' · '}Sala {ingresso.sessao?.sala?.numero}
      </Text>
      <Text style={{ color: '#cbd5e1', marginTop: 4 }}>
        Fila {ingresso.fila + 1} · Assento {ingresso.assento + 1} · {ingresso.tipo} · R$ {ingresso.valorPago.toFixed(2)}
      </Text>
    </View>
  );
}
