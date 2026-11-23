"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import useSWR from "swr";
import { ArrowDown, ArrowRight, LoaderCircle, Search, Sparkles } from "lucide-react";
import { fetchJson } from "@/lib/fetch-json";
import type { CatalogCategory, Genre, Movie, MovieCatalog } from "@/lib/tmdb";
import { tmdbImageUrl } from "@/lib/tmdb-images";
import { MovieCard } from "@/components/movie-card";
import { MovieDetailsDialog } from "@/components/movie-details-dialog";
import { OneVaultHeader } from "@/components/onevault-header";

const categoryLabels: Record<CatalogCategory, string> = {
  trending: "Trending this week",
  popular: "Popular right now",
  top_rated: "Top rated",
  upcoming: "Coming soon",
};

function releaseYear(date: string) {
  return date ? date.slice(0, 4) : "—";
}

function FeaturedMovie({ movie, onSelect }: { movie: Movie | null; onSelect: (movie: Movie) => void }) {
  const backdrop = movie ? tmdbImageUrl(movie.backdrop_path, "original") : null;

  return (
    <section
      aria-label={movie ? `Featured movie: ${movie.title}` : "OneVault movie discovery"}
      className={`hero${movie ? " hero-featured" : " hero-empty"}`}
      style={
        backdrop
          ? {
              backgroundImage: `linear-gradient(90deg, rgba(9, 12, 10, .98) 0%, rgba(9, 12, 10, .82) 35%, rgba(9, 12, 10, .22) 76%, rgba(9, 12, 10, .34) 100%), linear-gradient(0deg, #0d0f0e 0%, rgba(13, 15, 14, 0) 40%), url("${backdrop}")`,
            }
          : undefined
      }
    >
      <div className="hero-inner page-width">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">
            <span className="eyebrow-dot" />
            {movie ? "This week’s spotlight" : "A better way to find a film"}
          </p>
          <h1>{movie ? movie.title : "Stories worth keeping."}</h1>
          <p className="hero-description">
            {movie?.overview ||
              "A considered collection of films, with clear paths to watch them through official services."}
          </p>
          <div className="hero-details">
            {movie ? (
              <>
                <span className="hero-score">TMDB {movie.vote_average.toFixed(1)}</span>
                <span>{releaseYear(movie.release_date)}</span>
                <span className="hero-detail-divider" aria-hidden="true" />
                <span>Featured selection</span>
              </>
            ) : (
              <span>Discover something unforgettable</span>
            )}
          </div>
          {movie ? (
            <button className="button button-primary" onClick={() => onSelect(movie)} type="button">
              <span>Find where to watch</span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          ) : (
            <a className="button button-primary" href="#catalog">
              <span>Browse the catalog</span>
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          )}
        </div>

        <div className="hero-caption" aria-hidden="true">
          <span>01</span>
          <span className="hero-caption-line" />
          <span>{movie ? releaseYear(movie.release_date) : "OV / 01"}</span>
        </div>
      </div>
      <a className="scroll-cue" href="#catalog">
        Scroll to discover <ArrowDown size={14} aria-hidden="true" />
      </a>
    </section>
  );
}

function GenreFilters({
  genres,
  selectedGenre,
  onSelect,
}: {
  genres: Genre[];
  selectedGenre: number | null;
  onSelect: (genreId: number | null) => void;
}) {
  return (
    <div className="genre-filters" aria-label="Filter by genre">
      <button
        className={`genre-chip${selectedGenre === null ? " is-selected" : ""}`}
        onClick={() => onSelect(null)}
        type="button"
        aria-pressed={selectedGenre === null}
      >
        All films
      </button>
      {genres.slice(0, 8).map((genre) => (
        <button
          className={`genre-chip${selectedGenre === genre.id ? " is-selected" : ""}`}
          key={genre.id}
          onClick={() => onSelect(selectedGenre === genre.id ? null : genre.id)}
          type="button"
          aria-pressed={selectedGenre === genre.id}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}

function MovieSkeleton() {
  return (
    <div className="movie-grid" aria-label="Loading movies" aria-busy="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton-poster" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line-short" />
        </div>
      ))}
    </div>
  );
}

export function MovieBrowser() {
  const [category, setCategory] = useState<CatalogCategory>("trending");
  const [searchValue, setSearchValue] = useState("");
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const params = new URLSearchParams({ category });
  if (query) params.set("query", query);
  if (selectedGenre) params.set("genre", String(selectedGenre));

  const { data, error, isLoading } = useSWR<MovieCatalog>(
    `/api/catalog?${params.toString()}`,
    fetchJson,
    { keepPreviousData: true, revalidateOnFocus: false },
  );

  const handleCategoryChange = (nextCategory: CatalogCategory) => {
    setCategory(nextCategory);
    setSearchValue("");
    setQuery("");
    setSelectedGenre(null);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(searchValue.trim());
    setSelectedGenre(null);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) {
      event.preventDefault();
    }
  };

  const movies = data?.movies ?? [];
  const featuredMovie = query ? null : movies[0] ?? null;
  const visibleMovies = featuredMovie ? movies.slice(1) : movies;
  const selectedGenreName = data?.genres.find((genre) => genre.id === selectedGenre)?.name;
  const catalogTitle = query
    ? `Results for “${query}”`
    : selectedGenreName ?? categoryLabels[category];

  return (
    <>
      <OneVaultHeader
        category={category}
        onCategoryChange={handleCategoryChange}
        onSearchChange={setSearchValue}
        onSearchKeyDown={handleSearchKeyDown}
        onSearchSubmit={handleSearchSubmit}
        searchValue={searchValue}
      />

      <main>
        <FeaturedMovie movie={featuredMovie} onSelect={setSelectedMovie} />

        <section className="catalog-section page-width" id="catalog">
          <div className="catalog-heading">
            <div>
              <p className="eyebrow section-eyebrow">
                <Sparkles size={14} aria-hidden="true" />
                Your next movie night
              </p>
              <h2>{catalogTitle}</h2>
              <p className="catalog-subtitle">
                Curated discovery, paired with official viewing options.
              </p>
            </div>
            <span className="catalog-count">
              {data?.movies.length ? `${data.movies.length} films` : "TMDB catalog"}
            </span>
          </div>

          {data?.genres ? (
            <GenreFilters
              genres={data.genres}
              onSelect={(genreId) => {
                setQuery("");
                setSearchValue("");
                setSelectedGenre(genreId);
              }}
              selectedGenre={selectedGenre}
            />
          ) : null}

          {error ? (
            <div className="catalog-message catalog-error" role="alert">
              <Search size={19} aria-hidden="true" />
              <div>
                <h3>We couldn’t load the catalog</h3>
                <p>{error.message}</p>
              </div>
              <button className="text-button" onClick={() => window.location.reload()} type="button">
                Try again
              </button>
            </div>
          ) : isLoading && !data ? (
            <MovieSkeleton />
          ) : visibleMovies.length ? (
            <div className="movie-grid">
              {visibleMovies.map((movie, index) => {
                const genre = data?.genres.find((item) => item.id === movie.genre_ids[0]);
                return (
                  <MovieCard
                    genreName={genre?.name}
                    key={`${movie.id}-${index}`}
                    movie={movie}
                    onSelect={setSelectedMovie}
                  />
                );
              })}
            </div>
          ) : (
            <div className="catalog-message" role="status">
              <Search size={19} aria-hidden="true" />
              <div>
                <h3>No films found</h3>
                <p>Try another title or clear your filters to explore the full catalog.</p>
              </div>
              <button
                className="text-button"
                onClick={() => {
                  setQuery("");
                  setSearchValue("");
                  setSelectedGenre(null);
                }}
                type="button"
              >
                Clear filters
              </button>
            </div>
          )}

          {isLoading && data ? (
            <p className="refresh-note" role="status">
              <LoaderCircle className="spinner" size={15} aria-hidden="true" /> Updating the catalog…
            </p>
          ) : null}
        </section>
      </main>

      <footer className="site-footer page-width">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            <Sparkles size={16} />
          </span>
          <span>onevault</span>
        </div>
        <p>
          Movie data by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
        <p className="footer-note">Watch availability by JustWatch. Options may vary by region.</p>
      </footer>

      <MovieDetailsDialog movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </>
  );
}
