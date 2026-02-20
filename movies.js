const API_KEY = 'c7d45872'; // OMDB API key
const API_URL = 'https://www.omdbapi.com/';

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const loader = document.getElementById('loader');
const error = document.getElementById('error');
const results = document.getElementById('results');
const resultsInfo = document.getElementById('results-info');
const filterBtns = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');

let allMovies = [];
let currentFilter = 'all';

// Event Listeners
searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchMovies();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.type;
    filterMovies();
  });
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

async function searchMovies() {
  const query = searchInput.value.trim();
  
  if (!query) {
    showError('Please enter a movie name');
    return;
  }

  reset();
  loader.classList.add('active');

  try {
    const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${query}`);
    const data = await response.json();

    if (data.Response === 'True') {
      allMovies = data.Search;
      filterMovies();
    } else {
      showError(data.Error || 'No movies found');
    }
  } catch (err) {
    showError('Failed to fetch movies. Please try again.');
  } finally {
    loader.classList.remove('active');
  }
}

function filterMovies() {
  const filtered = currentFilter === 'all' 
    ? allMovies 
    : allMovies.filter(m => m.Type === currentFilter);
  
  if (filtered.length > 0) {
    displayMovies(filtered);
    resultsInfo.textContent = `Found ${filtered.length} result${filtered.length > 1 ? 's' : ''}`;
  } else {
    results.innerHTML = '<div class="no-results">No results found for this filter</div>';
    resultsInfo.textContent = '';
  }
}

async function displayMovies(movies) {
  results.innerHTML = movies.map((movie, index) => `
    <div class="movie-card" onclick="showMovieDetails('${movie.imdbID}')" style="animation-delay: ${index * 0.1}s">
      <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/280x400?text=No+Image'}" 
           alt="${movie.Title}">
      <div class="movie-info">
        <div class="movie-title">${movie.Title}</div>
        <div class="movie-meta">
          <span class="movie-year">${movie.Year}</span>
          <span class="movie-type">${movie.Type}</span>
        </div>
      </div>
    </div>
  `).join('');
}

async function showMovieDetails(imdbID) {
  try {
    const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`);
    const movie = await response.json();

    if (movie.Response === 'True') {
      document.getElementById('modal-poster').src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/900x400?text=No+Image';
      document.getElementById('modal-title').textContent = movie.Title;
      
      const metaHTML = `
        ${movie.Year ? `<span class="modal-badge">📅 ${movie.Year}</span>` : ''}
        ${movie.Runtime ? `<span class="modal-badge">⏱️ ${movie.Runtime}</span>` : ''}
        ${movie.imdbRating !== 'N/A' ? `<span class="modal-badge">⭐ ${movie.imdbRating}/10</span>` : ''}
        ${movie.Rated !== 'N/A' ? `<span class="modal-badge">${movie.Rated}</span>` : ''}
      `;
      document.getElementById('modal-meta').innerHTML = metaHTML;
      
      document.getElementById('modal-plot').textContent = movie.Plot !== 'N/A' ? movie.Plot : 'No plot available.';
      
      const detailsHTML = `
        ${movie.Genre !== 'N/A' ? `<strong>Genre:</strong> ${movie.Genre}<br>` : ''}
        ${movie.Director !== 'N/A' ? `<strong>Director:</strong> ${movie.Director}<br>` : ''}
        ${movie.Actors !== 'N/A' ? `<strong>Cast:</strong> ${movie.Actors}<br>` : ''}
        ${movie.Language !== 'N/A' ? `<strong>Language:</strong> ${movie.Language}<br>` : ''}
        ${movie.Country !== 'N/A' ? `<strong>Country:</strong> ${movie.Country}<br>` : ''}
        ${movie.Awards !== 'N/A' ? `<strong>Awards:</strong> ${movie.Awards}<br>` : ''}
        ${movie.BoxOffice !== 'N/A' ? `<strong>Box Office:</strong> ${movie.BoxOffice}` : ''}
      `;
      document.getElementById('modal-details').innerHTML = detailsHTML;
      
      modal.classList.add('active');
    }
  } catch (err) {
    showError('Failed to load movie details.');
  }
}

function closeModal() {
  modal.classList.remove('active');
}

function showError(message) {
  error.textContent = message;
  error.classList.add('active');
  results.innerHTML = '';
  resultsInfo.textContent = '';
}

function reset() {
  error.classList.remove('active');
  results.innerHTML = '';
  resultsInfo.textContent = '';
}
