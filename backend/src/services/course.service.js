import { Course } from '../models/Course.js';
import { ApiError } from '../utils/ApiError.js';

export async function createCourse(userId, data) {
  return Course.create({ user: userId, ...data });
}

export async function listCourses(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Course.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Course.countDocuments({ user: userId }),
  ]);
  return { items, total, page, limit };
}

/** Strict ownership check, used by every mutation (update/share/delete). */
async function getOwnedCourse(userId, courseId) {
  const course = await Course.findOne({ _id: courseId, user: userId });
  if (!course) throw ApiError.notFound('Parcours introuvable');
  return course;
}

/**
 * Read access: owner OR public — a course shared to the social feed must be
 * viewable (and like/comment-able, see social.service.js) by other users,
 * not just its creator. Mutations always go through getOwnedCourse instead.
 */
export async function getCourseById(userId, courseId) {
  const course = await Course.findOne({ _id: courseId, $or: [{ user: userId }, { isPublic: true }] });
  if (!course) throw ApiError.notFound('Parcours introuvable');
  return course;
}

export async function updateCourse(userId, courseId, data) {
  const course = await getOwnedCourse(userId, courseId);
  Object.assign(course, data);
  await course.save();
  return course;
}

export async function shareCourse(userId, courseId) {
  const course = await getOwnedCourse(userId, courseId);
  course.isPublic = true;
  await course.save();
  return course;
}

export async function deleteCourse(userId, courseId) {
  const course = await getOwnedCourse(userId, courseId);
  await course.deleteOne();
}
