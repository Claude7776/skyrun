export type NotificationType = 'goal_achieved' | 'new_record' | 'training_reminder';

export interface AppNotification {
  _id: string;
  user: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  relatedGoal: string | null;
  createdAt: string;
  updatedAt: string;
}
