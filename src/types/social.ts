import type { Course } from './course';

export interface CourseAuthor {
  _id: string;
  name: string;
  avatarUrl: string | null;
}

export interface FeedCourse extends Omit<Course, 'user'> {
  user: CourseAuthor;
  likesCount: number;
  likedByMe: boolean;
}

export interface Comment {
  _id: string;
  course: string;
  user: CourseAuthor;
  text: string;
  createdAt: string;
}
