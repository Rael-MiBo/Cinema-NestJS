import { Text, View } from 'react-native';
import { shared, colors } from '../../theme';
import { CrudActions } from './CrudActions';
import type { Sessao } from '../../types';

type Props = { sessao: Sessao; onEdit: () => void; onDelete: () => void };

export function SessaoAdminCard({ sessao, onEdit, onDelete }: Props) {
  return (
    <View style={shared.card}>
      <Text style={{ color: colors.text, fontWeight: '700' }}>
        {sessao.filme?.titulo ?? `Sessão #${sessao.id}`}
      </Text>
      <Text style={{ color: colors.muted, marginTop: 4 }}>
        {new Date(sessao.data).toLocaleString('pt-BR')}
        {' · '}Sala {(sessao as any).sala?.numero ?? (sessao as any).salaId}
        {' · '}R$ {sessao.valorIngresso.toFixed(2)}
      </Text>
      <CrudActions onEdit={onEdit} onDelete={onDelete} />
    </View>
  );
}
