import { Text, View } from 'react-native';
import { shared, colors } from '../../theme';
import { CrudActions } from './CrudActions';

type Sala = { id: number; numero: string; capacidade: number };
type Props = { sala: Sala; onEdit: () => void; onDelete: () => void };

export function SalaAdminCard({ sala, onEdit, onDelete }: Props) {
  return (
    <View style={shared.card}>
      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>Sala {sala.numero}</Text>
      <Text style={{ color: colors.muted, marginTop: 4 }}>{sala.capacidade} assentos</Text>
      <CrudActions onEdit={onEdit} onDelete={onDelete} />
    </View>
  );
}
