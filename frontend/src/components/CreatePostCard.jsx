import { Link } from "react-router-dom";
import { PenSquare } from "./icons";

// Inviting "create post" tile shown as the first card in the feed.
export default function CreatePostCard() {
  return (
    <Link
      to="/create"
      className="group flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#9CAFAA]/60 bg-white/50 p-6 text-center transition hover:border-[#9CAFAA] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA] motion-reduce:transition-none"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#D6A99D] text-stone-900 shadow-sm transition group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
        <PenSquare className="h-7 w-7" />
      </span>
      <div>
        <h2 className="m-0 text-lg font-semibold text-stone-900">
          Have an idea to share?
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Start writing your story.
        </p>
      </div>
    </Link>
  );
}
