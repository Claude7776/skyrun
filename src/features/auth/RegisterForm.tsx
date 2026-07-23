import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { registerRequest } from '@/api/auth';
import { getErrorMessage } from '@/utils/errors';
import { colors, spacing, fontSize } from '@/styles/theme';

export function RegisterForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: async ({ user, accessToken, refreshToken }) => {
      await setSession(user, accessToken, refreshToken);
      router.replace('/');
    },
  });

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return;
    }
    setLocalError(null);
    mutation.mutate({ name, email, password });
  };

  const error = localError ?? (mutation.isError ? getErrorMessage(mutation.error) : null);

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Créer un compte</Text>

      <Input label="Nom" value={name} onChangeText={setName} autoComplete="name" />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <Input label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
      <Input
        label="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {error && (
        <View style={styles.errorRow}>
          <AlertCircle size={16} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Button variant="primary" fullWidth loading={mutation.isPending} onPress={handleSubmit}>
        Créer mon compte
      </Button>

      <Link href="/login" style={styles.switchLink}>
        <Text style={styles.switchText}>
          Déjà un compte ? <Text style={styles.switchAccent}>Se connecter</Text>
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
