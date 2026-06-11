import { View } from 'react-native';
import { AppButton } from '../ui/AppButton';
import { SectionTitle } from '../ui/SectionTitle';

type Props = {
  title: string;
  saving: boolean;
  editing: boolean;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
};

export function CrudForm({ title, saving, editing, onSave, onCancel, children }: Props) {
  return (
    <>
      <SectionTitle>{title}</SectionTitle>
      {children}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
        <AppButton
          label={saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar'}
          onPress={onSave}
          loading={saving}
          style={{ flex: 1 }}
        />
        {editing && (
          <AppButton label="Cancelar" onPress={onCancel} variant="ghost" />
        )}
      </View>
    </>
  );
}
