import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { SeatSelection } from '../types';

type Props = {
  mapa: number[][];
  ocupados: { fila: number; assento: number }[];
  selected: SeatSelection[];
  onToggle: (seat: SeatSelection) => void;
};

export function SeatMap({ mapa, ocupados, selected, onToggle }: Props) {
  const isOcupado = (fila: number, assento: number) =>
    ocupados.some((o) => o.fila === fila && o.assento === assento);

  const isSelected = (fila: number, assento: number) =>
    selected.some((s) => s.fila === fila && s.assento === assento);

  return (
    <View style={styles.wrap}>
      <Text style={styles.screen}>TELA</Text>
      {mapa.map((row, fila) => (
        <View key={fila} style={styles.row}>
          <Text style={styles.rowLabel}>{fila + 1}</Text>
          {row.map((cell, assento) => {
            if (cell !== 1) return <View key={assento} style={styles.gap} />;
            const ocupado = isOcupado(fila, assento);
            const sel = isSelected(fila, assento);
            return (
              <Pressable
                key={assento}
                disabled={ocupado}
                onPress={() =>
                  onToggle({
                    fila,
                    assento,
                    tipo: sel
                      ? selected.find(
                          (s) => s.fila === fila && s.assento === assento,
                        )!.tipo
                      : 'inteira',
                  })
                }
                style={[
                  styles.seat,
                  ocupado && styles.occupied,
                  sel && styles.selected,
                ]}
              >
                <Text style={styles.seatText}>{assento + 1}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, alignItems: 'center' },
  screen: {
    color: '#94a3b8',
    marginBottom: 12,
    letterSpacing: 4,
    fontWeight: '700',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowLabel: { width: 18, color: '#64748b', fontSize: 12 },
  gap: { width: 28, height: 28 },
  seat: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  occupied: { backgroundColor: '#7f1d1d' },
  selected: { backgroundColor: '#2563eb' },
  seatText: { color: '#fff', fontSize: 10 },
});
