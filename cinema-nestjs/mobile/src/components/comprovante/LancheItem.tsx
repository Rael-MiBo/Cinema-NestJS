import { Text, View } from 'react-native';
import { shared } from '../../theme';
import type { Pedido } from '../../types';

type Item = Pedido['lanches'][number];
type Props = { item: Item };

export function LancheItem({ item }: Props) {
  return (
    <View style={shared.card}>
      <Text style={{ color: '#fff' }}>
        {item.quantidade}x {item.lanche.nome}
      </Text>
    </View>
  );
}
