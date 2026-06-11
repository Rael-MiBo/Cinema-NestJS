import { Pressable, Text, View } from 'react-native';
import { SeatMap } from '../SeatMap';
import { AppButton } from '../ui/AppButton';
import { shared, colors } from '../../theme';
import type { SeatSelection, Sessao } from '../../types';

type Props = {
  sessao: Sessao;
  selected: SeatSelection[];
  onToggle: (s: SeatSelection) => void;
  onToggleTipo: (fila: number, assento: number) => void;
  onNext: () => void;
};

export function AssentoStep({ sessao, selected, onToggle, onToggleTipo, onNext }: Props) {
  const mapa = (sessao.sala?.poltronas as number[][]) ?? [];
  const ocupados = sessao.ingressos ?? [];

  return (
    <>
      <SeatMap mapa={mapa} ocupados={ocupados} selected={selected} onToggle={onToggle} />

      {selected.map((s) => (
        <Pressable
          key={`${s.fila}-${s.assento}`}
          style={[shared.card, { flexDirection: 'row', justifyContent: 'space-between' }]}
          onPress={() => onToggleTipo(s.fila, s.assento)}
        >
          <Text style={{ color: colors.text }}>
            Fila {s.fila + 1} · Assento {s.assento + 1}
          </Text>
          <Text style={{ color: colors.primary }}>
            {s.tipo.toUpperCase()} (toque para alternar)
          </Text>
        </Pressable>
      ))}

      <AppButton
        label="Continuar"
        onPress={onNext}
        disabled={selected.length === 0}
        style={{ marginTop: 12 }}
      />
    </>
  );
}
