export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  TOKEN: process.env.EXPO_PUBLIC_TMDB_BEARER,
  headers: {
    accept: "application/json",
    // If a v4 API Read Access Token is provided, use Bearer auth
    ...(process.env.EXPO_PUBLIC_TMDB_BEARER
      ? { Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_BEARER}` }
      : {}),
  },
};

function buildUrl(path: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(`${TMDB_CONFIG.BASE_URL}${path}`);
  // Only append api_key when not using v4 Bearer token
  if (!TMDB_CONFIG.TOKEN && TMDB_CONFIG.API_KEY) {
    url.searchParams.set("api_key", String(TMDB_CONFIG.API_KEY));
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

export const fetchMovies = async ({ query }: { query: string }): Promise<Movie[]> => {
  try {
    const targetCount = 70;
    const combined: Movie[] = [];
    let page = 1;
    // TMDB returns 20 per page; fetch up to 3 pages to reach ~60 and then slice 50
    while (combined.length < targetCount && page <= 3) {
      const endpoint = buildUrl(query ? "/search/movie" : "/discover/movie", {
        language: "en-US",
        include_adult: "false",
        sort_by: query ? undefined : "popularity.desc",
        query: query || undefined,
        page,
      });

      const response = await fetch(endpoint, {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Failed to fetch movies: ${response.status} ${response.statusText} - ${text.substring(0, 200)}`
        );
      }

      const data = await response.json();
      const results: Movie[] = data.results ?? [];
      combined.push(...results);
      if (results.length < 20) break; // no more pages
      page += 1;
    }

    return combined.slice(0, targetCount);
  } catch (error) {
    console.error("fetchMovies error", error);
    throw error;
  }
};

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  try {
    const endpoint = buildUrl(`/movie/${movieId}`, { language: "en-US" });
    const response = await fetch(endpoint, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

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
  try {
    const endpoint = buildUrl("/trending/movie/day", { language: "en-US" });
    const response = await fetch(endpoint, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Failed to fetch trending movies: ${response.status} ${response.statusText} - ${text.substring(0, 200)}`
      );
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
  } catch (error) {
    console.error("fetchTrendingMovies error", error);
    throw error;
  }
};

export const fetchMovieTrailerUrl = async (
  movieId: string | number
): Promise<string | null> => {
  try {
    const endpoint = buildUrl(`/movie/${movieId}/videos`, { language: "en-US" });
    const response = await fetch(endpoint, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Failed to fetch videos: ${response.status} ${response.statusText} - ${text.substring(0, 200)}`
      );
    }
    const data = await response.json();
    const results = (data?.results ?? []) as Array<{
      site?: string;
      type?: string;
      key?: string;
      official?: boolean;
      name?: string;
    }>;
    const preferred =
      results.find(
        (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
      ) || results.find((v) => v.site === "YouTube" && v.type === "Trailer") || results.find((v) => v.site === "YouTube");
    if (preferred?.key) {
      return `https://www.youtube.com/watch?v=${preferred.key}`;
    }
    return null;
  } catch (error) {
    console.error("fetchMovieTrailerUrl error", error);
    return null;
  }
};
