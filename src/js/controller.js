import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// https://forkify-api.herokuapp.com/v2

//////////////////////////////////////

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1); //get the id from url
    if (!id) return;

    recipeView.renderSpinner();

    //1) update resultsView to mark selected search result
    resultsView.updateDOM(model.getSearchResultsPage());

    // 2) loading recipe
    await model.getRecipe(id);
    const { recipe } = model.state;

    // 3) render recipe
    recipeView.render(recipe);
  } catch (err) {
    console.log(err);
    recipeView.renderError(err);
  }
};

const controlSearchResults = async function () {
  try {
    const query = searchView.getQuery();
    if (!query) return;

    // 1) loading search query
    await model.getSearchResults(query);

    resultsView.renderSpinner();

    // 2) render results
    resultsView.render(model.getSearchResultsPage());

    //3) render init pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
    resultsView.renderError(err);
  }
};

const controlPagination = function (page) {
  // 1) render new results
  resultsView.render(model.getSearchResultsPage(page));

  //2) render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  model.updateServings(newServings);
  recipeView.updateDOM(model.state.recipe);
};

// add and delete bookmark
const controlToggleBookmark = function () {
  const recipe = model.state.recipe;
  if (!recipe.bookmarked) model.addBookmark(recipe);
  else model.deleteBookmark(recipe.id);

  bookmarksView.render(model.state.bookmarks);
  recipeView.updateDOM(recipe);
};

// get bookmarks on load
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // render spinner
    addRecipeView.renderSpinner();

    //upload recipe to api
    await model.uploadRecipe(newRecipe);

    //render the added recipe
    recipeView.render(model.state.recipe);

    //display success message
    addRecipeView.renderMessage();

    //update the bookmarkView
    bookmarksView.render(model.state.bookmarks);

    //change the url to uploaded recipe id
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close the form
    setTimeout(function () {
      if (
        document
          .querySelector('.add-recipe-window')
          .classList.contains('hidden')
      )
        return;

      addRecipeView.toggleModal();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log(err);
    addRecipeView.renderError(err);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlToggleBookmark);

  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
