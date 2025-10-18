import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { PrivyProvider } from '@privy-io/react-auth';
import PrivyAuthProvider from "./context/PrivyAuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

const Layout = lazy(() => import("./components/Layout"));
const Home = lazy(() => import("./pages/Home"));
const QuizCreation = lazy(() => import("./pages/QuizCreation"));
const FactCheckCreation = lazy(() => import("./pages/FactCheckCreation"));
const FactCheckOptions = lazy(() => import("./pages/FactCheckOptions"));
const LeaderBoards = lazy(() => import("./pages/LeaderBoards"));
const Quiz = lazy(() => import("./pages/Quiz"));
const QuizOptions = lazy(() => import("./pages/QuizOptions"));
const BrokenLink = lazy(() => import("./pages/BrokenLink"));
const ServerError = lazy(() => import("./pages/ServerError"));
const FactCheck = lazy(() => import("./pages/FactCheck"));
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
      <ErrorBoundary>
        <PrivyAuthProvider>
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/quiz-creation/:type" element={
                    <ErrorBoundary>
                      <QuizCreation />
                    </ErrorBoundary>
                  } />
                  <Route path="/fact-check-creation/:type" element={
                    <ErrorBoundary>
                      <FactCheckCreation />
                    </ErrorBoundary>
                  } />
                  <Route path="/quiz/:id" element={
                    <ErrorBoundary>
                      <Quiz />
                    </ErrorBoundary>
                  } />
                  <Route path="/leaderboards/:id" element={
                    <ErrorBoundary>
                      <LeaderBoards />
                    </ErrorBoundary>
                  } />
                  <Route path="/fact-check-leaderboards/:id" element={
                    <ErrorBoundary>
                      <FactCheckLeaderboards />
                    </ErrorBoundary>
                  } />
                  <Route path="/fact-check-options" element={<FactCheckOptions />} />
                  <Route path="/fact-check/:id" element={
                    <ErrorBoundary>
                      <FactCheck />
                    </ErrorBoundary>
                  } />
                  <Route path="/quiz-options" element={<QuizOptions />} />
                  <Route path="/profile" element={
                    <ErrorBoundary>
                      <Profile />
                    </ErrorBoundary>
                  } />
                  <Route path="/500" element={<ServerError />} />
                  <Route path="*" element={<BrokenLink />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </PrivyAuthProvider>
      </ErrorBoundary>
    </PrivyProvider>
  );
};

export default App;
