import { Pressable, Text, View } from 'react-native';
import { AppButton } from '../ui/AppButton';
import { shared, colors } from '../../theme';

const METODOS = ['PIX', 'Cartão', 'Dinheiro'];

type Props = {
  total: number;
  metodo: string;
  paying: boolean;
  onSelectMetodo: (m: string) => void;
  onPagar: () => void;
};

export function PagamentoStep({ total, metodo, paying, onSelectMetodo, onPagar }: Props) {
  return (
    <>
      <Text style={{ color: colors.text, marginBottom: 8, fontSize: 16 }}>
        Total: R$ {total.toFixed(2)}
      </Text>
      {METODOS.map((m) => (
        <Pressable
          key={m}
          style={[shared.card, metodo === m && { borderColor: colors.primary, borderWidth: 2 }]}
          onPress={() => onSelectMetodo(m)}
        >
          <Text style={{ color: colors.text }}>{m}</Text>
        </Pressable>
      ))}
      <AppButton
        label={paying ? 'Processando...' : 'Confirmar pagamento'}
        onPress={onPagar}
        loading={paying}
        style={{ marginTop: 8 }}
      />
    </>
  );
}
