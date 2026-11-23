import { NextResponse } from "next/server";
import { getMovieCatalog, type CatalogCategory } from "@/lib/tmdb";

const categories = new Set<CatalogCategory>([
  "trending",
  "popular",
  "top_rated",
  "upcoming",
]);

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const categoryValue = searchParams.get("category") ?? "trending";
  const query = (searchParams.get("query") ?? "").trim().slice(0, 100);
  const genreValue = searchParams.get("genre");
  const genreId = genreValue ? Number(genreValue) : undefined;

  if (!categories.has(categoryValue as CatalogCategory)) {
    return NextResponse.json({ error: "Unknown catalog category." }, { status: 400 });
  }

  if (genreValue && (!Number.isInteger(genreId) || Number(genreId) <= 0)) {
    return NextResponse.json({ error: "Invalid genre." }, { status: 400 });
  }

  try {
    const catalog = await getMovieCatalog({
      category: categoryValue as CatalogCategory,
      query,
      genreId,
    });

    return NextResponse.json(catalog, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "The movie catalog is temporarily unavailable. Please try again." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
