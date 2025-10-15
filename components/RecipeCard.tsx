import React from 'react';
import type { Recipe } from '../types';
import { Difficulty } from '../types';
import { TimeIcon, DifficultyIcon, ServingsIcon, HeartIcon, StarIcon } from './icons';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  rating?: number;
}

const difficultyColorMap: Record<Difficulty, string> = {
    [Difficulty.Easy]: 'bg-green-100 text-green-800',
    [Difficulty.Medium]: 'bg-yellow-100 text-yellow-800',
    [Difficulty.Hard]: 'bg-red-100 text-red-800',
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect, onToggleFavorite, isFavorite, rating }) => {
  return (
    <div className="relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-800 mb-2 w-5/6 cursor-pointer" onClick={onSelect}>
                {recipe.recipeName}
            </h3>
            <button onClick={onToggleFavorite} className="text-red-400 hover:text-red-600 transition-colors">
                <HeartIcon className="w-7 h-7" filled={isFavorite} />
            </button>
        </div>
        <p className="text-gray-600 mb-4 h-12 overflow-hidden">{recipe.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <TimeIcon />
            <span>{recipe.cookingTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <DifficultyIcon />
             <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${difficultyColorMap[recipe.difficulty]}`}>
                {recipe.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ServingsIcon />
            <span>{recipe.servings} Servings</span>
          </div>
           {rating && (
            <div className="flex items-center gap-1 text-yellow-500">
                <StarIcon filled className="w-5 h-5" />
                <span className="font-bold text-gray-700">{rating} / 5</span>
            </div>
          )}
        </div>
      </div>
      <button onClick={onSelect} className="block w-full text-center bg-green-500 text-white font-semibold py-2 hover:bg-green-600 transition-colors">
        View Recipe
      </button>
    </div>
  );
};

export default RecipeCard;
