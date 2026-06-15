const User = require("../models/User");
const express = require("express");
const router = express.Router();
const checkUser = require("../middleware/auth");
const Post = require("../models/Post");

const getProfile= async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if(!user){
        return res.status(400).json({message: "User is not exist"});
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostByProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const posts = await Post.find({ author: id })
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Whitelist editable fields; never let the client touch password/email here.
    const { name, avatar } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const newProfile = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.status(200).json({ user: newProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.get("/users/profile",checkUser, getProfile);
router.get("/users/:id/posts", getPostByProfile);
router.put("/users/profile", checkUser, updateProfile);

module.exports = router;
