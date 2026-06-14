const Post = require("../models/Post");
const express = require("express");
const router = express.Router();
const checkUser = require("../middleware/auth");

const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "name email");
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate("author", "name email");
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
    const { title, content, category } = req.body;

    const post = await Post.create({
      title,
      content,
      category,
      author: req.user.id,
    });

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
      return res.status(403).json({ message: "403" });
    }

    const newPost = await Post.findByIdAndUpdate(id, req.body, { new: true });

    return res.status(200).json({ newPost });
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
      return res.status(403).json({ message: "403" });
    }

    const deletedPost = await Post.findByIdAndDelete(id);

    return res.status(200).json({ deletedPost });
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
