import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as notificationService from '../services/notification.service.js';

export const list = asyncHandler(async (req, res) => {
  const result = await notificationService.listNotifications(req.user._id);
  new ApiResponse(200, result).send(res);
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user._id, req.params.id);
  new ApiResponse(200, notification).send(res);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  new ApiResponse(200, null, 'Notifications marquées comme lues').send(res);
});
