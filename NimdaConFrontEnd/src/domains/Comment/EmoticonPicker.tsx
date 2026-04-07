import { useState, useRef, useEffect, type ReactNode } from 'react';

const EMOTICONS = [
  { id: '11', label: '님다 이모티콘11' },
  { id: '12', label: '님다 이모티콘12' },
  { id: '13', label: '님다 이모티콘13' },
  { id: '21', label: '님다 이모티콘21' },
  { id: '22', label: '님다 이모티콘22' },
  { id: '23', label: '님다 이모티콘23' },
  { id: '31', label: '님다 이모티콘31' },
  { id: '32', label: '님다 이모티콘32' },
  { id: '33', label: '님다 이모티콘33' },
] as const;

const EMOTICON_INDEX_MAP: Record<string, number> = {
  '11': 1,
  '12': 2,
  '13': 3,
  '21': 4,
  '22': 5,
  '23': 6,
  '31': 7,
  '32': 8,
  '33': 9,
};

export function getEmoticonSrc(id: string): string {
  const index = EMOTICON_INDEX_MAP[id] || 1;
  return `/NIMDA_Emoji/emoji_${index}.png`;
}

/** 이모티콘 마커 정규식: [nimda:11] 형태 */
export const EMOTICON_REGEX = /\[nimda:(\d{2})\]/g;

const VALID_IDS = new Set<string>(EMOTICONS.map((e) => e.id));

/** 텍스트에서 이모티콘 마커를 파싱하여 React 노드 배열로 변환 */
export function parseEmoticons(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(EMOTICON_REGEX.source, 'g');

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const id = match[1];
    if (VALID_IDS.has(id)) {
      parts.push(
        <img
          key={`emoticon-${match.index}`}
          src={getEmoticonSrc(id)}
          alt={`님다 이모티콘${id}`}
          className="comment-emoticon-inline"
        />
      );
    } else {
      parts.push(match[0]);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

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
