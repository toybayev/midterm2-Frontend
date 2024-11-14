document.addEventListener('DOMContentLoaded', loadFavorites);

function loadFavorites() {
    const favoritesGrid = document.getElementById('favorites-grid');
    favoritesGrid.innerHTML = '';

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    console.log(favorites);

    if (favorites.length === 0) {
        favoritesGrid.innerHTML = "<p>No favorite recipes found.</p>";
        return;
    }

    // Массив промисов для всех запросов
    const recipePromises = favorites.map(id =>
        fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`)
            .then(response => response.json())
    );

    // Дождемся завершения всех запросов
    Promise.all(recipePromises)
        .then(recipes => {
            recipes.forEach(data => {
                const recipeCard = document.createElement('div');
                recipeCard.className = 'recipe-card';

                recipeCard.innerHTML = `
                    <div>
                        <img class="recipe-image" src="${data.image}" alt="${data.title}">
                        <h3 class="recipe-title">${data.title}</h3>
                    </div>
                    <div class="p-bottom">
                        <button onclick="showRecipeDetails(${data.id})">View Recipe</button>
                        <button onclick="removeFromFavorites(${data.id})">
                            Remove from Favorites
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;

                favoritesGrid.appendChild(recipeCard);
            });
        })
        .catch(error => console.error('Error fetching recipe details:', error));
}

function removeFromFavorites(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(favoriteId => favoriteId !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));

    alert('Removed from favorites!');
    loadFavorites(); // Обновляем список после удаления
}

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});
