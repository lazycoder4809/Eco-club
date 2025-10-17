const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const UserBasics = require("../models/userDeateilsShema");
const Events = require("../models/Events");
const router = express.Router();



router.get("/profile", async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.redirect("/login");

    const decoded = jwt.verify(token, "w8ts54v7/2012/16/altay/sand");

    const user = await UserBasics.findById(decoded.id)
      .populate("eventsAttended") 
      .exec();

    if (!user) return res.status(404).send("User not found");


    const recentEvents = await Events.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    res.render("profile", { 
      user: user,
      events: recentEvents || [] 
    });
  } catch (err) {
    console.error("🔥 Profile error:", err);
    res.status(500).send("Internal Server Error");
  }
});


const uploadsDir = "public/uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads directory:", uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/profile/upload-image",
  (req, res, next) => {
    upload.single("profileImage")(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, error: err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      const token = req.cookies.jwt;
      if (!token) return res.status(401).json({ success: false, error: "Unauthorized" });

      const decoded = jwt.verify(token, "w8ts54v7/2012/16/altay/sand");

      if (!req.file) return res.status(400).json({ success: false, error: "No file selected" });

      const imageUrl = "/uploads/" + req.file.filename;
      const updatedUser = await UserBasics.findByIdAndUpdate(
        decoded.id,
        { profileImage: imageUrl },
        { new: true }
      );

      res.json({
        success: true,
        imageUrl,
        message: "Avatar updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      console.error("❌ Upload error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);



router.post("/profile/update-about", async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ success: false, error: "Not authenticated" });

    const decoded = jwt.verify(token, "w8ts54v7/2012/16/altay/sand");
    const user = await UserBasics.findById(decoded.id);

    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    user.aboutMe = req.body.aboutMe || "";
    await user.save();

    res.json({ success: true, aboutMe: user.aboutMe });
  } catch (err) {
    console.error("Update about error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get aboutMe JSON
router.get("/profile/get-about", async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ success: false, error: "Not authenticated" });

    const decoded = jwt.verify(token, "w8ts54v7/2012/16/altay/sand");
    const user = await UserBasics.findById(decoded.id);

    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, aboutMe: user.aboutMe });
  } catch (err) {
    console.error("Get about error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


router.post("/profile/likeadd", async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ success: false, error: "Unauthorized" });
    const decoded = jwt.verify(token, "w8ts54v7/2012/16/altay/sand");

    const { profileId } = req.body; 
    const likerId = decoded.id; 

    const profile = await UserBasics.findById(likerId);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    if (profile.likedBy.includes(likerId)) {
      return res.status(400).json({ success: false, message: "Already liked" });
    }

    profile.likedBy.push(likerId);
    profile.likes = profile.likedBy.length;
    await profile.save();

    res.json({ success: true, likes: profile.likes });
  } catch (err) {
    console.error("Error liking profile:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});



module.exports = router;
