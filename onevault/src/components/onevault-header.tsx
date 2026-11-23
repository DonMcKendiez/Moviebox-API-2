import { Clapperboard, Search } from "lucide-react";
import type { FormEvent, KeyboardEvent } from "react";
import type { CatalogCategory } from "@/lib/tmdb";

type OneVaultHeaderProps = {
  category: CatalogCategory;
  searchValue: string;
  onCategoryChange: (category: CatalogCategory) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

const navigation: { label: string; value: CatalogCategory }[] = [
  { label: "Discover", value: "trending" },
  { label: "Popular", value: "popular" },
  { label: "Top rated", value: "top_rated" },
  { label: "Coming soon", value: "upcoming" },
];

export function OneVaultHeader({
  category,
  searchValue,
  onCategoryChange,
  onSearchChange,
  onSearchSubmit,
  onSearchKeyDown,
}: OneVaultHeaderProps) {
  return (
    <header className="site-header" id="top">
      <a className="brand" href="#top" aria-label="OneVault home">
        <span className="brand-mark" aria-hidden="true">
          <Clapperboard size={19} strokeWidth={1.8} />
        </span>
        <span className="brand-word">onevault</span>
      </a>

      <nav className="main-nav" aria-label="Movie categories">
        {navigation.map((item) => (
          <button
            className={`nav-link${category === item.value ? " is-active" : ""}`}
            key={item.value}
            onClick={() => onCategoryChange(item.value)}
            type="button"
            aria-current={category === item.value ? "page" : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <form className="header-search" onSubmit={onSearchSubmit} role="search">
        <button aria-label="Search movies" className="search-submit" type="submit">
          <Search size={17} aria-hidden="true" />
        </button>
        <label className="sr-only" htmlFor="movie-search">
          Search movies
        </label>
        <input
          autoComplete="off"
          id="movie-search"
          maxLength={100}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={onSearchKeyDown}
          placeholder="Find a film..."
          type="search"
          value={searchValue}
        />
        <kbd aria-hidden="true">↵</kbd>
      </form>
    </header>
  );
}
