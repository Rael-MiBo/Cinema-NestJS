import { ActivityIndicator, View } from 'react-native';
import { colors } from '../../theme';

export function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
