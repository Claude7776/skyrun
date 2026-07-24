import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as socialService from '../services/social.service.js';

export const feed = asyncHandler(async (req, res) => {
  const result = await socialService.getPublicFeed(req.user._id, req.query);
  new ApiResponse(200, result).send(res);
});

export const like = asyncHandler(async (req, res) => {
  const result = await socialService.likeCourse(req.user._id, req.params.id);
  new ApiResponse(200, result, 'Parcours aimé').send(res);
});

export const unlike = asyncHandler(async (req, res) => {
  const result = await socialService.unlikeCourse(req.user._id, req.params.id);
  new ApiResponse(200, result, 'Like retiré').send(res);
});

export const addComment = asyncHandler(async (req, res) => {
  const comment = await socialService.addComment(req.user._id, req.params.id, req.body.text);
  new ApiResponse(201, comment, 'Commentaire ajouté').send(res);
});

export const listComments = asyncHandler(async (req, res) => {
  const comments = await socialService.listComments(req.user._id, req.params.id);
  new ApiResponse(200, comments).send(res);
});

export const deleteComment = asyncHandler(async (req, res) => {
  await socialService.deleteComment(req.user._id, req.params.commentId);
  new ApiResponse(200, null, 'Commentaire supprimé').send(res);
});
