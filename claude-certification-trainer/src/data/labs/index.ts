import type { Lab } from '@/schemas';
import { labs1 } from './labs-1';
import { labs2 } from './labs-2';

export const labs: Lab[] = [...labs1, ...labs2];
