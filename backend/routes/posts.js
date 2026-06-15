const Post = require("../models/Post");
const express = require("express");
const router = express.Router();
const checkUser = require("../middleware/auth");

const getAllPost = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 50);
    const search = (req.query.search || "").trim();

    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      posts,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate("author", "name email avatar");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, category, coverImage } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const post = await Post.create({
      title,
      content,
      category,
      coverImage,
      author: req.user.id,
    });
    await post.populate("author", "name email avatar");

    return res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this post" });
    }

    // Whitelist editable fields so author/createdAt can't be overwritten.
    const { title, content, category, coverImage } = req.body;
    const updates = { title, content, category, coverImage };

    const updated = await Post.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("author", "name email avatar");

    return res.status(200).json({ post: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this post" });
    }

    await Post.findByIdAndDelete(id);

    return res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.get("/", getAllPost);
router.get("/:id", getPostById);
router.post("/", checkUser, createPost);
router.put("/:id", checkUser, updatePost);
router.delete("/:id", checkUser, deletePost);

module.exports = router;
