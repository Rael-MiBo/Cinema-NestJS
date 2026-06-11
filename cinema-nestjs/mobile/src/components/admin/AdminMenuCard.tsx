import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { shared, colors } from '../../theme';

type Props = {
  label: string;
  description?: string;
  href: string;
};

export function AdminMenuCard({ label, description, href }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [shared.card, { opacity: pressed ? 0.7 : 1 }]}
      onPress={() => router.push(href as any)}
    >
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{label}</Text>
      {description && (
        <Text style={{ color: colors.muted, marginTop: 4, fontSize: 13 }}>{description}</Text>
      )}
    </Pressable>
  );
}
