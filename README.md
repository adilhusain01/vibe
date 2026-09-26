# VIBE

---

## Problem

At TOKEN2049 Singapore, I noticed Web3 events still rely on Web2 tools like Kahoot for interactive games. Manual prize distribution is inefficient, and creating game content takes too much time.

---

## Solution

VIBE is a Web3 gaming platform where:

- Organizers deposit tokens for prize pools
- Winners receive rewards directly to their wallets
- AI generates game content from any source (prompts, PDFs, URLs, YouTube videos)
- Platform takes 5% commission per game

---

## Current Games

1. **Quiz Game** - Multi-choice questions
2. **Fact Check Game** - True/false verification challenges

Both games support AI content generation from:

- Text prompts/topics
- PDF uploads
- Webpage URLs
- YouTube video links

---

## Key Features

- **No wallet required (eg. Metamask)** - Social login with non-custodial wallets via Privy
- **AI-powered content generation** - Create games instantly from multiple sources
- **Live on mainnet** - Real token rewards on Somnia blockchain
- **Mobile responsive** - Full functionality across all devices

---

## Tech Stack

- Smart contracts on Somnia blockchain for transparent reward distribution
- React + Tailwind CSS frontend. NodeJs for backend. MongoDB for DB
- Gemini API for AI content generation
- Privy for wallet abstraction

---

## Challenges Solved

- Secure automated reward distribution via smart contracts
- Quality AI-generated game content from diverse sources
- Seamless UX despite blockchain transaction times

---

## What's Next

- Expand game library beyond quiz and fact-check
- Telegram Mini App
- Native token launch
- Custom token creation for games
- Real-time tournaments with larger prize pools
- Educational institution partnerships
- NFT rewards

---

## Impact

Transform how Web3 communities engage, learn, and distribute value - making every interaction rewarding for both organizers and participants.

---

## Mainnet Deployed Contract Address

0x69579be58808F847a103479Bb023E9c457127369
---

## Getting Started (local development)

**Prerequisites:** Node.js 18+, npm, and a MongoDB connection string.

```bash
git clone git@github.com:adilhusain01/vibe.git
cd vibe
```

### Server (`server/`, Express, default port 5000)

```bash
cd server
npm install
cp .env.example .env   # GEMINI_API_KEY, PORT, MONGO_URI, YOUTUBE_API_KEY, FIRECRAWL_API_KEY, SUPADATA_API_KEY
npm run dev            # nodemon; `npm start` for plain node
```

Health check: `http://localhost:5000/health`. Request logs are written to `server/logs/` (created automatically, git-ignored).

### Client (`client/`, React + Vite)

```bash
cd client
npm install
cp .env.example .env   # VITE_SERVER_URI (e.g. http://localhost:5000), VITE_CLIENT_URI, VITE_CONTRACT_ADDRESS, VITE_PRIVY_APP_ID, ...
npm run dev            # http://localhost:5173
```

Other client scripts: `npm run build`, `npm run preview`, `npm run lint`.

### Smart contracts (`contracts/`)

`contracts/VIBE.sol` and `contracts/NFT.sol` are standalone Solidity files (no Hardhat/Foundry project). Deploy with Remix or similar; the mainnet address is listed above.
