import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { identifyIngredientsFromImage, generateRecipes, generateSuggestedRecipes } from './services/geminiService';
import type { Recipe, DietaryPreference, UserRecipePreference } from './types';
import { DIETARY_PREFERENCES, COOKING_TIMES, DIFFICULTIES } from './constants';
import RecipeCard from './components/RecipeCard';
import RecipeDetailModal from './components/RecipeDetailModal';
import Loader from './components/Loader';
import { UploadIcon } from './components/icons';

const App: React.FC = () => {
    const [ingredientsText, setIngredientsText] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
    const [cookingTime, setCookingTime] = useState<string>(COOKING_TIMES[0].id);
    const [difficulty, setDifficulty] = useState<string>('Any');
    
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [wishlist, setWishlist] = useState<Recipe[]>([]);
    const [userPreferences, setUserPreferences] = useState<{ [id: string]: UserRecipePreference }>({});
    const [activeTab, setActiveTab] = useState<'all' | 'wishlist'>('all');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    useEffect(() => {
        try {
            const savedPrefs = localStorage.getItem('userRecipePreferences');
            if (savedPrefs) {
                setUserPreferences(JSON.parse(savedPrefs));
            }
            const savedWishlist = localStorage.getItem('wishlistRecipes');
            if (savedWishlist) {
                setWishlist(JSON.parse(savedWishlist));
            }
        } catch (e) {
            console.error("Failed to parse data from localStorage", e);
        }
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setIngredientsText('');
        }
    };

    const handleDietaryChange = (preferenceId: string) => {
        setDietaryPreferences(prev =>
            prev.includes(preferenceId)
                ? prev.filter(p => p !== preferenceId)
                : [...prev, preferenceId]
        );
    };

    const handleSubmit = useCallback(async () => {
        setError(null);
        setRecipes([]);
        setActiveTab('all');
        
        let ingredients = ingredientsText;
        if (imageFile) {
            setIsLoading(true);
            setLoadingMessage('Analyzing ingredients from image...');
            try {
                ingredients = await identifyIngredientsFromImage(imageFile);
                setIngredientsText(ingredients);
            } catch (err) {
                setError('Failed to identify ingredients. Please try again or enter them manually.');
                setIsLoading(false);
                return;
            }
        }

        if (!ingredients.trim()) {
            setError('Please provide ingredients by uploading an image or typing them in.');
            return;
        }

        setIsLoading(true);
        setLoadingMessage('Generating creative recipes for you...');
        try {
            const generated = await generateRecipes(ingredients, dietaryPreferences, cookingTime, difficulty);
            setRecipes(generated);
        } catch (err) {
            setError('Could not generate recipes. The model might be busy. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [ingredientsText, imageFile, dietaryPreferences, cookingTime, difficulty]);

    const updateUserPreference = (recipeId: string, update: Partial<UserRecipePreference>) => {
        const currentPref = userPreferences[recipeId] || { favorite: false };
        const newPref = { ...currentPref, ...update };
        const newPrefs = { ...userPreferences, [recipeId]: newPref };
        setUserPreferences(newPrefs);
        localStorage.setItem('userRecipePreferences', JSON.stringify(newPrefs));
        return newPref.favorite;
    };
    
    const toggleFavorite = (recipe: Recipe) => {
        const isNowFavorite = updateUserPreference(recipe.id, { favorite: !(userPreferences[recipe.id]?.favorite ?? false) });
        
        let newWishlist: Recipe[];
        if (isNowFavorite) {
            newWishlist = [...wishlist.filter(r => r.id !== recipe.id), recipe];
        } else {
            newWishlist = wishlist.filter(r => r.id !== recipe.id);
        }
        setWishlist(newWishlist);
        localStorage.setItem('wishlistRecipes', JSON.stringify(newWishlist));
    };

    const handleSetRating = (recipeId: string, rating: number) => {
        updateUserPreference(recipeId, { rating });
    };

    const handleGetSuggestions = useCallback(async () => {
        const likedRecipes = recipes.filter(
            r => userPreferences[r.id]?.favorite || (userPreferences[r.id]?.rating ?? 0) >= 4
        );

        if (likedRecipes.length < 1) {
            setError("Please rate (4+ stars) or favorite at least one recipe to get personalized suggestions.");
            return;
        }
        
        setError(null);
        setIsLoading(true);
        setLoadingMessage("Finding new recipes you'll love...");

        try {
            const suggested = await generateSuggestedRecipes(
                likedRecipes, 
                ingredientsText, 
                dietaryPreferences, 
                cookingTime, 
                difficulty
            );
            setRecipes(prev => [...prev, ...suggested.filter(s => !prev.some(p => p.id === s.id))]);
            setActiveTab('all');
        } catch (err) {
            setError("Sorry, we couldn't get suggestions right now. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [recipes, userPreferences, ingredientsText, dietaryPreferences, cookingTime, difficulty]);

    const displayedRecipes = useMemo(() => {
        if (activeTab === 'wishlist') {
            return wishlist;
        }
        return recipes;
    }, [recipes, wishlist, activeTab]);

    const likedRecipeCount = useMemo(() => {
        return recipes.filter(r => userPreferences[r.id]?.favorite || (userPreferences[r.id]?.rating ?? 0) >= 4).length;
    }, [recipes, userPreferences]);
    
    return (
        <div className="min-h-screen bg-green-50/50 font-sans">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-3xl font-bold text-green-700 tracking-tight">Smart Recipe Generator</h1>
                    <p className="text-gray-600 mt-1">Discover delicious recipes from the ingredients you have!</p>
                </div>
            </header>
            
            <main className="container mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Control Panel */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg space-y-6 h-fit">
                        <div>
                            <label className="text-lg font-semibold text-gray-800">Upload Ingredients Photo</label>
                            <div className="mt-2 flex justify-center items-center w-full">
                                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-green-50 hover:bg-green-100 transition-colors">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Ingredients preview" className="h-full w-full object-cover rounded-lg"/>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                                            <UploadIcon className="w-10 h-10 mb-3" />
                                            <p className="mb-2 text-sm">Click to upload or drag and drop</p>
                                            <p className="text-xs">PNG, JPG (MAX. 5MB)</p>
                                        </div>
                                    )}
                                    <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>

                        <div className="text-center font-semibold text-gray-500">OR</div>

                        <div>
                            <label htmlFor="ingredients-text" className="text-lg font-semibold text-gray-800">Type Your Ingredients</label>
                            <textarea
                                id="ingredients-text"
                                value={ingredientsText}
                                onChange={e => setIngredientsText(e.target.value)}
                                placeholder="e.g., chicken breast, broccoli, garlic, olive oil"
                                className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                                rows={4}
                            />
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Filters</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="cooking-time" className="block text-sm font-medium text-gray-700">Cooking Time</label>
                                    <select id="cooking-time" value={cookingTime} onChange={e => setCookingTime(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                                        {COOKING_TIMES.map(time => <option key={time.id} value={time.id}>{time.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
                                    <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                                        <option>Any</option>
                                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Dietary Preferences</h3>
                            <div className="flex flex-wrap gap-2">
                                {DIETARY_PREFERENCES.map((pref: DietaryPreference) => (
                                    <button
                                        key={pref.id}
                                        onClick={() => handleDietaryChange(pref.id)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${dietaryPreferences.includes(pref.id) ? 'bg-green-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        {pref.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                            {isLoading && loadingMessage.startsWith('Generating') ? 'Generating...' : 'Generate Recipes'}
                        </button>
                    </div>

                    {/* Results Panel */}
                    <div className="lg:col-span-2">
                         {activeTab === 'all' && !isLoading && recipes.length > 0 && (
                            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">Recipe Suggestions</h2>
                                <button onClick={handleGetSuggestions} disabled={isLoading || likedRecipeCount < 1} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors text-sm">
                                    Get Personalized Suggestions
                                </button>
                            </div>
                         )}

                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`${activeTab === 'all' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    All Recipes
                                </button>
                                <button
                                    onClick={() => setActiveTab('wishlist')}
                                    className={`${activeTab === 'wishlist' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    My Wishlist
                                </button>
                            </nav>
                        </div>
                        
                        <div className="mt-6">
                            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">{error}</div>}
                            {isLoading && <Loader message={loadingMessage} />}
                            
                            {!isLoading && !error && (
                                <>
                                {displayedRecipes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {displayedRecipes.map(recipe => (
                                            <RecipeCard 
                                                key={recipe.id} 
                                                recipe={recipe} 
                                                onSelect={() => setSelectedRecipe(recipe)}
                                                onToggleFavorite={() => toggleFavorite(recipe)}
                                                isFavorite={userPreferences[recipe.id]?.favorite ?? false}
                                                rating={userPreferences[recipe.id]?.rating}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                    {activeTab === 'wishlist' && (
                                        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
                                            <p className="text-gray-600">Your wishlist is empty. Click the heart icon on any recipe to add it here!</p>
                                        </div>
                                    )}
                                    {activeTab === 'all' && (
                                        <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl shadow-lg p-8 text-center">
                                            <img src="https://static.vecteezy.com/system/resources/thumbnails/047/112/599/small_2x/kitchen-logo-in-circle-on-the-background-of-wooden-cutting-board-chefs-hat-knife-and-fork-banner-or-logo-for-a-website-restaurant-cafe-or-channel-the-theme-of-fast-food-cooking-and-culinary-arts-vector.jpg" alt="Delicious food" className="rounded-lg mb-6 w-64"/>
                                            <h2 className="text-2xl font-semibold text-gray-700">Ready for a culinary adventure?</h2>
                                            <p className="mt-2 text-gray-500">Upload a picture of your ingredients or type them in to get started.</p>
                                        </div>
                                    )}
                                    </>
                                )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            
            <RecipeDetailModal 
                recipe={selectedRecipe} 
                onClose={() => setSelectedRecipe(null)}
                onToggleFavorite={() => selectedRecipe && toggleFavorite(selectedRecipe)}
                isFavorite={selectedRecipe ? userPreferences[selectedRecipe.id]?.favorite ?? false : false}
                onSetRating={handleSetRating}
                rating={selectedRecipe ? userPreferences[selectedRecipe.id]?.rating : undefined}
            />
        </div>
    );
};

export default App;