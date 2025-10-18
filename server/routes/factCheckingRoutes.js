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

const rateLimiters = require("../middleware/rateLimiter");
const { cacheQuiz, cacheLeaderboard } = require("../middleware/cache");
const {
  validateFileUpload,
  validateContentLength,
  validateNumbers,
  validateWalletAddress,
  validateWalletAddressEnhanced,
  validateURL,
  validateGameId,
  validateAnswers,
  sanitizeInput,
  CONTENT_LIMITS
} = require("../middleware/validation");

// Configure multer with enhanced security
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file per request
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Routes with comprehensive security middleware
router.get("/leaderboards/:factCheckId",
  validateGameId,
  cacheLeaderboard(60), // Cache for 1 minute
  getLeaderBoards
);

router.post("/verify/:factCheckId",
  rateLimiters.general,
  validateGameId,
  validateWalletAddressEnhanced,
  cacheQuiz(300), // Cache for 5 minutes
  getFactCheck
);

router.post("/create/prompt",
  rateLimiters.creation,
  rateLimiters.externalAPI,
  validateWalletAddressEnhanced,
  validateContentLength('topic', CONTENT_LIMITS.PROMPT),
  sanitizeInput(['topic', 'creatorName']),
  validateNumbers(['numParticipants', 'factsCount', 'rewardPerScore', 'totalCost']),
  createFactCheckByPrompt
);

router.post("/create/pdf",
  rateLimiters.creation,
  rateLimiters.upload,
  rateLimiters.externalAPI,
  upload.single('pdf'),
  validateFileUpload('PDF'),
  validateWalletAddressEnhanced,
  sanitizeInput(['creatorName']),
  validateNumbers(['numParticipants', 'factsCount', 'rewardPerScore', 'totalCost']),
  createFactCheckByPdf
);

router.post("/create/url",
  rateLimiters.creation,
  rateLimiters.externalAPI,
  validateWalletAddressEnhanced,
  validateURL,
  sanitizeInput(['creatorName']),
  validateNumbers(['numParticipants', 'factsCount', 'rewardPerScore', 'totalCost']),
  createFactCheckByURL
);

router.post("/create/video",
  rateLimiters.creation,
  rateLimiters.externalAPI,
  validateWalletAddressEnhanced,
  validateURL,
  sanitizeInput(['creatorName']),
  validateNumbers(['numParticipants', 'factsCount', 'rewardPerScore', 'totalCost']),
  createFactCheckByVideo
);

router.post("/join/:factCheckId",
  rateLimiters.general,
  validateGameId,
  validateWalletAddressEnhanced,
  sanitizeInput(['participantName']),
  joinFactCheck
);

router.post("/submit",
  rateLimiters.general,
  validateWalletAddressEnhanced,
  validateAnswers,
  submitFactCheck
);

router.put("/update/:factCheckId",
  rateLimiters.general,
  validateGameId,
  updateFactCheck
);

module.exports = router;
