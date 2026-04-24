import { useEffect, useState } from "react";
import { formatCountdown, getSecondsUntilMidnight } from "../utils/dailyPuzzle";

export default function CountdownTimer() {
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(getSecondsUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className="text-sm text-rose-700">
      Next puzzle in <span className="font-extrabold text-rose-500">{formatCountdown(secondsLeft)}</span>
    </p>
  );
}
