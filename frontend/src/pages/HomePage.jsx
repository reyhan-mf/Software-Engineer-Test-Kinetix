import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import CreatePostCard from "../components/CreatePostCard";
import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  PenSquare,
  RefreshCw,
  Search,
  X,
} from "../components/icons";

const PAGE_SIZE = 6;

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
      <div
        key={i}
        className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#D6DAC8]"
      >
        <div className="aspect-[16/9] w-full animate-pulse bg-[#D6DAC8]/50" />
        <div className="space-y-3 p-5">
          <div className="h-5 w-3/4 animate-pulse rounded bg-[#D6DAC8]/60" />
          <div className="h-4 w-full animate-pulse rounded bg-[#D6DAC8]/40" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-[#D6DAC8]/40" />
          <div className="mt-4 flex items-center gap-3 border-t border-[#D6DAC8] pt-4">
            <div className="h-9 w-9 animate-pulse rounded-full bg-[#D6DAC8]/60" />
            <div className="h-4 w-24 animate-pulse rounded bg-[#D6DAC8]/50" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ search }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#9CAFAA]/60 bg-white/60 px-6 py-16 text-center">
    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#D6DAC8]/60 text-[#5e716b]">
      <BookOpen className="h-7 w-7" />
    </span>
    <h2 className="m-0 mt-4 text-lg font-semibold text-stone-900">
      {search ? "No matching posts" : "No posts yet"}
    </h2>
    <p className="mt-1 max-w-sm text-sm text-stone-600">
      {search
        ? `We couldn't find anything for “${search}”. Try a different keyword.`
        : "Be the first to share a story. Your published posts will appear here."}
    </p>
    {!search && (
      <Link
        to="/create"
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#D6A99D] px-4 text-sm font-semibold text-stone-900 shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF3D5] active:scale-[0.98] motion-reduce:transition-none"
      >
        <PenSquare className="h-4 w-4" />
        Write your first post
      </Link>
    )}
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 py-16 text-center">
    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-600">
      <AlertCircle className="h-7 w-7" />
    </span>
    <h2 className="m-0 mt-4 text-lg font-semibold text-stone-900">
      Couldn&apos;t load posts
    </h2>
    <p className="mt-1 max-w-sm text-sm text-stone-600">
      Something went wrong while fetching the feed. Check your connection and
      try again.
    </p>
    <button
      onClick={onRetry}
      className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-[#D6DAC8] bg-white px-4 text-sm font-medium text-stone-700 transition hover:bg-[#D6DAC8]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF3D5] active:scale-[0.98] motion-reduce:transition-none"
    >
      <RefreshCw className="h-4 w-4" />
      Retry
    </button>
  </div>
);

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  // Debounce the search input; reset to page 1 when the query actually changes.
  useEffect(() => {
    if (search.trim() === debounced) return;
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
      setStatus("loading");
    }, 400);
    return () => clearTimeout(t);
  }, [search, debounced]);

  // Fetch the feed; state is only set after the request resolves.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("/posts", {
          params: { search: debounced || undefined, page, limit: PAGE_SIZE },
        });
        if (!active) return;
        setPosts(res.data.posts || []);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
        setStatus("success");
      } catch (err) {
        console.error(err);
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [debounced, page, reloadKey]);

  const goToPage = (p) => {
    setPage(p);
    setStatus("loading");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="min-h-dvh bg-[#FBF3D5]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
              Latest stories
            </h1>
            <p className="mt-1.5 text-stone-600">
              Welcome back{user?.name ? `, ${user.name}` : ""} — discover what
              people are writing.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              aria-label="Search posts by title or content"
              className="h-11 w-full rounded-xl border border-[#D6DAC8] bg-white pl-10 pr-10 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus-visible:border-[#9CAFAA] focus-visible:ring-2 focus-visible:ring-[#9CAFAA]/40 motion-reduce:transition-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-stone-400 transition hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA]/40"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {status === "success" && total > 0 && (
          <p className="mb-4 text-sm text-stone-500" aria-live="polite">
            {total} {total === 1 ? "post" : "posts"}
            {debounced ? ` for “${debounced}”` : ""}
          </p>
        )}

        {status === "loading" && <SkeletonGrid />}
        {status === "error" && <ErrorState onRetry={handleRetry} />}
        {status === "success" && debounced && posts.length === 0 && (
          <EmptyState search={debounced} />
        )}
        {status === "success" && (posts.length > 0 || !debounced) && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {page === 1 && !debounced && <CreatePostCard />}
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-3"
                aria-label="Pagination"
              >
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="inline-flex h-10 items-center gap-1 rounded-xl border border-[#D6DAC8] bg-white px-3.5 text-sm font-medium text-stone-700 transition hover:bg-[#D6DAC8]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <span className="text-sm font-medium text-stone-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="inline-flex h-10 items-center gap-1 rounded-xl border border-[#D6DAC8] bg-white px-3.5 text-sm font-medium text-stone-700 transition hover:bg-[#D6DAC8]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;
