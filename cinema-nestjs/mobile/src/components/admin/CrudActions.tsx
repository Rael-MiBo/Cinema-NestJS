import { View } from 'react-native';
import { AppButton } from '../ui/AppButton';

type Props = {
  onEdit: () => void;
  onDelete: () => void;
};

export function CrudActions({ onEdit, onDelete }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
      <AppButton label="✏️ Editar"  onPress={onEdit}   style={{ flex: 1, paddingVertical: 8 }} />
      <AppButton label="🗑 Remover" onPress={onDelete} variant="danger" style={{ flex: 1, paddingVertical: 8 }} />
    </View>
  );
}
