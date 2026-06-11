import { Text } from 'react-native';
import { shared } from '../../theme';

type Props = { message: string };

export function ErrorText({ message }: Props) {
  if (!message) return null;
  return <Text style={shared.error}>{message}</Text>;
}
