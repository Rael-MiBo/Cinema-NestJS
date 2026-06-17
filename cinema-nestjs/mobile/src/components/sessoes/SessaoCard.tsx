import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { shared, colors } from '../../theme';
import type { Sessao } from '../../types';

type Props = { sessao: Sessao };

export function SessaoCard({ sessao }: Props) {
  return (
    <Pressable
      style={shared.card}
      onPress={() =>
        router.push({
          pathname: '/sessoes/23',
          params: { id: String(sessao.id) },
        })
      }
    >
      <Text style={{ color: colors.text, fontWeight: '600' }}>
        {new Date(sessao.data).toLocaleString('pt-BR')}
      </Text>
      <Text style={{ color: colors.muted, marginTop: 4 }}>
        Sala {sessao.sala ? sessao.sala.numero : 'Não informada'} · R$ {sessao.valorIngresso.toFixed(2)}
      </Text>
    </Pressable>
  );
}