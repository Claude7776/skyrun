import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';
import { Camera, UserRound } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { uploadAvatarRequest } from '@/api/auth';
import { resolveAssetUrl } from '@/utils/url';
import { colors, radius, shadows } from '@/styles/theme';

const AVATAR_SIZE = 120;

export function AvatarPicker() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const mutation = useMutation({
    mutationFn: uploadAvatarRequest,
    onSuccess: (updatedUser) => updateUser(updatedUser),
  });

  const handlePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const extension = asset.uri.split('.').pop() ?? 'jpg';
    mutation.mutate({
      uri: asset.uri,
      name: `avatar.${extension}`,
      mimeType: asset.mimeType ?? `image/${extension}`,
    });
  };

  const avatarUrl = resolveAssetUrl(user?.avatarUrl);

  return (
    <Pressable onPress={handlePick} style={styles.wrapper} disabled={mutation.isPending}>
      {/* Shadow lives on this outer, non-clipping wrapper — iOS clips a
          view's own shadow when overflow:hidden is set, which the inner
          view needs for the circular crop (same split GlassCard uses). */}
      <View style={styles.shadowWrapper}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.image} />
          ) : (
            <UserRound size={40} color={colors.textMuted} />
          )}
          {mutation.isPending && (
            <View style={styles.overlay}>
              <ActivityIndicator color={colors.text} />
            </View>
          )}
        </View>
      </View>
      <View style={styles.badge}>
        <Camera size={16} color={colors.onPrimary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'center' },
  shadowWrapper: {
    borderRadius: AVATAR_SIZE / 2,
    ...shadows.raised,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 20, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
});
