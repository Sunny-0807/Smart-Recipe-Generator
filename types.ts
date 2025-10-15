export enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

export interface NutritionalInfo {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  id: string;
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: Difficulty;
  servings: number;
  nutritionalInfo: NutritionalInfo;
}

export interface DietaryPreference {
  id: string;
  label: string;
}

export interface CookTime {
    id: string;
    label: string;
}

export interface UserRecipePreference {
    favorite: boolean;
    rating?: number; // Rating from 1 to 5
}
