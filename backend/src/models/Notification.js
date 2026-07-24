import mongoose from 'mongoose';

// Created starting Phase 5 (goal achievement). Read/list endpoints and the
// remaining triggers (new record, training reminder) land in Phase 6.
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['goal_achieved', 'new_record', 'training_reminder'], required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedGoal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
