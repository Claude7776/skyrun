import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Footprints } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors, radius, spacing, fontSize } from '@/styles/theme';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>À propos</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.brandBlock}>
        <View style={styles.iconWrap}>
          <Footprints size={28} color={colors.primary} />
        </View>
        <Text style={styles.appName}>SkyRun</Text>
        <Text style={styles.tagline}>Trajets prédéfinis & suivi de performance</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  brandBlock: { alignItems: 'center', gap: spacing[2], paddingVertical: spacing[7] },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(31, 206, 143, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  appName: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  tagline: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center' },
  version: { color: colors.textFaint, fontSize: fontSize.xs, marginTop: spacing[3] },
});
