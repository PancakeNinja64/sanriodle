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
  const isColorNear = (guessColor, targetPrimary, targetSecondary) =>
    guessColor !== targetPrimary && guessColor === targetSecondary;

  return {
    name: exact("name") ? "exact" : "wrong",
    gender: exact("gender") ? "exact" : "wrong",
    species: exact("species") ? "exact" : "wrong",
    primaryColor: exact("primaryColor")
      ? "exact"
      : isColorNear(guess.primaryColor, target.primaryColor, target.secondaryColor)
        ? "near"
        : "wrong",
    secondaryColor: exact("secondaryColor")
      ? "exact"
      : isColorNear(guess.secondaryColor, target.secondaryColor, target.primaryColor)
        ? "near"
        : "wrong",
    franchiseGroup: exact("franchiseGroup") ? "exact" : "wrong",
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

function MobileCompactTile({ label, value, tone, hint, className = "" }) {
  return (
    <div className={`rounded-xl border px-2.5 py-2 min-h-[62px] ${tone} ${className}`}>
      <p className="text-[10px] uppercase tracking-wide opacity-80 leading-none">{label}</p>
      <p className="mt-1 text-xs font-semibold leading-tight">
        {value}
        {hint ? <span className="ml-1 text-[10px] font-medium">{hint}</span> : null}
      </p>
    </div>
  );
}

function MobileGuessRow({ entry }) {
  return (
    <article className="grid grid-cols-[minmax(170px,2fr)_minmax(92px,1fr)_minmax(96px,1fr)_minmax(108px,1fr)_minmax(96px,1fr)_minmax(116px,1.1fr)] gap-2 animate-fade-in">
      <div className={`rounded-xl border px-2.5 py-2 min-h-[62px] ${toneClass(entry.result.name)}`}>
        <p className="text-[10px] uppercase tracking-wide opacity-80 leading-none">Character</p>
        <div className="mt-1 flex items-center gap-2">
          <ImageThumb src={entry.character.image} alt={entry.character.name} size="sm" />
          <p className="text-xs font-semibold leading-tight truncate">{entry.character.name}</p>
        </div>
      </div>

      <MobileCompactTile label="Gender" value={toDisplayLabel(entry.character.gender)} tone={toneClass(entry.result.gender)} />
      <MobileCompactTile label="Species" value={toDisplayLabel(entry.character.species)} tone={toneClass(entry.result.species)} />
      <MobileCompactTile
        label="Primary Color"
        value={toDisplayLabel(entry.character.primaryColor)}
        tone={toneClass(entry.result.primaryColor)}
      />
      <MobileCompactTile
        label="Secondary Color"
        value={toDisplayLabel(entry.character.secondaryColor)}
        tone={toneClass(entry.result.secondaryColor)}
      />
      <MobileCompactTile
        label="Franchise"
        value={toDisplayLabel(entry.character.franchiseGroup)}
        tone={toneClass(entry.result.franchiseGroup)}
      />
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

        <section className="rounded-3xl bg-lavender/40 border border-white p-3 md:p-5 shadow-soft mb-4 md:mb-6">
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
                className="w-full rounded-2xl border border-rose-200 bg-white pl-4 pr-24 md:pr-32 py-2.5 md:py-3 text-sm md:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              <button
                type="button"
                onClick={() => submitGuess(inputValue)}
                disabled={gameOver}
                className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 rounded-full bg-rose-400 text-black px-2.5 md:px-4 py-1.5 text-xs md:text-sm font-bold shadow-sm hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed"
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

          <div className="mt-2 md:mt-3 flex flex-col sm:flex-row gap-2 md:gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="rounded-full px-4 md:px-5 py-2 text-sm md:text-base font-medium bg-white/85 text-rose-500 border border-rose-200 hover:bg-rose-50 transition-colors self-start"
            >
              Back Home
            </button>
          </div>
          {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
        </section>

        <section className="md:hidden rounded-3xl border border-white bg-white/75 shadow-soft p-2.5">
          <div className="overflow-x-auto hide-scrollbar pb-1">
            <div className="min-w-[710px] space-y-2">
            {guesses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-rose-200 bg-cream px-4 py-6 text-center text-sm text-rose-500">
                Your guess history will appear here. Start with your cutest guess!
              </div>
            ) : (
              guesses.map((entry, index) => (
                <MobileGuessRow key={`${entry.character.id}-${index}`} entry={entry} />
              ))
            )}
            </div>
          </div>
        </section>

        <section className="hidden md:block overflow-x-auto rounded-3xl border border-white bg-white/80 shadow-soft p-2.5 sm:p-4">
          <div className="min-w-[690px] sm:min-w-[760px] grid grid-cols-6 gap-1.5 sm:gap-2 mb-2 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-rose-500">
            <div className="px-2">Character</div>
            <div className="px-2">Gender</div>
            <div className="px-2">Species</div>
            <div className="px-2">Primary Color</div>
            <div className="px-2">Secondary Color</div>
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
                  <div className={`${cellBase} ${toneClass(entry.result.primaryColor)}`}>
                    {toDisplayLabel(entry.character.primaryColor)}
                  </div>
                  <div className={`${cellBase} ${toneClass(entry.result.secondaryColor)}`}>
                    {toDisplayLabel(entry.character.secondaryColor)}
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
              <p>Mint means exact match, peach means close color match, rosy means incorrect.</p>
              <p>Use gender, species, primary color, secondary color, and franchise clues to narrow it down.</p>
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
                <p className="text-sm text-rose-600">
                  {toDisplayLabel(target.species)} • {toDisplayLabel(target.primaryColor)}
                </p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </main>
  );
}
