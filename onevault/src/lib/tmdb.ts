import "server-only";

export type CatalogCategory = "trending" | "popular" | "top_rated" | "upcoming";

export type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
};

export type Genre = {
  id: number;
  name: string;
};

export type MovieCatalog = {
  movies: Movie[];
  genres: Genre[];
};

export type WatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
};

export type Availability = {
  link?: string;
  flatrate?: WatchProvider[];
  free?: WatchProvider[];
  ads?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
};

export type MovieDetails = Movie & {
  runtime: number | null;
  tagline: string;
  genres: Genre[];
};

export type MovieDetailsPayload = {
  movie: MovieDetails;
  availability: Availability | null;
  region: string;
};

type TmdbListResponse<T> = {
  results: T[];
};

type TmdbGenresResponse = {
  genres: Genre[];
};

type TmdbProvidersResponse = {
  results: Record<string, Availability>;
};

const TMDB_API = "https://api.themoviedb.org/3";

async function tmdbRequest<T>(path: string): Promise<T> {
  const token = process.env.TMDB_API_READ_ACCESS_TOKEN;

  if (!token) {
    throw new Error("TMDB access is not configured.");
  }

  const response = await fetch(`${TMDB_API}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

function withQuery(path: string, values: Record<string, string>) {
  return `${path}?${new URLSearchParams(values).toString()}`;
}

export async function getMovieCatalog(options: {
  category: CatalogCategory;
  query?: string;
  genreId?: number;
}): Promise<MovieCatalog> {
  const { category, query = "", genreId } = options;
  const language = "en-US";
  let moviesPath: string;

  if (query) {
    moviesPath = withQuery("/search/movie", {
      query,
      include_adult: "false",
      language,
      page: "1",
    });
  } else if (genreId) {
    moviesPath = withQuery("/discover/movie", {
      with_genres: String(genreId),
      include_adult: "false",
      language,
      page: "1",
      sort_by: "popularity.desc",
    });
  } else if (category === "trending") {
    moviesPath = withQuery("/trending/movie/week", { language });
  } else {
    const endpoint = {
      popular: "/movie/popular",
      top_rated: "/movie/top_rated",
      upcoming: "/movie/upcoming",
    }[category];

    moviesPath = withQuery(endpoint, {
      language,
      page: "1",
      ...(category === "upcoming" ? { region: "US" } : {}),
    });
  }

  const [movieResponse, genreResponse] = await Promise.all([
    tmdbRequest<TmdbListResponse<Movie>>(moviesPath),
    tmdbRequest<TmdbGenresResponse>(withQuery("/genre/movie/list", { language })),
  ]);

  return {
    movies: movieResponse.results.slice(0, 20),
    genres: genreResponse.genres,
  };
}

export async function getMovieDetails(
  movieId: number,
  region: string,
): Promise<MovieDetailsPayload> {
  const [movie, providers] = await Promise.all([
    tmdbRequest<MovieDetails>(withQuery(`/movie/${movieId}`, { language: "en-US" })),
    tmdbRequest<TmdbProvidersResponse>(`/movie/${movieId}/watch/providers`),
  ]);

  return {
    movie,
    availability: providers.results[region] ?? null,
    region,
  };
}
