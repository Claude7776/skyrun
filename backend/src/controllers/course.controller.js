import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as courseService from '../services/course.service.js';

export const create = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.user._id, req.body);
  new ApiResponse(201, course, 'Parcours créé').send(res);
});

export const list = asyncHandler(async (req, res) => {
  const result = await courseService.listCourses(req.user._id, req.query);
  new ApiResponse(200, result).send(res);
});

export const getOne = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.user._id, req.params.id);
  // Shaped here (not in the service) so social.service.js can keep reusing
  // getCourseById for its raw Mongoose document (needed to push/save likes).
  const shaped = {
    ...course.toObject(),
    likesCount: course.likes.length,
    likedByMe: course.likes.some((id) => id.equals(req.user._id)),
  };
  new ApiResponse(200, shaped).send(res);
});

export const update = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.user._id, req.params.id, req.body);
  new ApiResponse(200, course, 'Parcours mis à jour').send(res);
});

export const share = asyncHandler(async (req, res) => {
  const course = await courseService.shareCourse(req.user._id, req.params.id);
  new ApiResponse(200, course, 'Parcours partagé').send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.user._id, req.params.id);
  new ApiResponse(200, null, 'Parcours supprimé').send(res);
});
