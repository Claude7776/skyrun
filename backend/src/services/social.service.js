import { Course } from '../models/Course.js';
import { Comment } from '../models/Comment.js';
import { ApiError } from '../utils/ApiError.js';
import { getCourseById } from './course.service.js';

export async function getPublicFeed(currentUserId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Course.find({ isPublic: true }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name avatarUrl'),
    Course.countDocuments({ isPublic: true }),
  ]);

  const shaped = items.map((course) => ({
    ...course.toObject(),
    likesCount: course.likes.length,
    likedByMe: course.likes.some((id) => id.equals(currentUserId)),
  }));

  return { items: shaped, total, page, limit };
}

export async function likeCourse(userId, courseId) {
  const course = await getCourseById(userId, courseId);
  if (!course.likes.some((id) => id.equals(userId))) {
    course.likes.push(userId);
    await course.save();
  }
  return { likesCount: course.likes.length, likedByMe: true };
}

export async function unlikeCourse(userId, courseId) {
  const course = await getCourseById(userId, courseId);
  course.likes = course.likes.filter((id) => !id.equals(userId));
  await course.save();
  return { likesCount: course.likes.length, likedByMe: false };
}

export async function addComment(userId, courseId, text) {
  await getCourseById(userId, courseId); // ensures the course exists and is visible to this user
  const comment = await Comment.create({ course: courseId, user: userId, text });
  return comment.populate('user', 'name avatarUrl');
}

export async function listComments(userId, courseId) {
  await getCourseById(userId, courseId);
  return Comment.find({ course: courseId }).sort({ createdAt: 1 }).populate('user', 'name avatarUrl');
}

export async function deleteComment(userId, commentId) {
  const comment = await Comment.findOneAndDelete({ _id: commentId, user: userId });
  if (!comment) throw ApiError.notFound('Commentaire introuvable');
}
