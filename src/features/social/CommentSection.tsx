import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, Trash2 } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { addCommentRequest, deleteCommentRequest, listCommentsRequest } from '@/api/social';
import { useAuthStore } from '@/store/authStore';
import { formatRelativeTime } from '@/utils/format';
import { colors, spacing, fontSize } from '@/styles/theme';
import type { Comment } from '@/types/social';

export function CommentSection({ courseId }: { courseId: string }) {
  const currentUserId = useAuthStore((s) => s.user?._id);
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const queryKey = ['comments', courseId];

  const { data: comments, isLoading } = useQuery({
    queryKey,
    queryFn: () => listCommentsRequest(courseId),
  });
  const commentsData: Comment[] | undefined = comments;

  const addMutation = useMutation({
    mutationFn: () => addCommentRequest(courseId, text),
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommentRequest(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Commentaires</Text>

      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <Input placeholder="Ajouter un commentaire..." value={text} onChangeText={setText} />
        </View>
        <Pressable
          onPress={() => text.trim() && addMutation.mutate()}
          disabled={addMutation.isPending || !text.trim()}
          style={styles.sendButton}
        >
          <Send size={18} color={colors.onPrimary} />
        </Pressable>
      </View>

      {isLoading && <Spinner />}

      {commentsData?.map((comment) => (
        <View key={comment._id} style={styles.comment}>
          <View style={{ flex: 1 }}>
            <View style={styles.commentHeader}>
              <Text style={styles.author}>{comment.user.name}</Text>
              <Text style={styles.time}>{formatRelativeTime(comment.createdAt)}</Text>
            </View>
            <Text style={styles.text}>{comment.text}</Text>
          </View>
          {comment.user._id === currentUserId && (
            <Pressable onPress={() => deleteMutation.mutate(comment._id)} hitSlop={8}>
              <Trash2 size={14} color={colors.textFaint} />
            </Pressable>
          )}
        </View>
      ))}

      {commentsData?.length === 0 && <Text style={styles.empty}>Aucun commentaire pour l'instant.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing[3] },
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing[2] },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  author: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  time: { color: colors.textFaint, fontSize: fontSize.xs },
  text: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing[1] },
  empty: { color: colors.textFaint, fontSize: fontSize.sm },
});
