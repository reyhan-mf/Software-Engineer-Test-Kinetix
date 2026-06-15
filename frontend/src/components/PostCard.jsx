import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import { BookOpen, Calendar } from "./icons";

const formatDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

export default function PostCard({ post }) {
  const author = post.author?.name || "Unknown";

  return (
    <Link
      to={`/posts/${post._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#D6DAC8] transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* Cover */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-linear-to-br from-[#D6DAC8] to-[#9CAFAA]">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-white/70" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-[#FBF3D5]/90 px-2.5 py-1 text-xs font-medium text-stone-700 backdrop-blur">
          {post.category || "General"}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="m-0 line-clamp-2 text-lg font-semibold leading-snug text-stone-900">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">
          {post.content}
        </p>

        <div className="mt-4 flex items-center gap-3 border-t border-[#D6DAC8] pt-4">
          <Avatar user={post.author} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-stone-800">{author}</p>
            <p className="flex items-center gap-1 text-xs text-stone-500">
              <Calendar className="h-3 w-3" />
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
