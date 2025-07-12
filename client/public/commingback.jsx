// src/App.jsx
import React, { useState, useEffect } from 'react';
import './index.css';

const App = () => {
  const [query, setQuery] = useState('');
  const [meal, setMeal] = useState(null);
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || []);
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
  const [suggestionIngredients, setSuggestionIngredients] = useState('');
  const [suggestedMeals, setSuggestedMeals] = useState([]);
  const [mealType, setMealType] = useState('');
  const [nutritionFacts, setNutritionFacts] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const fetchNutritionFacts = async (mealName) => {
    try {
      const res = await fetch(`https://api.edamam.com/api/nutrition-data?app_id=demo&app_key=demo&ingr=${mealName}`);
      const data = await res.json();
      if (data.calories) {
        setNutritionFacts({ calories: data.calories, fat: data.totalNutrients.FAT?.quantity, protein: data.totalNutrients.PROCNT?.quantity });
      } else {
        setNutritionFacts(null);
      }
    } catch (err) {
      console.error('Nutrition fetch failed', err);
      setNutritionFacts(null);
    }
  };

  const suggestMealsByIngredients = async () => {
    if (!suggestionIngredients.trim()) return;
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${suggestionIngredients}`);
      const data = await res.json();
      let meals = data.meals || [];
      if (mealType && meals.length > 0) {
        const filterRes = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${mealType}`);
        const filterData = await filterRes.json();
        const filterIds = new Set((filterData.meals || []).map(m => m.idMeal));
        meals = meals.filter(m => filterIds.has(m.idMeal));
      }
      setSuggestedMeals(meals);
    } catch (err) {
      console.error('Suggestion Error:', err);
    }
  };

  const handleMealClickById = async (id) => {
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await res.json();
      if (data.meals) {
        const myMeal = data.meals[0];
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ingredient = myMeal[`strIngredient${i}`];
          const measure = myMeal[`strMeasure${i}`];
          if (ingredient) ingredients.push(`${measure} ${ingredient}`);
        }
        setMeal({ ...myMeal, ingredients });
        fetchNutritionFacts(myMeal.strMeal);
        setError('');
        setShowInstructions(false);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Error fetching meal by ID:', err);
      setError('Failed to load meal details.');
    }
  };

  const searchMeals = async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const data = await res.json();
      if (data.meals) {
        setSearchResults(data.meals);
      } else {
        setSearchResults([]);
        setError('No meals found');
      }
    } catch (err) {
      console.error('Search failed', err);
      setError('Failed to search meals');
    }
  };

  const toggleFavorite = (meal) => {
    const exists = favorites.find((fav) => fav.idMeal === meal.idMeal);
    if (exists) {
      setFavorites(favorites.filter((fav) => fav.idMeal !== meal.idMeal));
    } else {
      setFavorites([...favorites, meal]);
    }
  };

  const isFavorite = (id) => favorites.some((fav) => fav.idMeal === id);

  return (
    <div className={`${darkMode ? 'dark bg-zinc-900 text-white' : 'bg-gradient-to-br from-pink-100 to-yellow-100 text-zinc-800'} min-h-screen p-6 font-sans`}>
      <div className="max-w-5xl mx-auto bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl overflow-visible">
        <div className="p-6 sm:p-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">🍽 Meal Finder & AI Suggestion</h1>
            <button
              className="px-4 py-2 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'} Mode
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by dish name..."
              className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={searchMeals}
              className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
            >
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mb-10">
              <h3 className="text-lg font-semibold mb-2">Search Results</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {searchResults.map((m) => (
                  <div key={m.idMeal} className="relative cursor-pointer bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg hover:scale-[1.01] transition">
                    <img
                      src={m.strMealThumb}
                      alt={m.strMeal}
                      onClick={() => handleMealClickById(m.idMeal)}
                      className="rounded-md w-full h-48 object-cover mb-2"
                    />
                    <p className="text-center font-medium">{m.strMeal}</p>
                    <button
                      onClick={() => toggleFavorite(m)}
                      className="absolute top-2 right-2 text-xl"
                      title="Toggle Favorite"
                    >
                      {isFavorite(m.idMeal) ? '❤️' : '🤍'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Enter ingredients (e.g. chicken, rice)"
              className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600"
              value={suggestionIngredients}
              onChange={(e) => setSuggestionIngredients(e.target.value)}
            />
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600"
            >
              <option value="">All</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Dessert">Dessert</option>
            </select>
            <button
              onClick={suggestMealsByIngredients}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Suggest
            </button>
          </div>

          {suggestedMeals.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Suggested Meals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestedMeals.map((m) => (
                  <div key={m.idMeal} className="relative cursor-pointer bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg hover:scale-[1.01] transition">
                    <img
                      src={m.strMealThumb}
                      alt={m.strMeal}
                      onClick={() => handleMealClickById(m.idMeal)}
                      className="rounded-md w-full h-48 object-cover mb-2"
                    />
                    <p className="text-center font-medium">{m.strMeal}</p>
                    <button
                      onClick={() => toggleFavorite(m)}
                      className="absolute top-2 right-2 text-xl"
                      title="Toggle Favorite"
                    >
                      {isFavorite(m.idMeal) ? '❤️' : '🤍'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-500 mb-4 text-center font-medium">{error}</p>}

          {showModal && meal && (
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/60 px-4 py-10">
              <div className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-xl font-bold hover:text-red-500"
                >
                  &times;
                </button>
                <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full rounded-xl mb-4" />
                <h2 className="text-2xl font-bold mb-2">{meal.strMeal}</h2>
                <p className="text-sm italic mb-2">Origin: {meal.strArea}</p>
                {nutritionFacts && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Nutrition Facts (approx.)</h3>
                    <ul className="list-disc list-inside text-sm">
                      <li>Calories: {Math.round(nutritionFacts.calories)}</li>
                      {nutritionFacts.fat && <li>Fat: {Math.round(nutritionFacts.fat)}g</li>}
                      {nutritionFacts.protein && <li>Protein: {Math.round(nutritionFacts.protein)}g</li>}
                    </ul>
                  </div>
                )}
                <h3 className="text-lg font-semibold">Ingredients</h3>
                <ul className="list-disc list-inside mb-4">
                  {meal.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
                </button>
                {showInstructions && (
                  <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-md whitespace-pre-wrap text-sm">
                    {meal.strInstructions}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
