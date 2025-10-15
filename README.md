# Smart Recipe Generator 🧑‍🍳
Discover and create delicious meals from the ingredients you already have! This application uses the power of Google's Gemini models to identify ingredients from images and generate unique, personalized recipes instantly.

## ✨ Features
- Intelligent Ingredient Identification: Upload a photo of your ingredients (fridge contents, pantry items), and the application uses a multimodal Gemini model to identify the food items.

- Customized Recipe Generation: Generates original recipes based on the identified or manually entered ingredients.

- Filtering: Refine suggestions by Dietary Preferences (Vegan, Gluten-Free, etc.), Cooking Time, and Difficulty.

- Personalized Suggestions: Get new recipe recommendations based on the recipes you have marked as favorites or rated highly (4+ stars).

- Wishlist: Save your favorite recipes locally for later viewing.

## 🧠 AI Strategy (Gemini Integration)
The application's intelligence is powered by two core uses of Google's Gemini models, ensuring maximum efficiency and customization.

1. Multimodal Ingredient Processing (Image → Text)
The process starts with a multimodal capability. Users upload an image of their ingredients, and a Gemini model analyzes the visual input to accurately identify and list the available food items. This output is transformed into a clean text string that feeds into the next generation step.

2. Structured Recipe Generation and Personalization
Next, a powerful Gemini model performs complex reasoning. It combines the ingredient list with user-selected filters (diet, time, difficulty) to generate creative, original recipes. A critical part of the approach is the use of Structured Output: the model is strictly instructed to return the recipe data in a precise JSON format (matching the Recipe TypeScript interface), ensuring the results are instantly usable by the React frontend. Furthermore, the model is fed details from the user's previously liked recipes to generate personalized suggestions, fine-tuning new recommendations based on established tastes.

## 🚀 Getting Started
#### Prerequisites
  You'll need an active Gemini API key.

#### Installation
1. Clone the repository:
```bash
git clone https://github.com/Sunny-0807/Smart-Recipe-Generator.git
cd smart-recipe-generator
```
2. Install dependencies:
```bash
npm install
```
3. Set up your Gemini API Key:
Create a file named .env in the project root (if you are using Vite's environment variables) and add your key:
```bash
GEMINI_API_KEY="YOUR_API_KEY_HERE"
```
4. Run the application:
```bash
npm run dev
```
The app will be available at the address shown in your terminal.
