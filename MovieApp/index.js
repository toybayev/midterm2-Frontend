const apiKey = '7cdf9d45abe4fefe50ef387073fcc17d';
const moviesGrid = document.getElementById('movies-grid');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('modal');
const movieDetails = document.getElementById('movie-details');

const mockMovies = Array(6).fill({
    title: "Movie Title",
    icon: "fas fa-film"
});

function displayMockData() {
    moviesGrid.innerHTML = '';
    mockMovies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <i class="${movie.icon}"></i>
            <h3>${movie.title}</h3>
        `;
        moviesGrid.appendChild(movieCard);
    });
}

window.addEventListener('load', displayMockData);

searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    if (query.length > 2) {
        searchMovies(query);
    }
});

async function searchMovies(query) {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`);
    const data = await response.json();
    displayMovies(data.results);
}

function displayMovies(movies, isFavoritesView = false) {
    moviesGrid.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <div class="movie-card-clicker">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>${movie.release_date}</p>
            </div>
            <button class="${isFavoritesView ? 'removeBtn' : 'watchListBtn'}">
                ${isFavoritesView ? 'Remove from Watchlist' : 'Watch later'}
                <i style="font-size: 20px; margin-bottom: 0; margin-left: 10px; color: #ffffff" class="fas ${isFavoritesView ? 'fa-trash' : 'fa-thumbtack'}"></i>
            </button>
        `;

        const clicker = movieCard.querySelector('.movie-card-clicker');
        const button = movieCard.querySelector('button');

        clicker.addEventListener('click', () => showMovieDetails(movie));

        if (isFavoritesView) {
            button.addEventListener('click', () => removeFromFavorites(movie.id));
        } else {
            button.addEventListener('click', () => addToFavorites(movie));
        }

        moviesGrid.appendChild(movieCard);
    });
}




async function showMovieDetails(movie) {
    modal.classList.remove('hidden');
    const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    // get film trailer
    const trailerResponse = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${apiKey}`);
    const trailerData = await trailerResponse.json();
    const trailer = trailerData.results.find(video => video.site === "YouTube" && video.type === "Trailer");
    const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : '';

    movieDetails.innerHTML = `
        <img src="${posterUrl}" alt="${movie.title}" class="movie-poster">
        <h2>${movie.title}</h2>
        <p>${movie.overview}</p>
        <p>Rating: ${movie.vote_average}</p>
        <p>Release Date: ${movie.release_date}</p>
        ${trailerUrl ? `<iframe width="100%" height="315" src="${trailerUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>` : '<p>Trailer not available</p>'}
    `;
}

modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.classList.add('hidden');
    }
});

document.querySelector('.close-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
});

async function sortMovies(criteria) {
    const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=${criteria}.desc`);
    const data = await response.json();
    displayMovies(data.results);
}

function addToFavorites(movie) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    // Проверяем, есть ли уже фильм в избранном
    if (!favorites.some(fav => fav.id === movie.id)) {
        favorites.push(movie);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Added to favorites!');
    } else {
        favorites = favorites.filter(fav => fav.id !== movie.id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Removed from favorites!');
        displayMovies(favorites, true);
    }
}

function removeFromFavorites(movieId) {
    let favorites = getFavorites();
    favorites = favorites.filter(movie => movie.id !== movieId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Removed from favorites!');
    displayMovies(favorites, true); // Перерисовываем избранные фильмы
}

document.getElementById('view-favorites-btn').addEventListener('click', () => {
    const favorites = getFavorites();
    displayMovies(favorites, true);
});


document.getElementById('view-favorites-btn').addEventListener('click', () => {
    const favorites = getFavorites();
    displayMovies(favorites);
});

function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}


