import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Avatar from "../components/Avatar";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Camera,
  Check,
  Pencil,
  PenSquare,
  Spinner,
  Trash,
  X,
} from "../components/icons";
import { formatDate } from "../lib/format";

const ProfilePage = () => {
  const { updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const pr = await api.get("/users/profile");
        if (!active) return;
        const u = pr.data.user;
        setProfile(u);
        setName(u.name || "");
        const pp = await api.get(`/users/${u._id}/posts`);
        if (!active) return;
        setPosts(pp.data.posts || []);
        setStatus("success");
      } catch (err) {
        console.error(err);
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const up = await api.post("/upload", fd);
      const res = await api.put("/users/profile", { avatar: up.data.url });
      setProfile(res.data.user);
      updateUser({ avatar: res.data.user.avatar });
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const saveName = async () => {
    if (!name.trim()) return;
    setSavingName(true);
    try {
      const res = await api.put("/users/profile", { name: name.trim() });
      setProfile(res.data.user);
      updateUser({ name: res.data.user.name });
      setEditingName(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingName(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${deleteTarget}`);
      setPosts((prev) => prev.filter((p) => p._id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#FBF3D5]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        {status === "loading" && (
          <div className="rounded-2xl bg-white p-8 ring-1 ring-[#D6DAC8]">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 animate-pulse rounded-full bg-[#D6DAC8]/60" />
              <div className="space-y-2">
                <div className="h-5 w-40 animate-pulse rounded bg-[#D6DAC8]/60" />
                <div className="h-4 w-56 animate-pulse rounded bg-[#D6DAC8]/40" />
              </div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#D6DAC8] bg-white px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertCircle className="h-7 w-7" />
            </span>
            <h1 className="m-0 mt-4 text-lg font-semibold text-stone-900">
              Couldn&apos;t load your profile
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Please refresh the page or try again later.
            </p>
          </div>
        )}

        {status === "success" && profile && (
          <>
            {/* Profile header */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#D6DAC8] sm:p-8">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                <div className="relative">
                  <Avatar user={profile} size="lg" />
                  <label className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-[#9CAFAA] text-white ring-2 ring-white transition hover:brightness-95">
                    {uploadingAvatar ? (
                      <Spinner className="h-4 w-4 motion-safe:animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    <span className="sr-only">Upload profile picture</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatar}
                      disabled={uploadingAvatar}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  {editingName ? (
                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-label="Your name"
                        className="h-10 w-full max-w-xs rounded-lg border border-[#D6DAC8] bg-white px-3 text-base text-stone-900 outline-none focus-visible:border-[#9CAFAA] focus-visible:ring-2 focus-visible:ring-[#9CAFAA]/40"
                      />
                      <button
                        type="button"
                        onClick={saveName}
                        disabled={savingName || !name.trim()}
                        aria-label="Save name"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#9CAFAA] text-white transition hover:brightness-95 disabled:opacity-50"
                      >
                        {savingName ? (
                          <Spinner className="h-4 w-4 motion-safe:animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setName(profile.name || "");
                          setEditingName(false);
                        }}
                        aria-label="Cancel"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#D6DAC8] bg-white text-stone-600 transition hover:bg-[#D6DAC8]/40"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                      <h1 className="m-0 text-2xl font-semibold tracking-tight text-stone-900">
                        {profile.name}
                      </h1>
                      <button
                        type="button"
                        onClick={() => setEditingName(true)}
                        aria-label="Edit name"
                        className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition hover:bg-[#D6DAC8]/40 hover:text-stone-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="mt-1 text-sm text-stone-600">{profile.email}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {posts.length} {posts.length === 1 ? "post" : "posts"}
                  </p>
                </div>
              </div>
            </div>

            {/* User's posts */}
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="m-0 text-xl font-semibold text-stone-900">
                  Your posts
                </h2>
                <Link
                  to="/create"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#D6A99D] px-3.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA]"
                >
                  <PenSquare className="h-4 w-4" />
                  New Post
                </Link>
              </div>

              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#9CAFAA]/60 bg-white/60 px-6 py-12 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#D6DAC8]/60 text-[#5e716b]">
                    <BookOpen className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-sm text-stone-600">
                    You haven&apos;t written any posts yet.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {posts.map((p) => (
                    <li
                      key={p._id}
                      className="flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-[#D6DAC8] sm:p-4"
                    >
                      <Link
                        to={`/posts/${p._id}`}
                        className="flex min-w-0 flex-1 items-center gap-4"
                      >
                        <div className="hidden h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-linear-to-br from-[#D6DAC8] to-[#9CAFAA] sm:block">
                          {p.coverImage ? (
                            <img
                              src={p.coverImage}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-white/70">
                              <BookOpen className="h-5 w-5" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-stone-900">
                            {p.title}
                          </h3>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
                            <span className="rounded-full bg-[#D6DAC8]/60 px-2 py-0.5 font-medium text-stone-700">
                              {p.category || "General"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(p.createdAt)}
                            </span>
                          </p>
                        </div>
                      </Link>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <Link
                          to={`/edit/${p._id}`}
                          aria-label="Edit post"
                          className="grid h-9 w-9 place-items-center rounded-lg text-stone-500 transition hover:bg-[#D6DAC8]/40 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p._id)}
                          aria-label="Delete post"
                          className="grid h-9 w-9 place-items-center rounded-lg text-stone-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete post?"
        message="This post and its comments will be permanently removed. This action cannot be undone."
        confirmLabel="Delete post"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ProfilePage;
