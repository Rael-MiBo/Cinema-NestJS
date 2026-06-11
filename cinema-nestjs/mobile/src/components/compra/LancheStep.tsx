import { Pressable, Text, View } from 'react-native';
import { AppButton } from '../ui/AppButton';
import { shared, colors } from '../../theme';
import type { LancheCombo } from '../../types';

type Props = {
  lanches: LancheCombo[];
  lancheIds: number[];
  onToggle: (id: number) => void;
  onNext: () => void;
};

export function LancheStep({ lanches, lancheIds, onToggle, onNext }: Props) {
  return (
    <>
      {lanches.length === 0 && (
        <Text style={{ color: colors.muted, marginBottom: 12 }}>
          Nenhum combo disponível no momento.
        </Text>
      )}
      {lanches.map((l) => (
        <Pressable
          key={l.id}
          style={[shared.card, lancheIds.includes(l.id) && { borderWidth: 2, borderColor: colors.primary }]}
          onPress={() => onToggle(l.id)}
        >
          <Text style={{ color: colors.text, fontWeight: '600' }}>{l.nome}</Text>
          <Text style={{ color: colors.muted }}>R$ {l.valorUnitario.toFixed(2)}</Text>
          {l.descricao ? <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{l.descricao}</Text> : null}
        </Pressable>
      ))}
      <AppButton label="Ir para pagamento" onPress={onNext} style={{ marginTop: 8 }} />
    </>
  );
}
