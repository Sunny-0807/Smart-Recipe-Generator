
import type { DietaryPreference, CookTime } from './types';
import { Difficulty } from './types';

export const DIETARY_PREFERENCES: DietaryPreference[] = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'low-carb', label: 'Low-Carb' },
];

export const COOKING_TIMES: CookTime[] = [
    { id: 'any', label: 'Any Time' },
    { id: 'under-30', label: 'Under 30 mins' },
    { id: '30-60', label: '30-60 mins' },
    { id: 'over-60', label: 'Over 60 mins' },
];

export const DIFFICULTIES: Difficulty[] = [
    Difficulty.Easy,
    Difficulty.Medium,
    Difficulty.Hard,
];
