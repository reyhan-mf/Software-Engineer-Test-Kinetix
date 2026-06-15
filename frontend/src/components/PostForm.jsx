import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../api/axios";
import { AlertCircle, ImagePlus, Spinner, X } from "./icons";

const inputClass = (hasError) =>
  [
    "h-11 w-full rounded-xl border bg-white px-4 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus-visible:ring-2 motion-reduce:transition-none",
    hasError
      ? "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/30"
      : "border-[#D6DAC8] focus-visible:border-[#9CAFAA] focus-visible:ring-[#9CAFAA]/40",
  ].join(" ");

export default function PostForm({ mode = "create", initial = null, postId }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initial?.title || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [content, setContent] = useState(initial?.content || "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage || "");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [tab, setTab] = useState("write"); // write | preview
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = "Title is required";
    if (!content.trim()) next.content = "Content is required";
    return next;
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setServerError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post("/upload", fd);
      setCoverImage(res.data.url);
    } catch (err) {
      setServerError(err.response?.data?.message || "Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-selecting the same file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      setTab("write");
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || undefined,
        coverImage: coverImage || undefined,
      };
      const res =
        mode === "edit"
          ? await api.put(`/posts/${postId}`, payload)
          : await api.post("/posts", payload);
      navigate(`/posts/${res.data.post._id}`);
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const tabBtn = (active) =>
    active
      ? "rounded-md bg-white px-3 py-1 font-medium text-stone-900 shadow-sm"
      : "rounded-md px-3 py-1 text-stone-600 hover:text-stone-900";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#D6DAC8] sm:p-8"
    >
      {serverError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
            }}
            placeholder="An interesting title"
            aria-invalid={errors.title ? true : undefined}
            className={inputClass(errors.title)}
          />
          {errors.title && (
            <p
              role="alert"
              className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Category{" "}
            <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Technology, Travel, Food"
            className={inputClass(false)}
          />
        </div>

        {/* Cover image */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-stone-700">
            Cover image{" "}
            <span className="font-normal text-stone-400">(optional)</span>
          </span>
          {coverImage ? (
            <div className="relative overflow-hidden rounded-xl ring-1 ring-[#D6DAC8]">
              <img
                src={coverImage}
                alt="Cover preview"
                className="aspect-[21/9] w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setCoverImage("")}
                aria-label="Remove cover image"
                className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-lg bg-stone-900/60 text-white transition hover:bg-stone-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <label className="flex aspect-[21/9] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#9CAFAA]/60 bg-white text-stone-500 transition hover:bg-[#D6DAC8]/20">
              {uploading ? (
                <Spinner className="h-6 w-6 motion-safe:animate-spin" />
              ) : (
                <ImagePlus className="h-7 w-7" />
              )}
              <span className="text-sm font-medium">
                {uploading ? "Uploading…" : "Upload a cover image"}
              </span>
              <span className="text-xs">PNG, JPG, GIF or WEBP · max 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="sr-only"
              />
            </label>
          )}
        </div>

        {/* Content with markdown write/preview */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-stone-700"
            >
              Content <span className="text-rose-500">*</span>
            </label>
            <div className="inline-flex rounded-lg bg-[#D6DAC8]/40 p-0.5 text-sm">
              <button
                type="button"
                onClick={() => setTab("write")}
                className={tabBtn(tab === "write")}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={tabBtn(tab === "preview")}
              >
                Preview
              </button>
            </div>
          </div>

          {tab === "write" ? (
            <textarea
              id="content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content)
                  setErrors((p) => ({ ...p, content: undefined }));
              }}
              rows={14}
              placeholder="Write your story… Markdown is supported."
              aria-invalid={errors.content ? true : undefined}
              className={[
                "w-full resize-y rounded-xl border bg-white p-4 text-base leading-relaxed text-stone-900 outline-none transition placeholder:text-stone-400 focus-visible:ring-2 motion-reduce:transition-none",
                errors.content
                  ? "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/30"
                  : "border-[#D6DAC8] focus-visible:border-[#9CAFAA] focus-visible:ring-[#9CAFAA]/40",
              ].join(" ")}
            />
          ) : (
            <div className="prose prose-stone min-h-[22rem] max-w-none rounded-xl border border-[#D6DAC8] bg-white p-4 prose-a:text-[#9a5d4d] prose-img:rounded-xl">
              {content.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-stone-400">Nothing to preview yet.</p>
              )}
            </div>
          )}

          <p className="mt-1.5 text-xs text-stone-500">
            Supports Markdown — headings, **bold**, lists, links, and code.
          </p>
          {errors.content && (
            <p
              role="alert"
              className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.content}
            </p>
          )}
        </div>
      </div>

      <div className="mt-7 flex items-center justify-end gap-3">
        <Link
          to={mode === "edit" && postId ? `/posts/${postId}` : "/"}
          className="inline-flex h-11 items-center rounded-xl border border-[#D6DAC8] bg-white px-4 text-sm font-medium text-stone-700 transition hover:bg-[#D6DAC8]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA]"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#D6A99D] px-5 text-sm font-semibold text-stone-900 shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
        >
          {submitting && <Spinner className="h-4 w-4 motion-safe:animate-spin" />}
          {mode === "edit" ? "Save changes" : "Publish post"}
        </button>
      </div>
    </form>
  );
}
