import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string; } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string."));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function identifyIngredientsFromImage(imageFile: File): Promise<string> {
    const imagePart = await fileToGenerativePart(imageFile);
    const model = 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { text: "Identify the food ingredients in this image. List them as a simple, comma-separated string. For example: 'tomatoes, onions, garlic, chicken breast'." },
                imagePart
            ]
        }
    });

    return response.text;
}

const recipeSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: "A unique identifier for the recipe, like a UUID." },
        recipeName: { type: Type.STRING },
        description: { type: Type.STRING },
        ingredients: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        instructions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        cookingTime: { type: Type.STRING },
        difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
        servings: { type: Type.INTEGER },
        nutritionalInfo: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.STRING },
            protein: { type: Type.STRING },
            carbs: { type: Type.STRING },
            fat: { type: Type.STRING },
          },
        },
      },
      required: ["id", "recipeName", "description", "ingredients", "instructions", "cookingTime", "difficulty", "servings", "nutritionalInfo"]
    },
};

export async function generateRecipes(
  ingredients: string,
  dietaryPreferences: string[],
  cookingTime: string,
  difficulty: string
): Promise<Recipe[]> {
    const model = 'gemini-2.5-pro';
    
    let prompt = `Generate 3 diverse recipes based on the following ingredients: ${ingredients}.`;
    
    if(dietaryPreferences.length > 0) {
        prompt += ` The recipes must be suitable for the following dietary needs: ${dietaryPreferences.join(', ')}.`;
    }
    if (cookingTime !== 'any') {
        prompt += ` The cooking time should be ${cookingTime.replace('-', ' ')}.`;
    }
    if (difficulty !== 'Any') {
        prompt += ` The difficulty level should be ${difficulty}.`;
    }

    prompt += " For each recipe, provide a detailed ingredients list, step-by-step instructions, and estimated nutritional information (calories, protein, carbs, fat). Also suggest a suitable number of servings.";

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });

        const jsonText = response.text.trim();
        const recipes = JSON.parse(jsonText);
        return recipes as Recipe[];
    } catch (error) {
        console.error("Error generating recipes:", error);
        // Attempt to parse a potentially malformed JSON response
        try {
            const responseText = (error as any)?.response?.text || '';
            const cleanedJson = responseText.replace(/```json|```/g, '').trim();
            if (cleanedJson) {
                return JSON.parse(cleanedJson) as Recipe[];
            }
        } catch (parseError) {
             console.error("Failed to parse fallback JSON:", parseError);
        }
        throw new Error("Failed to generate and parse recipes from the API.");
    }
}

export async function generateSuggestedRecipes(
  likedRecipes: Recipe[],
  ingredients: string,
  dietaryPreferences: string[],
  cookingTime: string,
  difficulty: string
): Promise<Recipe[]> {
    const model = 'gemini-2.5-pro';

    let prompt = `Based on the user's preference for the following recipes:\n`;
    likedRecipes.forEach(recipe => {
        prompt += `- ${recipe.recipeName}: ${recipe.description}\n`;
    });

    prompt += `\nPlease generate 3 new and distinct recipes that they might also enjoy. The new recipes should be based on the following available ingredients: ${ingredients}.`;
    
    if (dietaryPreferences.length > 0) {
        prompt += ` The recipes must be suitable for the following dietary needs: ${dietaryPreferences.join(', ')}.`;
    }
    if (cookingTime !== 'any') {
        prompt += ` The cooking time should be ${cookingTime.replace('-', ' ')}.`;
    }
    if (difficulty !== 'Any') {
        prompt += ` The difficulty level should be ${difficulty}.`;
    }

    prompt += " For each recipe, provide a detailed ingredients list, step-by-step instructions, and estimated nutritional information (calories, protein, carbs, fat). Also suggest a suitable number of servings.";

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });

        const jsonText = response.text.trim();
        const recipes = JSON.parse(jsonText);
        return recipes as Recipe[];
    } catch (error) {
        console.error("Error generating suggested recipes:", error);
        try {
            const responseText = (error as any)?.response?.text || '';
            const cleanedJson = responseText.replace(/```json|```/g, '').trim();
            if (cleanedJson) {
                return JSON.parse(cleanedJson) as Recipe[];
            }
        } catch (parseError) {
             console.error("Failed to parse fallback JSON for suggestions:", parseError);
        }
        throw new Error("Failed to generate and parse suggested recipes from the API.");
    }
}
