import { NextResponse } from "next/server";
import { getMovieDetails } from "@/lib/tmdb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const movieId = Number(id);
  const region = new URL(request.url).searchParams.get("region") ?? "US";

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return NextResponse.json({ error: "Invalid movie id." }, { status: 400 });
  }

  if (!/^[A-Z]{2}$/.test(region)) {
    return NextResponse.json({ error: "Invalid region." }, { status: 400 });
  }

  try {
    const details = await getMovieDetails(movieId, region);

    return NextResponse.json(details, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Viewing options are temporarily unavailable. Please try again." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
