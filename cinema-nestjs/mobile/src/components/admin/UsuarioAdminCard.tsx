import { Pressable, Text, View } from 'react-native';
import { shared, colors } from '../../theme';
import { AppButton } from '../ui/AppButton';

type UserAdmin = { id: number; name: string; email: string; profile: { name: string } };
type Props = { user: UserAdmin; onPromote: () => void; onDelete: () => void };

export function UsuarioAdminCard({ user, onPromote, onDelete }: Props) {
  const isAdmin = user.profile.name === 'ADMIN';
  return (
    <View style={shared.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{user.name}</Text>
          <Text style={{ color: colors.muted, marginTop: 2 }}>{user.email}</Text>
        </View>
        <View style={[
          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
          isAdmin ? { backgroundColor: '#7c3aed' } : { backgroundColor: colors.card },
        ]}>
          <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>{user.profile.name}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        {!isAdmin && (
          <AppButton
            label="⬆️ Tornar Admin"
            onPress={onPromote}
            style={{ flex: 1, paddingVertical: 8, backgroundColor: '#7c3aed' }}
          />
        )}
        <AppButton label="🗑 Remover" onPress={onDelete} variant="danger" style={{ flex: 1, paddingVertical: 8 }} />
      </View>
    </View>
  );
}
