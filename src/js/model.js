import { async } from 'regenerator-runtime';
import { AJAX } from './helpers';
import { API_URL, RES_PER_PAGE, KEY } from './config';

const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const {
    cooking_time: time,
    image_url: img,
    source_url: source,
    ...rest
  } = data.data.recipe;

  state.recipe = {
    time,
    img,
    source,
    ...rest,
    ...(rest.key && { key: rest.key }),
  };
};

const getRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    //destruction of recipe data
    createRecipeObject(data);

    //add bookmark true to recipe on load if it's in the bookmark array
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    // not bookmarked
    else state.recipe.bookmarked = false;
  } catch (err) {
    throw err;
  }
};

const getSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      let { image_url: img, ...rest } = rec;
      return { img, ...rest };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * RES_PER_PAGE;
  const end = page * RES_PER_PAGE;
  return state.search.results.slice(start, end);
};

const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  //mark current recipe as bookmarked
  state.recipe.bookmarked = true;

  //save bookmarks to local storage
  persistBookmarks();
};

const deleteBookmark = function (id) {
  //delete bookmark
  const index = state.bookmarks.findIndex(rec => rec.id === id);
  state.bookmarks.splice(index, 1);

  //mark current recipe as NOT bookmarked
  state.recipe.bookmarked = false;

  //delete bookmark from local storage
  persistBookmarks();
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(ing => ing.trim());
        if (ingArr.length !== 3)
          throw new Error(
            'Please enter the ingredients with the correct format: quantity, unit, description'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      image_url: newRecipe.image,
      cooking_time: +newRecipe.cookingTime,
      source_url: newRecipe.sourceUrl,
      publisher: newRecipe.publisher,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

export {
  state,
  getRecipe,
  getSearchResults,
  getSearchResultsPage,
  updateServings,
  addBookmark,
  deleteBookmark,
  uploadRecipe,
};
