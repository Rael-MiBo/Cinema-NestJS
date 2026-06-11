import { Text, View } from 'react-native';
import { shared, colors } from '../../theme';
import { CrudActions } from './CrudActions';
import type { LancheCombo } from '../../types';

type Props = { lanche: LancheCombo; onEdit: () => void; onDelete: () => void };

export function LancheAdminCard({ lanche, onEdit, onDelete }: Props) {
  return (
    <View style={shared.card}>
      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{lanche.nome}</Text>
      <Text style={{ color: colors.muted, marginTop: 4 }}>
        R$ {lanche.valorUnitario.toFixed(2)} · {lanche.qtUnidade} un.
      </Text>
      {lanche.descricao ? (
        <Text style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4 }}>{lanche.descricao}</Text>
      ) : null}
      <CrudActions onEdit={onEdit} onDelete={onDelete} />
    </View>
  );
}
