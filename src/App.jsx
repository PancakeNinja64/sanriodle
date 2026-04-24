import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import GamePage from "./components/GamePage";
import HomePage from "./components/HomePage";
import { characters } from "./data/characters.ts";
import { getDateKey, selectDailyCharacter } from "./utils/dailyPuzzle";
import { loadDailyGameStorage, saveDailyGameStorage } from "./utils/storage";

export default function App() {
  const navigate = useNavigate();
  const [dateKey, setDateKey] = useState(() => getDateKey());
  const [gameState, setGameState] = useState(() => {
    const today = getDateKey();
    const stored = loadDailyGameStorage();
    if (stored && stored.dateKey === today) {
      return stored;
    }
    const fresh = { dateKey: today, guessedCharacterIds: [], status: "playing" };
    saveDailyGameStorage(fresh);
    return fresh;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const today = getDateKey();
      setDateKey((prev) => {
        if (prev === today) return prev;
        const nextState = { dateKey: today, guessedCharacterIds: [], status: "playing" };
        setGameState(nextState);
        saveDailyGameStorage(nextState);
        navigate("/");
        return today;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const target = useMemo(() => selectDailyCharacter(dateKey, characters), [dateKey]);

  const handleStateChange = (guessedCharacterIds, status) => {
    const nextState = { dateKey, guessedCharacterIds, status };
    setGameState(nextState);
    saveDailyGameStorage(nextState);
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage dateKey={dateKey} onPlay={() => navigate("/play")} />} />
      <Route
        path="/play"
        element={
          <GamePage
            target={target}
            initialGuessIds={gameState.guessedCharacterIds}
            initialStatus={gameState.status}
            onStateChange={handleStateChange}
            onBackHome={() => navigate("/")}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
