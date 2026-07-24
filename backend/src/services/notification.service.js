import { Notification } from '../models/Notification.js';
import { Run } from '../models/Run.js';
import { ApiError } from '../utils/ApiError.js';

const REMINDER_INACTIVITY_DAYS = 3;

/**
 * No scheduler/cron in this backend: instead of a background job, a training
 * reminder is synthesized lazily the next time the user checks their
 * notifications, if they've gone quiet for REMINDER_INACTIVITY_DAYS and
 * don't already have a recent reminder (so this stays idempotent across
 * repeated calls within the same inactivity window).
 */
async function maybeCreateTrainingReminder(userId) {
  const since = new Date(Date.now() - REMINDER_INACTIVITY_DAYS * 24 * 60 * 60 * 1000);
  const [recentRun, recentReminder] = await Promise.all([
    Run.findOne({ user: userId, date: { $gte: since } }),
    Notification.findOne({ user: userId, type: 'training_reminder', createdAt: { $gte: since } }),
  ]);

  if (!recentRun && !recentReminder) {
    await Notification.create({
      user: userId,
      type: 'training_reminder',
      message: `Ça fait ${REMINDER_INACTIVITY_DAYS} jours sans footing... c'est le moment d'y retourner !`,
    });
  }
}

export async function listNotifications(userId) {
  await maybeCreateTrainingReminder(userId);

  const [items, unreadCount] = await Promise.all([
    Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return { items, unreadCount };
}

export async function markAsRead(userId, notificationId) {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) throw ApiError.notFound('Notification introuvable');
  notification.isRead = true;
  await notification.save();
  return notification;
}

export async function markAllAsRead(userId) {
  await Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });
}
