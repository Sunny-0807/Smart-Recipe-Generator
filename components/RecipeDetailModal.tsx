import React from 'react';
import type { Recipe } from '../types';
import { CloseIcon, HeartIcon, StarIcon } from './icons';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  onSetRating: (recipeId: string, rating: number) => void;
  rating: number | undefined;
}

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, onClose, onToggleFavorite, isFavorite, onSetRating, rating }) => {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{recipe.recipeName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <CloseIcon />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          <p className="text-gray-600 mb-6">{recipe.description}</p>
          
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Rating</h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => onSetRating(recipe.id, star)}>
                    <StarIcon
                      className="w-8 h-8 text-yellow-400 hover:text-yellow-500 transition-colors"
                      filled={rating && rating >= star}
                    />
                  </button>
                ))}
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-green-500 pb-1">Ingredients</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {recipe.ingredients.map((ing, index) => <li key={index}>{ing}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-green-500 pb-1">Nutritional Info</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <p><strong>Calories:</strong> {recipe.nutritionalInfo.calories}</p>
                <p><strong>Protein:</strong> {recipe.nutritionalInfo.protein}</p>
                <p><strong>Carbs:</strong> {recipe.nutritionalInfo.carbs}</p>
                <p><strong>Fat:</strong> {recipe.nutritionalInfo.fat}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-green-500 pb-1">Instructions</h3>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              {recipe.instructions.map((step, index) => <li key={index} className="pl-2">{step}</li>)}
            </ol>
          </div>
        </div>
        <div className="p-4 border-t mt-auto flex justify-end">
            <button
                onClick={onToggleFavorite}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors font-semibold"
            >
                <HeartIcon filled={isFavorite} />
                {isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;