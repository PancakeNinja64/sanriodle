import { useEffect, useMemo, useRef, useState } from "react";
import { characters } from "../data/characters.ts";
import Modal from "./Modal";

const MAX_GUESSES = 8;

const cellBase =
  "rounded-2xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm border shadow-sm min-h-14 flex items-center justify-center text-center";

function ImageThumb({ src, alt, size = "md" }) {
  const [failed, setFailed] = useState(false);
  const dimensions = size === "sm" ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10 sm:h-11 sm:w-11";

  if (!src || failed) {
    return (
      <div
        className={`${dimensions} shrink-0 rounded-2xl border border-rose-200/70 bg-gradient-to-br from-cream via-rose-50 to-lavender grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]`}
      >
        <span role="img" aria-label="missing character icon" className="text-base sm:text-lg">
          {String.fromCodePoint(0x1f497)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`${dimensions} shrink-0 rounded-2xl border border-white/80 object-cover bg-white ring-2 ring-white/60 shadow-sm`}
    />
  );
}

function compareGuess(guess, target) {
  const exact = (field) => guess[field] === target[field];
  const releaseDiff = guess.releaseYear - target.releaseYear;

  return {
    name: exact("name") ? "exact" : "wrong",
    gender: exact("gender") ? "exact" : "wrong",
    species: exact("species") ? "exact" : "wrong",
    signatureColor: exact("signatureColor") ? "exact" : "wrong",
    franchiseGroup: exact("franchiseGroup") ? "exact" : "wrong",
    releaseYear: releaseDiff === 0 ? "exact" : Math.abs(releaseDiff) <= 5 ? "near" : "wrong",
    releaseHint: releaseDiff === 0 ? "match" : releaseDiff > 0 ? "newer" : "older",
  };
}

function toneClass(state) {
  if (state === "exact") return "bg-mint border-emerald-300 text-emerald-900";
  if (state === "near") return "bg-peach border-amber-200 text-amber-900";
  return "bg-rose-50 border-rose-200 text-rose-700";
}

function toDisplayLabel(value) {
  if (typeof value !== "string") return value;
  return value
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function MobileAttributePill({ label, value, tone, hint }) {
  return (
    <div className={`rounded-2xl border px-3 py-2 ${tone}`}>
      <p className="text-[11px] uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-sm font-semibold leading-tight">
        {value}
        {hint ? <span className="ml-1 text-xs font-medium">{hint}</span> : null}
      </p>
    </div>
  );
}

function MobileGuessCard({ entry }) {
  return (
    <article className="rounded-3xl border border-white bg-white/80 shadow-soft p-3.5 animate-fade-in">
      <div className={`rounded-2xl border px-3 py-2.5 mb-3 flex items-center gap-2.5 ${toneClass(entry.result.name)}`}>
        <ImageThumb src={entry.character.image} alt={entry.character.name} size="sm" />
        <p className="font-semibold text-sm leading-tight">{entry.character.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <MobileAttributePill
          label="Gender"
          value={toDisplayLabel(entry.character.gender)}
          tone={toneClass(entry.result.gender)}
        />
        <MobileAttributePill
          label="Species"
          value={toDisplayLabel(entry.character.species)}
          tone={toneClass(entry.result.species)}
        />
        <MobileAttributePill
          label="Release Year"
          value={entry.character.releaseYear}
          hint={entry.result.releaseHint === "match" ? "" : entry.result.releaseHint === "older" ? "\u2191 newer" : "\u2193 older"}
          tone={toneClass(entry.result.releaseYear)}
        />
        <MobileAttributePill
          label="Color"
          value={toDisplayLabel(entry.character.signatureColor)}
          tone={toneClass(entry.result.signatureColor)}
        />
      </div>

      <div className="mt-2.5">
        <MobileAttributePill
          label="Franchise"
          value={toDisplayLabel(entry.character.franchiseGroup)}
          tone={toneClass(entry.result.franchiseGroup)}
        />
      </div>
    </article>
  );
}

export default function GamePage({ target, initialGuessIds, initialStatus, onStateChange, onBackHome }) {
  const [inputValue, setInputValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [error, setError] = useState("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLossModal, setShowLossModal] = useState(false);

  const inputRef = useRef(null);
  const searchAreaRef = useRef(null);

  const initialGuesses = useMemo(
    () =>
      initialGuessIds
        .map((id) => characters.find((character) => character.id === id))
        .filter(Boolean)
        .map((character) => ({
          character,
          result: compareGuess(character, target),
        })),
    [initialGuessIds, target]
  );

  const [guesses, setGuesses] = useState(initialGuesses);

  useEffect(() => {
    setGuesses(initialGuesses);
  }, [initialGuesses]);

  const guessedIds = useMemo(() => new Set(guesses.map((entry) => entry.character.id)), [guesses]);

  const filteredSuggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return [];
    return characters
      .filter((character) => character.name.toLowerCase().includes(query) && !guessedIds.has(character.id))
      .slice(0, 8);
  }, [inputValue, guessedIds]);

  const gameWon = initialStatus === "won" || guesses.some((guess) => guess.character.id === target.id);
  const gameLost = initialStatus === "lost" || (!gameWon && guesses.length >= MAX_GUESSES);
  const gameOver = gameWon || gameLost;
  const hasTypedQuery = inputValue.trim().length > 0;

  useEffect(() => {
    const onPointerDownOutside = (event) => {
      if (!searchAreaRef.current?.contains(event.target)) {
        setOpenDropdown(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onPointerDownOutside);
    return () => document.removeEventListener("mousedown", onPointerDownOutside);
  }, []);

  useEffect(() => {
    if (gameWon) {
      setShowWinModal(true);
    }
  }, [gameWon]);

  useEffect(() => {
    if (gameLost) {
      setShowLossModal(true);
    }
  }, [gameLost]);

  const handleSelect = (character) => {
    setInputValue(character.name);
    setOpenDropdown(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const submitGuess = (rawName) => {
    if (gameOver) return;
    const guessName = rawName.trim().toLowerCase();
    if (!guessName) {
      setError("Please type a character name first.");
      return;
    }

    const selectedCharacter = characters.find((c) => c.name.toLowerCase() === guessName);
    if (!selectedCharacter) {
      setError("That character is not in this roster.");
      return;
    }
    if (guessedIds.has(selectedCharacter.id)) {
      setError("You already guessed that character.");
      return;
    }

    const nextGuesses = [
      ...guesses,
      { character: selectedCharacter, result: compareGuess(selectedCharacter, target) },
    ];
    const nextGuessIds = nextGuesses.map((entry) => entry.character.id);
    const nextStatus =
      selectedCharacter.id === target.id ? "won" : nextGuesses.length >= MAX_GUESSES ? "lost" : "playing";

    setGuesses(nextGuesses);
    onStateChange(nextGuessIds, nextStatus);
    setInputValue("");
    setOpenDropdown(false);
    setActiveIndex(-1);
    setError("");
  };

  const onInputKeyDown = (event) => {
    if (!openDropdown && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      if (!hasTypedQuery) return;
      setOpenDropdown(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filteredSuggestions.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
        submitGuess(filteredSuggestions[activeIndex].name);
      } else {
        submitGuess(inputValue);
      }
    }
    if (event.key === "Escape") {
      setOpenDropdown(false);
      setActiveIndex(-1);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-cream to-sky py-6 px-4 font-cute text-rose-900">
      <div className="mx-auto max-w-5xl">
        <header className="text-center mb-5">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-rose-500 drop-shadow-sm">Sanriodle</h1>
          <p className="text-sm sm:text-base mt-2 text-rose-700">Guess today&apos;s character in {MAX_GUESSES} tries.</p>
          <button
            type="button"
            onClick={() => setShowHowToPlay(true)}
            className="mt-3 text-sm text-rose-500 hover:text-rose-600 underline decoration-rose-300 underline-offset-4"
          >
            How to Play
          </button>
        </header>

        <section className="rounded-3xl bg-lavender/40 border border-white p-4 sm:p-5 shadow-soft mb-6">
          <div className="relative" ref={searchAreaRef}>
            <label htmlFor="guess-input" className="block text-sm font-semibold mb-2">
              Choose your guess
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="guess-input"
                type="text"
                value={inputValue}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setInputValue(nextValue);
                  setOpenDropdown(nextValue.trim().length > 0);
                  setActiveIndex(-1);
                  if (error) setError("");
                }}
                onFocus={() => setOpenDropdown(inputValue.trim().length > 0)}
                onKeyDown={onInputKeyDown}
                placeholder="Type a character name..."
                className="w-full rounded-2xl border border-rose-200 bg-white pl-4 pr-24 sm:pr-32 py-3 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              <button
                type="button"
                onClick={() => submitGuess(inputValue)}
                disabled={gameOver}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-rose-400 text-black px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold shadow-sm hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>

            {openDropdown && !gameOver && hasTypedQuery && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-b from-white to-rose-50/60 shadow-[0_18px_45px_rgba(255,167,206,0.3)] backdrop-blur-sm">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((character, idx) => (
                    <button
                      type="button"
                      key={character.id}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelect(character)}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3 text-left transition-all duration-150 border-b border-rose-100/40 last:border-b-0 ${
                        activeIndex === idx
                          ? "bg-gradient-to-r from-lavender/70 via-sky/30 to-mint/50"
                          : "hover:bg-white/80"
                      }`}
                    >
                      <ImageThumb src={character.image} alt={character.name} size="sm" />
                      <p className="min-w-0 text-sm sm:text-base font-semibold text-rose-700 truncate">{character.name}</p>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-rose-500 bg-white/80">No matching characters. Try another name.</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="rounded-full px-5 py-2.5 font-semibold bg-white text-rose-500 border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              Back Home
            </button>
          </div>
          {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
        </section>

        <section className="md:hidden space-y-3">
          <div className="rounded-3xl border border-white bg-white/70 shadow-soft p-3">
            {guesses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-rose-200 bg-cream px-4 py-6 text-center text-sm text-rose-500">
                Your guess history will appear here. Start with your cutest guess!
              </div>
            ) : (
              guesses.map((entry, index) => (
                <MobileGuessCard key={`${entry.character.id}-${index}`} entry={entry} />
              ))
            )}
          </div>
        </section>

        <section className="hidden md:block overflow-x-auto rounded-3xl border border-white bg-white/80 shadow-soft p-2.5 sm:p-4">
          <div className="min-w-[690px] sm:min-w-[760px] grid grid-cols-6 gap-1.5 sm:gap-2 mb-2 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-rose-500">
            <div className="px-2">Character</div>
            <div className="px-2">Gender</div>
            <div className="px-2">Species</div>
            <div className="px-2">Release Year</div>
            <div className="px-2">Color</div>
            <div className="px-2">Franchise</div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            {guesses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-rose-200 bg-cream px-4 py-6 text-center text-sm text-rose-500">
                Your guess history will appear here. Start with your cutest guess!
              </div>
            ) : (
              guesses.map((entry, index) => (
                <div
                  key={`${entry.character.id}-${index}`}
                  className="grid grid-cols-6 gap-1.5 sm:gap-2 animate-fade-in"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className={`${cellBase} ${toneClass(entry.result.name)} justify-start gap-2 sm:gap-2.5`}>
                    <ImageThumb src={entry.character.image} alt={entry.character.name} size="sm" />
                    <span className="font-semibold text-left leading-tight truncate">{entry.character.name}</span>
                  </div>
                  <div className={`${cellBase} ${toneClass(entry.result.gender)}`}>{toDisplayLabel(entry.character.gender)}</div>
                  <div className={`${cellBase} ${toneClass(entry.result.species)}`}>{toDisplayLabel(entry.character.species)}</div>
                  <div className={`${cellBase} ${toneClass(entry.result.releaseYear)}`}>
                    <span className="font-semibold">{entry.character.releaseYear}</span>
                    {entry.result.releaseHint !== "match" ? (
                      <span className="ml-1 text-xs">{entry.result.releaseHint === "older" ? "\u2191 newer" : "\u2193 older"}</span>
                    ) : null}
                  </div>
                  <div className={`${cellBase} ${toneClass(entry.result.signatureColor)}`}>
                    {toDisplayLabel(entry.character.signatureColor)}
                  </div>
                  <div className={`${cellBase} ${toneClass(entry.result.franchiseGroup)}`}>
                    {toDisplayLabel(entry.character.franchiseGroup)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {showHowToPlay && (
          <Modal title="How to Play" onClose={() => setShowHowToPlay(false)}>
            <div className="space-y-2 text-sm text-rose-700 leading-relaxed">
              <p>Guess the daily character in up to {MAX_GUESSES} tries.</p>
              <p>Mint means exact match, peach means near match (for year), rosy means incorrect.</p>
              <p>For release year hints: ↑ means the target is newer, ↓ means the target is older.</p>
            </div>
          </Modal>
        )}

        {showWinModal && (
          <Modal title="You got it!" onClose={() => setShowWinModal(false)} maxWidthClass="max-w-sm">
            <div className="text-center">
              <p className="text-2xl mb-2">{String.fromCodePoint(0x1f389)}</p>
              <p className="text-sm text-rose-700 mb-3">Today&apos;s character is:</p>
              <div className="flex items-center justify-center gap-3 mb-2">
                <ImageThumb src={target.image} alt={target.name} />
                <p className="font-bold text-rose-600">{target.name}</p>
              </div>
            </div>
          </Modal>
        )}

        {showLossModal && (
          <Modal title="Puzzle over!" onClose={() => setShowLossModal(false)} maxWidthClass="max-w-sm">
            <div className="text-center">
              <p className="text-2xl mb-2">{String.fromCodePoint(0x1f97a)}</p>
              <p className="text-sm text-rose-700 mb-3">
                Today&apos;s character was <span className="font-bold">{target.name}</span>.
              </p>
              <div className="flex items-center justify-center gap-3 mb-2">
                <ImageThumb src={target.image} alt={target.name} />
                <p className="text-sm text-rose-600">{toDisplayLabel(target.species)} • {target.releaseYear}</p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </main>
  );
}
