
const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  getQuiz,
  createQuizByPrompt,
  createQuizByURL,
  createQuizByPdf,
  createQuizByVideo,
  joinQuiz,
  submitQuiz,
  getLeaderBoards,
  updateQuiz,
} = require('../controllers/quizController');

const rateLimiters = require("../middleware/rateLimiter");
const { cacheQuiz, cacheLeaderboard } = require("../middleware/cache");
const {
  validateFileUpload,
  validateContentLength,
  validateNumbers,
  validateWalletAddress,
  validateURL,
  CONTENT_LIMITS
} = require("../middleware/validation");

// Configure multer with size limits
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

// Routes with appropriate middleware
router.get('/leaderboards/:quizId',
  cacheLeaderboard(60), // Cache for 1 minute
  getLeaderBoards
);

router.post('/verify/:quizId',
  rateLimiters.general,
  validateWalletAddress,
  cacheQuiz(300), // Cache for 5 minutes
  getQuiz
);

router.post('/create/prompt',
  rateLimiters.creation,
  rateLimiters.externalAPI,
  validateWalletAddress,
  validateContentLength('prompt', CONTENT_LIMITS.PROMPT),
  validateNumbers(['numParticipants', 'questionCount', 'rewardPerScore', 'totalCost']),
  createQuizByPrompt
);

router.post('/create/pdf',
  rateLimiters.creation,
  rateLimiters.upload,
  rateLimiters.externalAPI,
  upload.single('pdf'),
  validateFileUpload('PDF'),
  validateWalletAddress,
  validateNumbers(['numParticipants', 'questionCount', 'rewardPerScore', 'totalCost']),
  createQuizByPdf
);

router.post('/create/url',
  rateLimiters.creation,
  rateLimiters.externalAPI,
  validateWalletAddress,
  validateURL,
  validateNumbers(['numParticipants', 'questionCount', 'rewardPerScore', 'totalCost']),
  createQuizByURL
);

router.post('/create/video',
  rateLimiters.creation,
  rateLimiters.externalAPI,
  validateWalletAddress,
  validateURL,
  validateNumbers(['numParticipants', 'questionCount', 'rewardPerScore', 'totalCost']),
  createQuizByVideo
);

router.post('/join/:quizId',
  rateLimiters.general,
  validateWalletAddress,
  joinQuiz
);

router.post('/submit',
  rateLimiters.general,
  validateWalletAddress,
  submitQuiz
);

router.put('/update/:quizId',
  rateLimiters.general,
  updateQuiz
);

module.exports = router;
