import { useState } from "react";
import CountdownTimer from "./CountdownTimer";
import Modal from "./Modal";

function formatToday(dateKey) {
  const [year, month, day] = dateKey.split("-").map((value) => Number(value));
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function HomePage({ dateKey, onPlay }) {
  const [showCredits, setShowCredits] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-cream to-sky px-4 py-10 font-cute text-rose-900">
      <div className="mx-auto max-w-xl">
        <section className="rounded-[2rem] border border-white/90 bg-white/75 p-6 sm:p-8 text-center shadow-soft backdrop-blur">
          <p className="text-sm text-rose-500">{String.fromCodePoint(0x2728)} a new character every day {String.fromCodePoint(0x2728)}</p>
          <h1 className="mt-2 text-5xl sm:text-6xl font-black tracking-tight text-rose-500">Sanriodle</h1>
          <p className="mt-3 text-base sm:text-lg text-rose-700 font-semibold">Guess today&apos;s Sanriodle!</p>
          <p className="mt-2 text-sm sm:text-base text-rose-700">
            Sanriodle is a daily guessing game where you try to find the hidden Sanrio character.
          </p>
          <p className="mt-2 text-sm text-rose-600 leading-relaxed">
            How to Play: Enter a character guess, then use each row of hints for species, color, franchise, and year
            direction to narrow down the answer.
          </p>

          <div className="mt-5 rounded-3xl border border-rose-100 bg-lavender/50 px-4 py-3">
            <p className="text-sm text-rose-600">{formatToday(dateKey)}</p>
            <div className="mt-1">
              <CountdownTimer />
            </div>
          </div>

          <button
            type="button"
            onClick={onPlay}
            className="mt-6 w-full rounded-full bg-rose-400 px-6 py-3 text-base font-semibold text-black shadow-soft transition-colors hover:bg-rose-500"
          >
            Play Classic
          </button>

          <button
            type="button"
            onClick={() => setShowCredits(true)}
            className="mt-3 text-sm text-rose-500 hover:text-rose-600 underline decoration-rose-300 underline-offset-4"
          >
            Credits & Disclaimer
          </button>
        </section>
      </div>

      {showCredits && (
        <Modal title="Credits & Disclaimer" onClose={() => setShowCredits(false)}>
          <div className="space-y-3 text-sm text-rose-700 leading-relaxed">
            {}
            <p className="rounded-2xl bg-lavender/40 border border-rose-100 p-4">

              Sanriodle is a fan-made project created for entertainment purposes only.

              All Sanrio characters, names, and related assets are © 2026 SANRIO CO., LTD. and their respective owners.

              This project is not affiliated with, endorsed by, or sponsored by Sanrio.

              Character images and likenesses are used under fair use for non-commercial, fan-based purposes.

              If you are a rights holder and would like any content removed or modified, please contact us.

            </p>
          </div>
        </Modal>
      )}
    </main>
  );
}
