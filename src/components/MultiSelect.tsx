import { SetStateAction, useEffect, useRef, useState } from "react";

export default function MultiSelectWork({
  selectedFloorTypes,
  setSelectedFloorTypes,
  optionsData,
  placeholder,
}: {
  selectedFloorTypes: String[];
  setSelectedFloorTypes: React.Dispatch<SetStateAction<String[]>>;
  optionsData: any;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleSelect = (work: String) => {
    if (selectedFloorTypes.includes(work)) {
      setSelectedFloorTypes(selectedFloorTypes.filter((w) => w !== work));
    } else {
      setSelectedFloorTypes([...selectedFloorTypes, work]);
    }
  };

  // ✅ Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input Box */}
      <div
        onClick={() => setOpen(!open)}
        className="min-h-[45px] flex items-center gap-2 px-3 py-2 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 focus-within:border-[#C62828] overflow-x-auto scrollbar-extrathin"
      >
        {selectedFloorTypes.length === 0 && (
          <span className="text-gray-400 text-sm">
            {placeholder || "Select Work Categories"}
          </span>
        )}

        {selectedFloorTypes.map((type, indx) => (
          <span
            key={indx}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-[#C62828]/10 text-[#C62828] rounded-full whitespace-nowrap"
          >
            {type}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSelect(type);
              }}
              className="text-[#C62828] font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg">
          {optionsData.map((work: any) => (
            <div
              key={work}
              onClick={() => toggleSelect(work)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedFloorTypes.includes(work)}
                readOnly
                className="accent-[#C62828]"
              />
              <span className="text-sm">{work}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
