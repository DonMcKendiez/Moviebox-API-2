import Image from "next/image";
import { ArrowUpRight, Star } from "lucide-react";
import type { Movie } from "@/lib/tmdb";
import { tmdbImageUrl } from "@/lib/tmdb-images";

type MovieCardProps = {
  movie: Movie;
  genreName?: string;
  onSelect: (movie: Movie) => void;
};

function releaseYear(date: string) {
  return date ? date.slice(0, 4) : "—";
}

export function MovieCard({ movie, genreName, onSelect }: MovieCardProps) {
  const poster = tmdbImageUrl(movie.poster_path, "w500");

  return (
    <button
      className="movie-card"
      onClick={() => onSelect(movie)}
      type="button"
      aria-label={`View legal viewing options for ${movie.title}`}
    >
      <span className="poster-frame">
        {poster ? (
          <Image
            alt={`${movie.title} movie poster`}
            className="movie-poster"
            fill
            sizes="(max-width: 560px) 44vw, (max-width: 900px) 28vw, 20vw"
            src={poster}
            unoptimized
          />
        ) : (
          <span className="poster-fallback" aria-hidden="true">
            {movie.title}
          </span>
        )}
        <span className="poster-wash" aria-hidden="true" />
        <span className="card-open" aria-hidden="true">
          <ArrowUpRight size={17} />
        </span>
        <span className="poster-rating">
          <Star size={12} fill="currentColor" aria-hidden="true" />
          {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
        </span>
      </span>
      <span className="card-copy">
        <span className="card-title">{movie.title}</span>
        <span className="card-meta">
          <span>{releaseYear(movie.release_date)}</span>
          {genreName ? <span className="meta-divider">·</span> : null}
          {genreName ? <span className="card-genre">{genreName}</span> : null}
        </span>
      </span>
    </button>
  );
}
