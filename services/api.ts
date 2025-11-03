export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    // TMDB v3 API key is passed via query param, not Authorization header
  },
};

export const fetchMovies = async ({
  query,
}: {
  query: string;
}): Promise<Movie[]> => {
  const base = query
    ? `${TMDB_CONFIG.BASE_URL}/search/movie`
    : `${TMDB_CONFIG.BASE_URL}/discover/movie`;
  const endpoint = `${base}?api_key=${TMDB_CONFIG.API_KEY}` +
    (query ? `&query=${encodeURIComponent(query)}` : `&sort_by=popularity.desc`);

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
};

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
      { method: "GET", headers: TMDB_CONFIG.headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

export const fetchTrendingMovies = async (): Promise<TrendingMovie[]> => {
  const endpoint = `${TMDB_CONFIG.BASE_URL}/trending/movie/day?api_key=${TMDB_CONFIG.API_KEY}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch trending movies: ${response.statusText}`);
  }
  const data = await response.json();
  const movies: Movie[] = data.results ?? [];
  return movies.slice(0, 5).map((m) => ({
    searchTerm: "trending",
    movie_id: m.id,
    title: m.title,
    count: 0,
    poster_url: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
  }));
};
