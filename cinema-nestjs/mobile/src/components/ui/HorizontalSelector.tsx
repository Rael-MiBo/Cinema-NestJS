import { Pressable, ScrollView, Text, View } from 'react-native';
import { colors } from '../../theme';

type Item = { id: number; label: string };

type Props = {
  label: string;
  items: Item[];
  value: string;
  onSelect: (v: string) => void;
};

export function HorizontalSelector({ label, items, value, onSelect }: Props) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.muted, marginBottom: 6 }}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map((i) => (
          <Pressable
            key={i.id}
            onPress={() => onSelect(String(i.id))}
            style={[
              { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginRight: 8, backgroundColor: colors.card },
              value === String(i.id) && { backgroundColor: colors.primary },
            ]}
          >
            <Text style={{ color: colors.text, fontWeight: value === String(i.id) ? '700' : '400' }}>
              {i.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
