import type { Question } from '@/schemas';
import { questionsOfficial } from './questions-official';
import { questionsD1 } from './questions-d1';
import { questionsD2 } from './questions-d2';
import { questionsD3 } from './questions-d3';
import { questionsD4 } from './questions-d4';
import { questionsD5 } from './questions-d5';
import { questionsD6 } from './questions-d6';
import { questionsD7 } from './questions-d7';

export const questions: Question[] = [
  ...questionsOfficial,
  ...questionsD1,
  ...questionsD2,
  ...questionsD3,
  ...questionsD4,
  ...questionsD5,
  ...questionsD6,
  ...questionsD7,
];
