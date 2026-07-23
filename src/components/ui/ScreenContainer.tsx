import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/styles/theme';

interface ScreenContainerProps extends ViewProps {
  scroll?: boolean;
}

/** Consistent background + safe-area + padding wrapper used by every screen. */
export function ScreenContainer({ children, style, scroll = false, ...props }: ScreenContainerProps) {
  const Content = scroll ? ScrollView : View;
  const contentProps = scroll ? { contentContainerStyle: [styles.content, style] } : { style: [styles.content, style] };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Content {...contentProps} {...props}>
        {children}
      </Content>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    padding: spacing[5],
    gap: spacing[5],
  },
});
