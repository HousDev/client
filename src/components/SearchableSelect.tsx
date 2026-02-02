import { useEffect, useRef, useState } from "react";

type Option = { id: string; name: string } | string;

/* ------------------ SearchableSelect component (inline) ------------------ */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  required = false,
  disabled = false,
  id,
}: {
  options: Option[];
  value: string | number;
  onChange: (id: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Normalize options to {id,name}
  const normalized = options.map((opt) =>
    typeof opt === "string" ? { id: opt, name: opt } : opt,
  );

  const selected = normalized.find((o) => o.id === value) || null;

  const filtered = normalized.filter((o) =>
    o.name.toLowerCase().includes(filter.toLowerCase()),
  );

  useEffect(() => {
    if (!open) setFilter("");
    setHighlight(0);
  }, [open]);

  // close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h: any) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h: any) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) {
        onChange(opt.id);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`w-full flex items-center gap-2 px-3 py-3 ${disabled ? "border" : "border border-slate-400"} rounded-lg bg-white cursor-pointer ${
          disabled ? "opacity-90 cursor-not-allowed" : "hover:shadow-sm"
        }`}
        onClick={() => !disabled && setOpen((s: any) => !s)}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        id={id}
      >
        <div className="flex-1 text-left">
          {selected ? (
            <div className="text-sm text-gray-800">{selected.name}</div>
          ) : (
            <div className="text-sm text-gray-400">{placeholder}</div>
          )}
        </div>
        <div>
          <svg
            className={`w-4 h-4 transform transition ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.585l3.71-3.396a.75.75 0 111.02 1.1l-4.185 3.833a.75.75 0 01-1.02 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
          </svg>
        </div>
      </div>

      {/* dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* search input */}
          <div className="p-2">
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search..."
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <ul
            role="listbox"
            aria-labelledby={id}
            className="max-h-60 overflow-y-auto divide-y divide-gray-100"
          >
            {filtered.length === 0 ? (
              <li className="p-3 text-sm text-gray-500">No results</li>
            ) : (
              filtered.map((opt, idx) => (
                <li
                  key={opt.id}
                  role="option"
                  aria-selected={opt.id === value}
                  className={`px-3 py-2 cursor-pointer text-sm ${
                    idx === highlight ? "bg-blue-50" : "hover:bg-gray-50"
                  } ${
                    opt.id === value
                      ? "font-medium text-gray-800"
                      : "text-gray-700"
                  }`}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                >
                  {opt.name}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {/* hidden input to keep form semantics if you want to submit native form */}
      <input type="hidden" value={value} />
    </div>
  );
}
