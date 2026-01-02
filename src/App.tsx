import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { GameScreen } from "./components/game/GameScreen";
import { HomeScreen } from "./components/home/HomeScreen";
import { PlayerSetup } from "./components/setup/PlayerSetup";
import { useGameStore } from "./store/useGameStore";

function GameOrchestrator() {
    const { phase } = useGameStore();

    // If in HOME phase, show Home.
    if (phase === "HOME") {
        return <HomeScreen />;
    }

    // If in SETUP phase, show Setup.
    if (phase === "SETUP") {
        return <PlayerSetup />;
    }

    // Otherwise show Game Screen
    return <GameScreen />;
}

function App() {
    return (
        <BrowserRouter>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <div style={{ flex: 1 }}>
                    <Routes>
                        <Route path="/" element={<GameOrchestrator />} />
                        {/* Fallback to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;

