import type { Lesson } from '@/schemas';
import { lessonsD1 } from './lessons-d1';
import { lessonsD2 } from './lessons-d2';
import { lessonsD3 } from './lessons-d3';
import { lessonsD4 } from './lessons-d4';
import { lessonsD5 } from './lessons-d5';
import { lessonsD6 } from './lessons-d6';
import { lessonsD7 } from './lessons-d7';

export const lessons: Lesson[] = [
  ...lessonsD1,
  ...lessonsD2,
  ...lessonsD3,
  ...lessonsD4,
  ...lessonsD5,
  ...lessonsD6,
  ...lessonsD7,
];
