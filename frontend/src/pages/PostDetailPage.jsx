import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Avatar from "../components/Avatar";
import ConfirmDialog from "../components/ConfirmDialog";
import CommentSection from "../components/CommentSection";
import { AlertCircle, ArrowLeft, Calendar, Pencil, Trash } from "../components/icons";
import { formatDate } from "../lib/format";

const PostDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error | notfound
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        if (!active) return;
        setPost(res.data.post);
        setStatus("success");
      } catch (err) {
        if (!active) return;
        setStatus(err.response?.status === 404 ? "notfound" : "error");
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const isAuthor = post && String(user?.id) === String(post.author?._id);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/posts/${id}`);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#FBF3D5]">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to posts
        </Link>

        {status === "loading" && (
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#D6DAC8]">
            <div className="aspect-[21/9] w-full animate-pulse bg-[#D6DAC8]/50" />
            <div className="space-y-4 p-8">
              <div className="h-8 w-3/4 animate-pulse rounded bg-[#D6DAC8]/60" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-[#D6DAC8]/40" />
              <div className="h-4 w-full animate-pulse rounded bg-[#D6DAC8]/40" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-[#D6DAC8]/40" />
            </div>
          </div>
        )}

        {(status === "notfound" || status === "error") && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#D6DAC8] bg-white px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertCircle className="h-7 w-7" />
            </span>
            <h1 className="m-0 mt-4 text-lg font-semibold text-stone-900">
              {status === "notfound" ? "Post not found" : "Something went wrong"}
            </h1>
            <p className="mt-1 max-w-sm text-sm text-stone-600">
              {status === "notfound"
                ? "This post may have been removed or the link is incorrect."
                : "We couldn't load this post. Please try again later."}
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#D6A99D] px-4 text-sm font-semibold text-stone-900 shadow-sm transition hover:brightness-95"
            >
              Back to home
            </Link>
          </div>
        )}

        {status === "success" && post && (
          <>
            <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#D6DAC8]">
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="aspect-[21/9] w-full object-cover"
                />
              )}

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="rounded-full bg-[#D6DAC8]/60 px-2.5 py-1 text-xs font-medium text-stone-700">
                    {post.category || "General"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-stone-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.createdAt)}
                  </span>
                </div>

                <h1 className="m-0 mt-3 text-3xl font-bold leading-tight tracking-tight text-stone-900">
                  {post.title}
                </h1>

                <div className="mt-5 flex items-center justify-between gap-3 border-b border-[#D6DAC8] pb-5">
                  <div className="flex items-center gap-3">
                    <Avatar user={post.author} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-800">
                        {post.author?.name || "Unknown"}
                      </p>
                      <p className="truncate text-xs text-stone-500">
                        {post.author?.email}
                      </p>
                    </div>
                  </div>

                  {isAuthor && (
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        to={`/edit/${post._id}`}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D6DAC8] bg-white px-3.5 text-sm font-medium text-stone-700 transition hover:bg-[#D6DAC8]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA]"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmOpen(true)}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-white px-3.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="prose prose-stone mt-6 max-w-none prose-headings:font-semibold prose-a:font-medium prose-a:text-[#9a5d4d] prose-img:rounded-xl">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                  </ReactMarkdown>
                </div>
              </div>
            </article>

            <CommentSection postId={id} />
          </>
        )}
      </main>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete post?"
        message="This post and its comments will be permanently removed. This action cannot be undone."
        confirmLabel="Delete post"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default PostDetailPage;
