const Comment = require("../models/Comment");
const express = require("express");
const router = express.Router();
const checkUser = require("../middleware/auth");

const createComment = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.body.content?.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const comment = await Comment.create({
      content: req.body.content,
      author: req.user.id,
      post: postId,
      parent: req.body.parent || null,
    });

    return res.status(201).json({ comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const {postId} = req.params;

    const comment = await Comment.find({ post: postId })
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 });
    res.status(200).json({ comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this comment" });
    }

    if (!req.body.content?.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const newComment = await Comment.findByIdAndUpdate(id, req.body, { new: true });

    return res.status(200).json({ newComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this comment" });
    }

    // Collect the whole subtree (replies, replies-to-replies, …) so nested
    // descendants aren't left orphaned when a mid-thread comment is removed.
    const toDelete = [id];
    let frontier = [id];
    while (frontier.length) {
      const children = await Comment.find({ parent: { $in: frontier } }).select("_id");
      if (!children.length) break;
      const childIds = children.map((c) => c._id);
      toDelete.push(...childIds);
      frontier = childIds;
    }
    await Comment.deleteMany({ _id: { $in: toDelete } });

    return res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.get("/posts/:postId/comments", getComments);
router.post("/posts/:postId/comments", checkUser, createComment);
router.put("/comments/:id", checkUser, updateComment);
router.delete("/comments/:id", checkUser, deleteComment);

module.exports = router;
