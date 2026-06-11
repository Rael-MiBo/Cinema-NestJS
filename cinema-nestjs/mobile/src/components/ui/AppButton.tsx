import { ActivityIndicator, Pressable, StyleProp, Text, ViewStyle } from 'react-native';
import { shared, colors } from '../../theme';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'ghost';
  style?: StyleProp<ViewStyle>;
};

const BG: Record<string, string> = {
  primary: colors.primary,
  danger: colors.danger,
  ghost: colors.card,
};

export function AppButton({ label, onPress, loading, disabled, variant = 'primary', style }: Props) {
  return (
    <Pressable
      style={[shared.button, { backgroundColor: BG[variant] }, style]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={shared.buttonText}>{label}</Text>
      }
    </Pressable>
  );
}
