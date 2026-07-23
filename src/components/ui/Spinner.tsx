import { ActivityIndicator } from 'react-native';
import { colors } from '@/styles/theme';

export function Spinner({ size = 'small', color = colors.primary }: { size?: 'small' | 'large'; color?: string }) {
  return <ActivityIndicator size={size} color={color} />;
}
