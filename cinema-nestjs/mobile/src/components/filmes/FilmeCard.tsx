import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { shared, colors } from '../../theme';
import type { Filme } from '../../types';

type Props = { filme: Filme };

export function FilmeCard({ filme }: Props) {
  return (
    <Pressable
      style={shared.card}
      onPress={() =>
        router.push({
          pathname: '/sessoes/[filmeId]',
          params: { filmeId: String(filme.id), titulo: filme.titulo },
        })
      }
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', flex: 1, marginRight: 8 }}>
          {filme.titulo}
        </Text>
        <View style={{ backgroundColor: colors.card, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{filme.classificacao}</Text>
        </View>
      </View>
      <Text style={{ color: colors.muted, marginTop: 4 }}>
        {filme.genero?.nome} · {filme.duracao} min
      </Text>
      {filme.sinopse ? (
        <Text style={{ color: '#cbd5e1', marginTop: 8 }} numberOfLines={2}>
          {filme.sinopse}
        </Text>
      ) : null}
    </Pressable>
  );
}
