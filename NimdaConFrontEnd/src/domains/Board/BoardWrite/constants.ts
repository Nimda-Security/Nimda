import type { Config as DOMPurifyConfig } from 'dompurify';

// ── Code-language options ──
export const CODE_LANGUAGE_OPTIONS = [
  { label: 'Plain text', value: 'plaintext' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'Python', value: 'python' },
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
];

export const getCodeLanguageLabel = (language: string) =>
  CODE_LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ||
  language.toUpperCase();

// ── Color palette ──
export const COLOR_PALETTE = [
  '#0C0C0C',
  '#A3A3A3',
  '#D64454',
  '#E17654',
  '#E8B446',
  '#5CB85C',
  '#5BC0DE',
  '#4A7FCC',
  '#8B6BB7',
  '#D97399',
];
export const MAX_RECENT_COLORS = 5;

// ── Font size ──
export const MAX_FONT_SIZE_PX = 24;

export const FONT_SIZE_OPTIONS = [
  { label: '작게', value: '12px' },
  { label: '보통', value: '14px' },
  { label: '조금 크게', value: '16px' },
  { label: '크게', value: '20px' },
  { label: '아주 크게', value: '28px' },
];

// ── DOMPurify config ──
export const EDITOR_PURIFY_CONFIG: DOMPurifyConfig = {
  ALLOWED_TAGS: [
    'p', 'div', 'span', 'br',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'u', 's', 'b', 'i', 'strike', 'del', 'ins',
    'ul', 'ol', 'li',
    'a', 'img',
    'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'hr', 'blockquote',
    'select', 'option', 'button',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'style', 'class',
    'target', 'rel',
    'width', 'height',
    'data-language', 'data-language-label', 'data-code-empty', 'data-empty',
    'data-emoticon-id',
    'dir', 'type', 'value', 'title', 'aria-label', 'contenteditable',
  ],
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: false,
};

// ── Types ──
export type ColorPickerTab = 'palette' | 'custom';

export type EyeDropperApi = {
  open: () => Promise<{ sRGBHex: string }>;
};

export type ImageResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

export type ImageResizeSession = {
  handle: ImageResizeHandle;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
  aspectRatio: number;
};

// ── Misc helpers ──
export const formatFileSize = (bytes: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};
