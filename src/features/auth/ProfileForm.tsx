import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { updateProfileRequest } from '@/api/auth';
import { getErrorMessage } from '@/utils/errors';
import { colors, spacing, fontSize } from '@/styles/theme';

export function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const mutation = useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setCurrentPassword('');
      setNewPassword('');
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      name: name !== user?.name ? name : undefined,
      email: email !== user?.email ? email : undefined,
      ...(newPassword ? { currentPassword, newPassword } : {}),
    });
  };

  return (
    <View style={styles.form}>
      <Text style={styles.sectionTitle}>Informations</Text>
      <Input label="Nom" value={name} onChangeText={setName} autoComplete="name" />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />

      <Text style={styles.sectionTitle}>Changer le mot de passe (optionnel)</Text>
      <Input
        label="Mot de passe actuel"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />
      <Input label="Nouveau mot de passe" value={newPassword} onChangeText={setNewPassword} secureTextEntry />

      {mutation.isError && (
        <View style={styles.messageRow}>
          <AlertCircle size={16} color={colors.danger} />
          <Text style={styles.errorText}>{getErrorMessage(mutation.error)}</Text>
        </View>
      )}
      {mutation.isSuccess && (
        <View style={styles.messageRow}>
          <CheckCircle2 size={16} color={colors.success} />
          <Text style={styles.successText}>Profil mis à jour</Text>
        </View>
      )}

      <Button variant="primary" fullWidth loading={mutation.isPending} onPress={handleSubmit}>
        Enregistrer
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing[4] },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing[2],
  },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  errorText: { color: colors.danger, fontSize: fontSize.sm, flexShrink: 1 },
  successText: { color: colors.success, fontSize: fontSize.sm },
});
