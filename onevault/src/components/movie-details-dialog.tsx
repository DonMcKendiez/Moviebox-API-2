"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { ArrowUpRight, Check, ExternalLink, LoaderCircle, X } from "lucide-react";
import { fetchJson } from "@/lib/fetch-json";
import type { Movie, MovieDetailsPayload } from "@/lib/tmdb";
import { tmdbImageUrl } from "@/lib/tmdb-images";

type MovieDetailsDialogProps = {
  movie: Movie | null;
  onClose: () => void;
};

const regions = [
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "IN", label: "India" },
];

export function MovieDetailsDialog({ movie, onClose }: MovieDetailsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [region, setRegion] = useState("US");
  const dataKey = movie ? `/api/movies/${movie.id}?region=${region}` : null;
  const { data, error, isLoading } = useSWR<MovieDetailsPayload>(dataKey, fetchJson, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;
    if (movie && !dialog.open) dialog.showModal();
    if (!movie && dialog.open) dialog.close();
  }, [movie]);

  if (!movie) return null;

  const availability = data?.availability;
  const groups = [
    { label: "Included with subscription", items: availability?.flatrate ?? [] },
    { label: "Free options", items: [...(availability?.free ?? []), ...(availability?.ads ?? [])] },
    { label: "Rent", items: availability?.rent ?? [] },
    { label: "Buy", items: availability?.buy ?? [] },
  ].filter((group) => group.items.length > 0);
  const validWatchLink = availability?.link?.startsWith("https://")
    ? availability.link
            : `https://www.themoviedb.org/movie/${movie.id}/watch?locale=${region}`;
  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : "Release date unavailable";

  return (
    <dialog
      aria-labelledby="movie-dialog-title"
      className="movie-dialog"
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      onClose={onClose}
      onCancel={onClose}
      ref={dialogRef}
    >
      <div className="dialog-shell">
        <button
          aria-label="Close movie details"
          className="dialog-close"
          onClick={() => dialogRef.current?.close()}
          type="button"
        >
          <X size={19} />
        </button>

        <div
          className="dialog-art"
          style={
            movie.backdrop_path
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(10, 12, 11, .04) 8%, #111412 100%), url("${tmdbImageUrl(movie.backdrop_path, "w780")}")`,
                }
              : undefined
          }
        >
          {movie.poster_path ? (
            <Image
              alt={`${movie.title} poster`}
              className="dialog-poster"
              height={150}
              src={tmdbImageUrl(movie.poster_path, "w342") ?? ""}
              unoptimized
              width={100}
            />
          ) : null}
        </div>

        <div className="dialog-content">
          <p className="eyebrow dialog-eyebrow">OneVault watch guide</p>
          <h2 id="movie-dialog-title">{movie.title}</h2>
          <div className="dialog-meta">
            <span>{releaseYear}</span>
            {data?.movie.runtime ? <span>{data.movie.runtime} min</span> : null}
            {movie.vote_average ? <span>TMDB {movie.vote_average.toFixed(1)}</span> : null}
          </div>
          {(data?.movie.tagline || movie.overview) ? (
            <p className="dialog-overview">{data?.movie.tagline || movie.overview}</p>
          ) : null}

          <div className="availability-heading">
            <div>
              <p className="eyebrow">Licensed viewing options</p>
              <h3>Where to watch</h3>
            </div>
            <label className="region-select-label">
              <span className="sr-only">Availability region</span>
              <select value={region} onChange={(event) => setRegion(event.target.value)}>
                {regions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="availability-state" role="status">
              <LoaderCircle className="spinner" size={18} aria-hidden="true" />
              Checking current availability…
            </div>
          ) : error ? (
            <p className="availability-state availability-error" role="status">
              {error.message}
            </p>
          ) : groups.length > 0 ? (
            <div className="provider-groups">
              {groups.map((group) => (
                <div className="provider-group" key={group.label}>
                  <p>{group.label}</p>
                  <div className="provider-list">
                    {group.items.map((provider) => (
                      <span className="provider-chip" key={`${group.label}-${provider.provider_id}`}>
                        {provider.logo_path ? (
                          <Image
                            alt=""
                            className="provider-logo"
                            height={22}
                            src={tmdbImageUrl(provider.logo_path, "w92") ?? ""}
                            unoptimized
                            width={22}
                          />
                        ) : null}
                        {provider.provider_name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <a className="availability-link" href={validWatchLink} rel="noopener noreferrer" target="_blank">
                Check current availability <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          ) : (
            <div className="availability-empty">
              <span className="availability-empty-icon">
                <Check size={17} aria-hidden="true" />
              </span>
              <p>No provider listing for this region yet. Check back with the official guide.</p>
              <a href={validWatchLink} rel="noopener noreferrer" target="_blank">
                Open official watch guide <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          )}

          <p className="dialog-footnote">
            Availability can change by region. OneVault links to listed services and does not host movie files.
          </p>
        </div>
      </div>
    </dialog>
  );
}
