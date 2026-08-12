import { createElement, type ReactNode } from 'react';

export const EMOTICONS = [
  { id: '11', label: '님다 이모티콘11' },
  { id: '12', label: '님다 이모티콘12' },
  { id: '13', label: '님다 이모티콘13' },
  { id: '21', label: '님다 이모티콘21' },
  { id: '22', label: '님다 이모티콘22' },
  { id: '23', label: '님다 이모티콘23' },
  { id: '31', label: '님다 이모티콘31' },
  { id: '32', label: '님다 이모티콘32' },
  { id: '33', label: '님다 이모티콘33' },
  { id: '34', label: '님다 이모티콘34' },
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
  '34': 10,
};

export function getEmoticonSrc(id: string): string {
  const index = EMOTICON_INDEX_MAP[id] || 1;
  return `/NIMDA_Emoji/emoji_${index}.png`;
}

const EMOTICON_REGEX = /\[nimda:(\d{2})\]/g;
const VALID_IDS = new Set<string>(EMOTICONS.map((emoticon) => emoticon.id));

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
        createElement('img', {
          key: `emoticon-${match.index}`,
          src: getEmoticonSrc(id),
          alt: `님다 이모티콘${id}`,
          className: 'comment-emoticon-inline',
        })
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
