import { Text, View } from 'react-native';
import { shared, colors } from '../../theme';
import { CrudActions } from './CrudActions';
import type { Filme } from '../../types';

type Props = { filme: Filme; onEdit: () => void; onDelete: () => void };

export function FilmeAdminCard({ filme, onEdit, onDelete }: Props) {
  return (
    <View style={shared.card}>
      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{filme.titulo}</Text>
      <Text style={{ color: colors.muted, marginTop: 4 }}>
        {filme.genero?.nome} · {filme.duracao} min · {filme.classificacao}
      </Text>
      {filme.sinopse ? (
        <Text style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4 }} numberOfLines={2}>
          {filme.sinopse}
        </Text>
      ) : null}
      <CrudActions onEdit={onEdit} onDelete={onDelete} />
    </View>
  );
}
