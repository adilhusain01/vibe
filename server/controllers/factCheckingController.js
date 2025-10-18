const { GoogleGenerativeAI } = require("@google/generative-ai");
const FactCheck = require("../models/FactCheck");
const ParticipantFacts = require("../models/ParticipantFacts");
const mongoose = require("mongoose");
const pdfParse = require("pdf-parse");
const { google } = require("googleapis");
const youtube = google.youtube("v3");
const { Supadata } = require('@supadata/js');
const { Firecrawl } = require("@mendable/firecrawl-js");
const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
const { invalidateCache } = require("../middleware/cache");

class FactGenerator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generateFacts(
    topic,
    difficulty = "medium",
    creatorName,
    creatorWallet,
    numParticipants,
    totalCost,
    rewardPerScore,
    factsCount,
    isPublic
  ) {
    const difficultySettings = {
      easy: {
        complexity: "basic",
        timeLimit: 30,
      },
      medium: {
        complexity: "intermediate",
        timeLimit: 25,
      },
      hard: {
        complexity: "advanced",
        timeLimit: 20,
      },
    };

    const settings = difficultySettings[difficulty];

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const prompt = `Generate ${factsCount} ${settings.complexity} difficulty true/false statements about ${topic}.
    
    RULES:
    - Mix of true and false statements
    - Each statement should be clear and concise
    - Avoid obvious true/false indicators
    - Include interesting but lesser-known facts
    - For false statements, make subtle but clear modifications to true facts
    
    Format each fact as a JSON object with:
    {
      "statement": "[fact statement]",
      "isTrue": boolean,
    }
    
    Return as a JSON array of these objects.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedResponseText = responseText
        .replace(/```json|```/g, "")
        .trim();

      const facts = JSON.parse(cleanedResponseText);

      const factCheckId = Math.random().toString(36).substring(2, 7);

      const factCheck = new FactCheck({
        creatorName,
        creatorWallet,
        facts,
        numParticipants,
        totalCost,
        rewardPerScore,
        factsCount,
        isPublic,
        factCheckId,
      });

      await factCheck.save();
      return factCheck;
    } catch (error) {
      console.error("Fact Generation Error:", error);
      return this.getFallbackFacts(topic, difficulty);
    }
  }

  getFallbackFacts(topic, difficulty) {
    const fallbackFacts = {
      items: [
        {
          statement: `This is a sample ${topic} fact 1`,
          isTrue: true,
          explanation: "This is a fallback fact",
        },
        {
          statement: `This is a sample ${topic} fact 2`,
          isTrue: false,
          explanation: "This is another fallback fact",
        },
      ],
      difficulty,
      topic,
      timeLimit: 30,
    };

    return fallbackFacts;
  }
}

// Helper functions for different content types
const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("v");
    } else if (urlObj.hostname.includes("youtu.be")) {
      return urlObj.pathname.slice(1);
    }
    return null;
  } catch (error) {
    return null;
  }
};

const getVideoDetails = async (videoId) => {
  try {
    const response = await youtube.videos.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ["snippet"],
      id: [videoId],
    });

    if (response.data.items.length === 0) {
      return null;
    }

    return response.data.items[0].snippet;
  } catch (error) {
    return null;
  }
};

const getTranscriptFromAPI = async (videoId) => {
  try {
    const supadata = new Supadata({
      apiKey: process.env.SUPADATA_API_KEY,
    });

    const transcriptData = await supadata.youtube.transcript({
      videoId: videoId,
    });

    if (!transcriptData || !transcriptData.content || transcriptData.content.length === 0) {
      return null;
    }

    return transcriptData.content.map(item => item.text).join(' ');
  } catch (error) {
    return null;
  }
};

// Common fact check creation logic
const createFactCheckLogic = async (factCheckData, creatorWallet, creatorName) => {
  const factCheckId = Math.random().toString(36).substring(2, 7);

  const factCheck = new FactCheck({
    ...factCheckData,
    factCheckId,
    creatorWallet,
    creatorName,
  });

  await factCheck.save();
  return factCheck;
};

exports.createFactCheckByPrompt = async (req, res) => {
  try {
    const {
      topic,
      difficulty = "medium",
      creatorName,
      creatorWallet,
      numParticipants,
      totalCost,
      rewardPerScore,
      factsCount,
      isPublic,
    } = req.body;
    const factGenerator = new FactGenerator();

    const facts = await factGenerator.generateFacts(
      topic,
      difficulty,
      creatorName,
      creatorWallet,
      numParticipants,
      totalCost,
      rewardPerScore,
      factsCount,
      isPublic
    );

    res.json(facts);
  } catch (error) {
    res.status(500).json({
      error: "Failed to generate facts",
      details: error.message,
    });
  }
};

exports.createFactCheckByPdf = async (req, res) => {
  const {
    creatorName,
    creatorWallet,
    numParticipants,
    factsCount,
    rewardPerScore,
    totalCost,
    difficulty = "medium",
  } = req.body;
  const pdfFile = req.file;

  if (!pdfFile) {
    return res.status(400).json({ error: "No PDF file uploaded." });
  }

  try {
    const pdfData = await pdfParse(pdfFile.buffer);
    const factGenerator = new FactGenerator();

    const factCheck = await factGenerator.generateFacts(
      pdfData.text,
      difficulty,
      creatorName,
      creatorWallet,
      numParticipants,
      totalCost,
      rewardPerScore,
      factsCount,
      false // isPublic initially false
    );

    if (!factCheck || !factCheck.facts || factCheck.facts.length === 0) {
      return res.status(400).json({
        error: "Failed to generate valid facts from the PDF content",
      });
    }

    res.status(201).json({ factCheckId: factCheck.factCheckId });
  } catch (err) {
    console.error("Error creating fact check from PDF:", err);
    res.status(500).json({ error: "Failed to create fact check. " + err.message });
  }
};

exports.createFactCheckByURL = async (req, res) => {
  const {
    creatorName,
    creatorWallet,
    websiteUrl,
    numParticipants,
    factsCount,
    rewardPerScore,
    totalCost,
    difficulty = "medium",
  } = req.body;

  try {
    console.log("🌐 Scraping URL with Firecrawl SDK:", websiteUrl);

    const doc = await firecrawl.scrape(websiteUrl, {
      formats: ['markdown'],
      onlyMainContent: true,
      removeBase64Images: true,
      blockAds: true,
      timeout: 30000,
    });

    if (!doc || !doc.markdown) {
      return res.status(400).json({
        error: "Failed to extract content from the website",
      });
    }

    const websiteContent = doc.markdown;

    if (!websiteContent || websiteContent.length < 100) {
      return res.status(400).json({
        error: "Could not extract sufficient content from the provided URL",
      });
    }

    const factGenerator = new FactGenerator();
    const factCheck = await factGenerator.generateFacts(
      websiteContent,
      difficulty,
      creatorName,
      creatorWallet,
      numParticipants,
      totalCost,
      rewardPerScore,
      factsCount,
      false // isPublic initially false
    );

    if (!factCheck || !factCheck.facts || factCheck.facts.length === 0) {
      return res.status(400).json({
        error: "Failed to generate valid facts from the website content",
      });
    }

    res.status(201).json({ factCheckId: factCheck.factCheckId });
  } catch (err) {
    console.error("Error creating fact check from URL:", err);
    res.status(400).json({
      error: err.message || "Failed to create fact check from URL",
    });
  }
};

exports.createFactCheckByVideo = async (req, res) => {
  const {
    creatorName,
    creatorWallet,
    ytVideoUrl,
    numParticipants,
    factsCount,
    rewardPerScore,
    totalCost,
    difficulty = "medium",
  } = req.body;

  try {
    const videoId = extractVideoId(ytVideoUrl);
    if (!videoId) {
      return res.status(400).json({
        error: "Invalid YouTube URL. Please provide a valid YouTube video URL.",
      });
    }

    const videoDetails = await getVideoDetails(videoId);
    if (!videoDetails) {
      return res.status(400).json({
        error: "Could not fetch video details. Please check if the video exists.",
      });
    }

    const transcript = await getTranscriptFromAPI(videoId);
    if (!transcript) {
      return res.status(400).json({
        error: "Could not extract transcript from the video.",
      });
    }

    const factGenerator = new FactGenerator();
    const factCheck = await factGenerator.generateFacts(
      transcript,
      difficulty,
      creatorName,
      creatorWallet,
      numParticipants,
      totalCost,
      rewardPerScore,
      factsCount,
      false // isPublic initially false
    );

    if (!factCheck || !factCheck.facts || factCheck.facts.length === 0) {
      return res.status(400).json({
        error: "Failed to generate valid facts from the video content",
      });
    }

    res.status(201).json({ factCheckId: factCheck.factCheckId });
  } catch (err) {
    console.error("Error creating fact check from video:", err);
    res.status(400).json({
      error: err.message || "Failed to create fact check from video",
    });
  }
};

exports.updateFactCheck = async (req, res) => {
  const data = req.body;
  const { factCheckId } = req.params;

  try {
    const factCheck = await FactCheck.findOne({ factCheckId });

    if (!factCheck)
      return res.status(404).json({ message: "Fact Check not found" });

    Object.keys(data).forEach((key) => {
      if (key === "gameId" && typeof data[key] === "object" && data[key].hex) {
        factCheck[key] = parseInt(data[key].hex, 16);
      } else {
        factCheck[key] = data[key];
      }
    });

    await factCheck.save();

    // 🔄 CRITICAL: Invalidate cache when fact check is updated (especially isPublic status)
    invalidateCache.factCheck(factCheckId);
    console.log(`🗑️ Cache invalidated for fact check: ${factCheckId}`);

    const participants = await ParticipantFacts.find({ factCheckId });
    const participantWalletAddress = participants.map((p) => p.walletAddress);
    const participantRewards = participants.map((p) => p.reward);

    res.json({
      gameId: factCheck.gameId,
      participants: participantWalletAddress,
      rewards: participantRewards,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

exports.getFactCheck = async (req, res) => {
  const { factCheckId } = req.params;
  const { walletAddress } = req.body;

  try {
    const factCheck = await FactCheck.findOne({ factCheckId });
    if (!factCheck)
      return res.status(404).json({ error: "Fact Check not found" });

    if (!factCheck.isPublic) {
      return res.status(403).json({ error: "This fact check is private." });
    }

    const existingParticipant = await ParticipantFacts.findOne({
      factCheckId,
      walletAddress,
    });
    if (existingParticipant) {
      return res
        .status(403)
        .json({ error: "You have already participated in this fact check." });
    }

    const participantCount = await ParticipantFacts.countDocuments({
      factCheckId,
    });
    if (participantCount >= factCheck.numParticipants) {
      return res.status(403).json({
        error:
          "The number of participants for this fact check has been reached.",
      });
    }

    res.status(200).json(factCheck);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

exports.joinFactCheck = async (req, res) => {
  const { factCheckId } = req.params;
  const { walletAddress, participantName } = req.body;

  // Start a transaction session for atomic operations
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // First check if fact check exists and is valid
    const factCheck = await FactCheck.findOne({ factCheckId }).session(session);
    if (!factCheck) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Fact Check not found" });
    }

    if (factCheck.isPublic === false) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ error: "This fact check is private." });
    }

    // Check current participant count atomically
    const currentParticipantCount = await ParticipantFacts.countDocuments({
      factCheckId,
    }).session(session);

    if (currentParticipantCount >= factCheck.numParticipants) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        error: "The number of participants for this fact check has been reached.",
      });
    }

    // Try to create participant atomically with unique constraint
    try {
      const participant = new ParticipantFacts({
        factCheckId,
        participantName,
        walletAddress,
      });
      await participant.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // 🔄 CRITICAL: Invalidate cache when participant joins fact check
      invalidateCache.factCheck(factCheckId);
      console.log(`🗑️ Cache invalidated for fact check join: ${factCheckId}`);

      res.status(200).json(participant);

    } catch (saveError) {
      await session.abortTransaction();
      session.endSession();

      if (saveError.code === 11000) {
        // Duplicate key error - user already participated
        return res.status(403).json({
          error: "You have already participated in this fact check."
        });
      }
      throw saveError;
    }

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error joining fact check:", err);
    res.status(400).json({ error: err.message });
  }
};

exports.getLeaderBoards = async (req, res) => {
  const { factCheckId } = req.params;

  console.log(factCheckId);

  try {
    const factCheck = await FactCheck.findOne({ factCheckId });
    if (!factCheck)
      return res.status(404).json({ error: "Fact Check not found" });

    const participants = await ParticipantFacts.find({ factCheckId });

    res.status(200).json({ factCheck, participants });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

exports.submitFactCheck = async (req, res) => {
  const { factCheckId, walletAddress, answers } = req.body;

  try {
    const factCheck = await FactCheck.findOne({ factCheckId });
    if (!factCheck) {
      return res.status(404).json({ error: "Fact Check not found" });
    }

    const participant = await ParticipantFacts.findOne({
      factCheckId,
      walletAddress,
    });
    if (!participant) {
      return res
        .status(403)
        .json({ error: "You have not joined this fact check." });
    }

    let score = 0;
    factCheck.facts.forEach((fact) => {
      const userAnswer = answers[fact._id];
      const userAnswerBool = userAnswer === "true";
      if (userAnswerBool === fact.isTrue) {
        score++;
      }
    });

    const totalReward = score * factCheck.rewardPerScore;
    participant.score = score;
    participant.reward = totalReward;
    await participant.save();

    // 🔄 CRITICAL: Invalidate cache when participant submits fact check
    invalidateCache.factCheck(factCheckId);
    console.log(`🗑️ Cache invalidated for fact check submit: ${factCheckId}`);

    res.status(200).json(participant);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
