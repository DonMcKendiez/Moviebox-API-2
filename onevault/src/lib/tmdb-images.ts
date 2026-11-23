export function tmdbImageUrl(
  imagePath: string | null | undefined,
  size: "w92" | "w342" | "w500" | "w780" | "original" = "w500",
) {
  return imagePath
    ? `https://image.tmdb.org/t/p/${size}${imagePath}`
    : null;
}
