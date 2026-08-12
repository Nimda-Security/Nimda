import { useState, useRef, useEffect } from 'react';
import { EMOTICONS, getEmoticonSrc } from './emoticonUtils';

interface EmoticonPickerProps {
  onSelect: (marker: string) => void;
}

export default function EmoticonPicker({ onSelect }: EmoticonPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (id: string) => {
    onSelect(`[nimda:${id}]`);
    setOpen(false);
  };

  return (
    <div className="emoticon-picker" ref={containerRef}>
      <button
        type="button"
        className="emoticon-picker__trigger"
        aria-label="이모티콘"
        aria-haspopup="true"
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="9" cy="10" r="1.25" fill="currentColor" />
          <circle cx="15" cy="10" r="1.25" fill="currentColor" />
          <path
            d="M8.5 14.5C9.1 15.9 10.4 16.5 12 16.5C13.6 16.5 14.9 15.9 15.5 14.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="emoticon-picker__panel">
          <div className="emoticon-picker__grid">
            {EMOTICONS.map((e) => (
              <button
                key={e.id}
                type="button"
                className="emoticon-picker__item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(e.id)}
                title={e.label}
              >
                <img src={getEmoticonSrc(e.id)} alt={e.label} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
