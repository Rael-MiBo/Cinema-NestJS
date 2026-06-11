import { Text } from 'react-native';

type Props = { message: string };

export function SuccessText({ message }: Props) {
  if (!message) return null;
  return <Text style={{ color: '#22c55e', marginBottom: 12, fontSize: 14 }}>{message}</Text>;
}
