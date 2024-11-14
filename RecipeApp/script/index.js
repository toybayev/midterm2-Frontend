// const apiKey = '82deebb03aa44b9c99646f04e4c0502f'
const apiKey = '2aec0985dcf14ff29485b5aa8ca42b28';
const recipeGrid = document.getElementById('recipe-grid');
const searchInput = document.getElementById('search-input');
const searchIcon = document.getElementById('search-icon');
const suggestions = document.getElementById('suggestions');

const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close-btn');


searchInput.addEventListener('input', handleSuggest);
searchIcon.addEventListener('click', searchRecipes);
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        suggestions.classList.add('hidden');
    }
});

// Функция для авто-подсказок
function handleSuggest() {
    const query = searchInput.value.trim();
    if (!query) {
        suggestions.classList.add('hidden');
        return;
    }

    fetch(`https://api.spoonacular.com/recipes/autocomplete?query=${query}&number=5&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            suggestions.innerHTML = '';
            if (data.length > 0) {
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.title;
                    li.addEventListener('click', () => {
                        searchInput.value = item.title;
                        searchRecipes();
                        suggestions.classList.add('hidden');
                    });
                    suggestions.appendChild(li);
                });
                suggestions.classList.remove('hidden');
            } else {
                suggestions.classList.add('hidden');
            }
        })
        .catch(error => console.error('Error fetching suggestions:', error));
}

// Функция поиска рецептов
function searchRecipes() {
    const query = searchInput.value.trim();
    if (!query) {
        displayPlaceholderCards();
        return;
    }

    fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.results && data.results.length > 0) {
                displayRecipes(data.results);
            } else {
                displayPlaceholderCards();
            }
        })
        .catch(error => console.error('Error fetching recipes:', error));
}

// Отображение рецептов
function displayRecipes(recipes) {
    const resultRecipe = document.getElementById('recipe-header');
    recipeGrid.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';

        recipeCard.innerHTML = `
            <div>
                <img src="${recipe.image}" alt="${recipe.title}">
                <h3>${recipe.title}</h3>
            </div>
            <div class="p-bottom">
                <button onclick="showRecipeDetails(${recipe.id})">View Recipe</button>
                <button onclick="addToFavorites(${recipe.id})">
                    Favorite
                    <i class="fas fa-thumbtack"></i>
                </button>
            </div>
        `;

        recipeGrid.appendChild(recipeCard);
    });
}


displayPlaceholderCards();


// Отображение пустых карточек при загрузке страницы
function displayPlaceholderCards(count = 12) {
    let recipeHeader = document.getElementById('recipe-header');
    recipeGrid.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
      <div class="recipe-placeholder"><i class="fas fa-utensils"></i></div>
      <h3>Recipe Title</h3>
    `;
        recipeGrid.appendChild(recipeCard);
    }
}

function showRecipeDetails(id) {
    fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('recipe-image').src = data.image;
            document.getElementById('recipe-title').innerText = data.title;

            document.getElementById('recipe-ingredients').innerText = data.extendedIngredients
                .map(i => i.original)
                .join(', ');

            // Обрабатываем инструкцию как HTML
            document.getElementById('recipe-instructions').innerHTML = `<ul>${data.instructions}</ul>`
                .replace(/<li>/g, "<li style='margin-bottom: 5px;'>")

            modal.classList.remove('hidden'); //
        })
        .catch(error => console.error('Error fetching recipe details:', error));
}

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

function addToFavorites(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(id)) {
        favorites.push(id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Added to favorites!');
    } else {
        alert('Recipe is already in favorites');
    }
}


document.getElementById('favorites-btn').addEventListener('click', () => {
    window.location.href = 'html/favorites.html';
});

