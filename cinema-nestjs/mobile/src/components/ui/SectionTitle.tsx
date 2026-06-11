import { Text } from 'react-native';
import { colors } from '../../theme';

type Props = { children: string; size?: number };

export function SectionTitle({ children, size = 20 }: Props) {
  return (
    <Text style={{ color: colors.text, fontWeight: '700', fontSize: size, marginBottom: 12 }}>
      {children}
    </Text>
  );
}
