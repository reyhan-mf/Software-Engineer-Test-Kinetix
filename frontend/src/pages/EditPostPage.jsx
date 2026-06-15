import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PostForm from "../components/PostForm";
import { AlertCircle, ArrowLeft } from "../components/icons";

const EditPostPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | forbidden | notfound | error

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        if (!active) return;
        const fetched = res.data.post;
        if (String(fetched.author?._id) !== String(user?.id)) {
          setStatus("forbidden");
        } else {
          setPost(fetched);
          setStatus("ready");
        }
      } catch (err) {
        if (!active) return;
        setStatus(err.response?.status === 404 ? "notfound" : "error");
      }
    })();
    return () => {
      active = false;
    };
  }, [id, user]);

  return (
    <div className="min-h-dvh bg-[#FBF3D5]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          to={status === "ready" ? `/posts/${id}` : "/"}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {status === "ready" ? "Back to post" : "Back to posts"}
        </Link>

        {status === "loading" && (
          <div className="rounded-2xl bg-white p-8 ring-1 ring-[#D6DAC8]">
            <div className="space-y-4">
              <div className="h-5 w-24 animate-pulse rounded bg-[#D6DAC8]/60" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-[#D6DAC8]/40" />
              <div className="h-48 w-full animate-pulse rounded-xl bg-[#D6DAC8]/40" />
            </div>
          </div>
        )}

        {(status === "forbidden" ||
          status === "notfound" ||
          status === "error") && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#D6DAC8] bg-white px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertCircle className="h-7 w-7" />
            </span>
            <h1 className="m-0 mt-4 text-lg font-semibold text-stone-900">
              {status === "forbidden"
                ? "You can't edit this post"
                : status === "notfound"
                  ? "Post not found"
                  : "Something went wrong"}
            </h1>
            <p className="mt-1 max-w-sm text-sm text-stone-600">
              {status === "forbidden"
                ? "Only the author can edit this post."
                : "We couldn't load this post for editing."}
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#D6A99D] px-4 text-sm font-semibold text-stone-900 shadow-sm transition hover:brightness-95"
            >
              Back to home
            </Link>
          </div>
        )}

        {status === "ready" && post && (
          <>
            <div className="mb-6">
              <h1 className="m-0 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
                Edit post
              </h1>
              <p className="mt-1.5 text-stone-600">
                Update your story and save your changes.
              </p>
            </div>
            <PostForm mode="edit" initial={post} postId={id} />
          </>
        )}
      </main>
    </div>
  );
};

export default EditPostPage;
