import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { loginRequest } from '@/api/auth';
import { getErrorMessage } from '@/utils/errors';
import { colors, spacing, fontSize } from '@/styles/theme';

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: async ({ user, accessToken, refreshToken }) => {
      await setSession(user, accessToken, refreshToken);
      router.replace('/');
    },
  });

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Connexion</Text>

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <Input
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />

      {mutation.isError && (
        <View style={styles.errorRow}>
          <AlertCircle size={16} color={colors.danger} />
          <Text style={styles.errorText}>{getErrorMessage(mutation.error)}</Text>
        </View>
      )}

      <Button
        variant="primary"
        fullWidth
        loading={mutation.isPending}
        onPress={() => mutation.mutate({ email, password })}
      >
        Se connecter
      </Button>

      <Link href="/register" style={styles.switchLink}>
        <Text style={styles.switchText}>
          Pas encore de compte ? <Text style={styles.switchAccent}>Créer un compte</Text>
        </Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing[4] },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginBottom: spacing[2] },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  errorText: { color: colors.danger, fontSize: fontSize.sm, flexShrink: 1 },
  switchLink: { alignSelf: 'center', marginTop: spacing[2] },
  switchText: { color: colors.textMuted, fontSize: fontSize.sm },
  switchAccent: { color: colors.primary, fontWeight: '700' },
});
