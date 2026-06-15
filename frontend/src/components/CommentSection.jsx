import { useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Avatar from "./Avatar";
import ConfirmDialog from "./ConfirmDialog";
import { Check, Pencil, Reply, Send, Spinner, Trash, X } from "./icons";
import { formatDateTime } from "../lib/format";

export default function CommentSection({ postId }) {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get(`/posts/${postId}/comments`);
        if (!active) return;
        setComments(res.data.comment || []);
        setStatus("success");
      } catch (err) {
        console.error(err);
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [postId]);

  const refetch = async () => {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(res.data.comment || []);
    } catch (err) {
      console.error(err);
    }
  };

  const byId = comments.reduce((acc, c) => {
    acc[String(c._id)] = c;
    return acc;
  }, {});

  const topLevel = comments.filter((c) => !c.parent);

  // All replies under a root comment, flattened to one level and sorted
  // oldest-first, so a reply-to-a-reply still appears in the same thread.
  const threadOf = (rootId) => {
    const childrenOf = (pid) =>
      comments
        .filter((c) => String(c.parent) === String(pid))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const out = [];
    const walk = (pid) => {
      for (const child of childrenOf(pid)) {
        out.push(child);
        walk(child._id);
      }
    };
    walk(rootId);
    return out;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/posts/${postId}/comments`, { content: content.trim() });
      setContent("");
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId) => {
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    try {
      await api.post(`/posts/${postId}/comments`, {
        content: replyContent.trim(),
        parent: parentId,
      });
      setReplyContent("");
      setReplyingTo(null);
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setEditContent(c.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveEdit = async (id) => {
    if (!editContent.trim()) return;
    setSavingEdit(true);
    try {
      await api.put(`/comments/${id}`, { content: editContent.trim() });
      cancelEdit();
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/comments/${deleteTarget}`);
      setDeleteTarget(null);
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const renderReplyForm = (target) => (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-[#9CAFAA]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9CAFAA]/15 px-2.5 py-1 text-xs font-medium text-[#5f7068]">
          <Reply className="h-3.5 w-3.5" />
          Replying to {target.author?.name || "comment"}
        </span>
        <button
          type="button"
          onClick={() => {
            setReplyingTo(null);
            setReplyContent("");
          }}
          aria-label="Cancel reply"
          className="grid h-7 w-7 place-items-center rounded-lg text-stone-500 transition hover:bg-[#D6DAC8]/40 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        rows={2}
        placeholder={`Reply to ${target.author?.name || "comment"}…`}
        className="w-full resize-y rounded-xl border border-[#D6DAC8] bg-white p-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus-visible:border-[#9CAFAA] focus-visible:ring-2 focus-visible:ring-[#9CAFAA]/40 motion-reduce:transition-none"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setReplyingTo(null);
            setReplyContent("");
          }}
          disabled={submittingReply}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D6DAC8] bg-white px-3 text-sm font-medium text-stone-700 transition hover:bg-[#D6DAC8]/40 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleReply(target._id)}
          disabled={submittingReply || !replyContent.trim()}
          className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#9CAFAA] px-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submittingReply ? (
            <Spinner className="h-4 w-4 motion-safe:animate-spin" />
          ) : (
            <Reply className="h-4 w-4" />
          )}
          Reply
        </button>
      </div>
    </div>
  );

  const renderComment = (c, { isReply = false, parentComment = null } = {}) => {
    const isOwner = String(user?.id) === String(c.author?._id);
    const isEditing = editingId === c._id;
    const isReplyTarget = replyingTo === c._id;
    const parentAuthorName = parentComment?.author?.name || "Unknown";
    return (
      <article
        key={c._id}
        className={`rounded-2xl bg-white p-4 ring-1 transition ${
          isReplyTarget
            ? "ring-2 ring-[#9CAFAA]"
            : "ring-[#D6DAC8]"
        }`}
      >
        <div className="flex items-start gap-3">
          <Avatar user={c.author} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-stone-800">
                  {c.author?.name || "Unknown"}
                </p>
                {isReply && (
                  <p className="flex items-center gap-1 text-xs font-medium text-[#9a5d4d]">
                    <Reply className="h-3 w-3" />
                    <span className="truncate">Replying to {parentAuthorName}</span>
                  </p>
                )}
                <p className="text-xs text-stone-500">
                  {formatDateTime(c.createdAt)}
                </p>
              </div>

              {!isEditing && (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(c._id);
                      setReplyContent("");
                    }}
                    className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-stone-500 transition hover:bg-[#D6DAC8]/40 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA]"
                  >
                    <Reply className="h-4 w-4" />
                    <span className="hidden sm:inline">Reply</span>
                  </button>
                  {isOwner && (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        aria-label="Edit comment"
                        className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition hover:bg-[#D6DAC8]/40 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c._id)}
                        aria-label="Delete comment"
                        className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-[#D6DAC8] bg-white p-3 text-sm text-stone-900 outline-none transition focus-visible:border-[#9CAFAA] focus-visible:ring-2 focus-visible:ring-[#9CAFAA]/40 motion-reduce:transition-none"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={savingEdit}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D6DAC8] bg-white px-3 text-sm font-medium text-stone-700 transition hover:bg-[#D6DAC8]/40 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveEdit(c._id)}
                    disabled={savingEdit || !editContent.trim()}
                    className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#9CAFAA] px-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingEdit ? (
                      <Spinner className="h-4 w-4 motion-safe:animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isReply && parentComment && (
                  <blockquote className="mt-2 rounded-lg border-l-2 border-[#9CAFAA] bg-[#FBF3D5]/60 px-3 py-1.5">
                    <p className="m-0 text-xs font-medium text-stone-600">
                      {parentAuthorName}
                    </p>
                    <p className="m-0 line-clamp-2 text-xs text-stone-500">
                      {parentComment.content}
                    </p>
                  </blockquote>
                )}
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
                  {c.content}
                </p>
              </>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="mt-10" aria-label="Comments">
      <h2 className="m-0 text-xl font-semibold text-stone-900">
        Comments{status === "success" ? ` (${comments.length})` : ""}
      </h2>

      {/* Add comment */}
      <form onSubmit={handleAdd} className="mt-4">
        <label htmlFor="new-comment" className="sr-only">
          Write a comment
        </label>
        <textarea
          id="new-comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Share your thoughts…"
          className="w-full resize-y rounded-xl border border-[#D6DAC8] bg-white p-3.5 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus-visible:border-[#9CAFAA] focus-visible:ring-2 focus-visible:ring-[#9CAFAA]/40 motion-reduce:transition-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#D6A99D] px-4 text-sm font-semibold text-stone-900 shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CAFAA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF3D5] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
          >
            {submitting ? (
              <Spinner className="h-4 w-4 motion-safe:animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Comment
          </button>
        </div>
      </form>

      {/* List */}
      <div className="mt-6 space-y-4">
        {status === "loading" && (
          <p className="text-sm text-stone-500">Loading comments…</p>
        )}
        {status === "error" && (
          <p className="text-sm text-rose-600">Couldn&apos;t load comments.</p>
        )}
        {status === "success" && comments.length === 0 && (
          <p className="text-sm text-stone-500">
            No comments yet. Be the first to comment.
          </p>
        )}

        {status === "success" &&
          topLevel.map((root) => {
            const thread = threadOf(root._id);
            const showThreadColumn =
              thread.length > 0 || replyingTo === root._id;
            return (
              <div key={root._id}>
                {renderComment(root, { isReply: false })}

                {showThreadColumn && (
                  <div className="ml-6 mt-3 space-y-3 border-l-2 border-[#D6DAC8] pl-4 sm:ml-11 sm:pl-5">
                    {replyingTo === root._id && renderReplyForm(root)}

                    {thread.map((r) => (
                      <div key={r._id} className="space-y-3">
                        {renderComment(r, {
                          isReply: true,
                          parentComment: byId[String(r.parent)] || null,
                        })}
                        {replyingTo === r._id && renderReplyForm(r)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete comment?"
        message="This comment will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  );
}
