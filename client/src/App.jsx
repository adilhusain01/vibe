import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { PrivyProvider } from '@privy-io/react-auth';
import PrivyAuthProvider from "./context/PrivyAuthContext";

const Layout = lazy(() => import("./components/Layout"));
const Home = lazy(() => import("./pages/Home"));
const PdfToQuiz = lazy(() => import("./pages/PdfToQuiz"));
const PromptToQuiz = lazy(() => import("./pages/PromptToQuiz"));
const LeaderBoards = lazy(() => import("./pages/LeaderBoards"));
const Quiz = lazy(() => import("./pages/Quiz"));
const URLToQuiz = lazy(() => import("./pages/URLToQuiz"));
const VideoToQuiz = lazy(() => import("./pages/VideoToQuiz"));
const Typing = lazy(() => import("./pages/Typing"));
const MemoryChallenge = lazy(() => import("./pages/MemoryChallenge"));
const QuizOptions = lazy(() => import("./pages/QuizOptions"));
const BrokenLink = lazy(() => import("./pages/BrokenLink"));
const ServerError = lazy(() => import("./pages/ServerError"));
const FactCheck = lazy(() => import("./pages/FactCheck"));
const FactCheckingGame = lazy(() => import("./pages/FactCheckingGame"));
const FactCheckLeaderboards = lazy(() =>
import("./pages/FactCheckLeaderboards")
);
const Profile = lazy(() => import("./pages/Profile"));
import LoadingSpinner from "./components/LoadingSpinner";

const App = () => {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        "appearance": {
          "accentColor": "#EF8977",
          "theme": "#222224",
          "showWalletLoginFirst": false,
          "logo": "https://auth.privy.io/logos/privy-logo-dark.png",
          "walletChainType": "ethereum-only",
          "walletList": [
            "detected_wallets",
            "metamask",
            "rainbow",
            "wallet_connect"
          ]
        },
        "loginMethods": [
          "wallet",
          "google"
        ],
        "fundingMethodConfig": {
          "moonpay": {
            "useSandbox": true
          }
        },
        "embeddedWallets": {
          "requireUserPasswordOnCreate": false,
          "showWalletUIs": true,
          "ethereum": {
            "createOnLogin": "users-without-wallets"
          }
        },
        "mfa": {
          "noPromptOnMfaRequired": false
        },
        "supportedChains": [
          {
            "id": 50312,
            "name": "Somnia Testnet",
            "nativeCurrency": {
              "name": "STT",
              "symbol": "STT",
              "decimals": 18
            },
            "rpcUrls": {
              "default": {
                "http": ["https://dream-rpc.somnia.network"]
              }
            },
            "blockExplorers": {
              "default": {
                "name": "Somnia Explorer",
                "url": "https://dream-rpc.somnia.network"
              }
            }
          }
        ],
        "defaultChain": {
          "id": 50312,
          "name": "Somnia Testnet",
          "nativeCurrency": {
            "name": "STT",
            "symbol": "STT",
            "decimals": 18
          },
          "rpcUrls": {
            "default": {
              "http": ["https://dream-rpc.somnia.network"]
            }
          },
          "blockExplorers": {
            "default": {
              "name": "Somnia Explorer",
              "url": "https://dream-rpc.somnia.network"
            }
          }
        }
      }}
    >
      <PrivyAuthProvider>
      <Router>
      <Suspense fallback={<LoadingSpinner />}>
      <Routes>
      <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/pdfToQuiz" element={<PdfToQuiz />} />
      <Route path="/promptToQuiz" element={<PromptToQuiz />} />
      <Route path="/urlToQuiz" element={<URLToQuiz />} />
      <Route path="/videoToQuiz" element={<VideoToQuiz />} />
      <Route path="/quiz/:id" element={<Quiz />} />
      <Route path="/leaderboards/:id" element={<LeaderBoards />} />
      <Route
      path="/fact-check-leaderboards/:id"
      element={<FactCheckLeaderboards />}
      />
      <Route path="/typing" element={<Typing />} />
      <Route path="/memoryChallenge" element={<MemoryChallenge />} />
      <Route path="/fact-check" element={<FactCheckingGame />} />
      <Route path="/fact-check/:id" element={<FactCheck />} />
      <Route path="/quiz-options" element={<QuizOptions />} />
      <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="/500" element={<ServerError />} />
      <Route path="*" element={<BrokenLink />} />
      </Routes>
      </Suspense>
      </Router>
      </PrivyAuthProvider>
    </PrivyProvider>
  );
};

export default App;
