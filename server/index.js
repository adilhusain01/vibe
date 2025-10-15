const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const { logger } = require("./middleware/logEvents");
require("dotenv").config();
const quizRoutes = require("./routes/quizRoutes");
const typingRoutes = require("./routes/typingRoutes");
const memoryChallengeRoutes = require("./routes/memoryChallengeRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(logger);
app.use("/api/quiz", quizRoutes);
app.use("/api/typing", typingRoutes);
app.use("/api/memory-challenge", memoryChallengeRoutes);
app.use("/api/fact-check", require("./routes/factCheckingRoutes"));
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
