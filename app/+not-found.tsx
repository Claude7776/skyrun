import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { colors, spacing, fontSize } from '@/styles/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.subtitle}>Cette page n'existe pas.</Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Retour au tableau de bord</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    padding: spacing[5],
  },
  title: { color: colors.text, fontSize: fontSize['2xl'], fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.md },
  link: { marginTop: spacing[3] },
  linkText: { color: colors.primary, fontWeight: '700', fontSize: fontSize.md },
});
