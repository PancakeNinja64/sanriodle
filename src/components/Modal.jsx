import { useEffect, useRef } from "react";

export default function Modal({ title, onClose, children, maxWidthClass = "max-w-lg" }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-rose-900/25 backdrop-blur-sm p-4 grid place-items-center"
      onMouseDown={(event) => {
        if (!panelRef.current?.contains(event.target)) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={`w-full ${maxWidthClass} rounded-3xl border border-white/90 bg-white/95 shadow-soft p-5 sm:p-6`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl sm:text-2xl font-black text-rose-500">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="h-8 w-8 rounded-full border border-rose-200 bg-rose-50 text-rose-500 text-lg leading-none hover:bg-rose-100"
          >
            ×
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
