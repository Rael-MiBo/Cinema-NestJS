import { Text, View } from 'react-native';
import { colors } from '../../theme';

const STEPS = ['1.Assentos', '2.Lanches', '3.Pagar'] as const;
type Step = 'assentos' | 'lanches' | 'pagamento';
const MAP: Record<Step, string> = { assentos: '1.Assentos', lanches: '2.Lanches', pagamento: '3.Pagar' };

type Props = { current: Step };

export function StepIndicator({ current }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
      {STEPS.map((s) => (
        <Text
          key={s}
          style={{
            color: MAP[current] === s ? colors.primary : colors.muted,
            fontWeight: MAP[current] === s ? '700' : '400',
          }}
        >
          {s}
        </Text>
      ))}
    </View>
  );
}
