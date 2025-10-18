const express = require("express");
const multer = require('multer');
const router = express.Router();
const {
  createFactCheckByPrompt,
  createFactCheckByPdf,
  createFactCheckByURL,
  createFactCheckByVideo,
  updateFactCheck,
  getFactCheck,
  joinFactCheck,
  getLeaderBoards,
  submitFactCheck,
} = require("../controllers/factCheckingController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/leaderboards/:factCheckId", getLeaderBoards);
router.post("/verify/:factCheckId", getFactCheck);
router.post("/create/prompt", createFactCheckByPrompt);
router.post("/create/pdf", upload.single('pdf'), createFactCheckByPdf);
router.post("/create/url", createFactCheckByURL);
router.post("/create/video", createFactCheckByVideo);
router.post("/join/:factCheckId", joinFactCheck);
router.post("/submit", submitFactCheck);
router.put("/update/:factCheckId", updateFactCheck);

module.exports = router;
