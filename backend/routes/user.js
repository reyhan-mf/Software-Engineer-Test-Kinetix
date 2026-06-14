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

    const postByProfile = await Post.find({author: id});

    return res.status(200).json({ postByProfile });
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

    const newProfile = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });

    return res.status(200).json({ newProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.get("/users/profile",checkUser, getProfile);
router.get("/users/:id/posts", getPostByProfile);
router.put("/users/profile", checkUser, updateProfile);

module.exports = router;
