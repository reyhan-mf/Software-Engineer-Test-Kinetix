const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const router = express.Router();
const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Issue our own JWT (same shape every auth route returns).
const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input — a user cannot register without a name, a valid email,
    // and a password of at least 6 characters.
    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email?.trim() || !emailRegex.test(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const userExisted = await User.findOne({ email });
    if (userExisted) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email or password is wrong" });
    }

    const isMatched = await user.comparePassword(password);
    if (!isMatched) {
      return res.status(400).json({ message: "Email or password is wrong" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({ message: "Logout Success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sign in / sign up with Google. The client sends a Google access token; we
// verify it really belongs to OUR app (audience check) and fetch the user's
// profile from Google, then find-or-create the user and return our own JWT —
// so the rest of the app is unaware of how they signed in.
const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ message: "Missing Google access token" });
    }

    // Verify the token's audience matches our client ID (rejects tokens minted
    // for other apps) and confirm the email is present + verified.
    const tokenInfo = await googleClient.getTokenInfo(access_token);
    if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ message: "Token audience mismatch" });
    }
    if (!tokenInfo.email || !tokenInfo.email_verified) {
      return res.status(400).json({ message: "Google account email not verified" });
    }

    const email = tokenInfo.email;
    const googleId = tokenInfo.sub;

    // Pull display name + avatar from the userinfo endpoint (non-fatal if it fails).
    let name, picture;
    try {
      const resp = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (resp.ok) {
        const profile = await resp.json();
        name = profile.name;
        picture = profile.picture;
      }
    } catch {
      /* keep going with email-derived name */
    }

    // Link by email so a user who registered locally can also use Google later.
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        avatar: picture,
        googleId,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }

    return res.status(200).json({ token: signToken(user), user: userPayload(user) });
  } catch (error) {
    return res.status(401).json({ message: "Google sign-in failed" });
  }
};

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/google", googleLogin);

module.exports = router;
