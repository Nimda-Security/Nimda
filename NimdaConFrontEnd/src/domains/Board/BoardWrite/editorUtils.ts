import DOMPurify from 'dompurify';
import { MAX_FONT_SIZE_PX, EDITOR_PURIFY_CONFIG } from './constants';

// ── Font-size normalisation ──

export const normalizeFontSizeValue = (size: string, fallbackPx = 14) => {
  const match = size
    .trim()
    .toLowerCase()
    .match(/^(-?\d+(?:\.\d+)?)(px|rem|em|%)?$/);
  if (!match) return `${fallbackPx}px`;

  const value = Number(match[1]);
  const unit = match[2] ?? 'px';
  if (!Number.isFinite(value) || value <= 0) return `${fallbackPx}px`;

  const basePx = 16;
  let px = value;
  if (unit === 'rem' || unit === 'em') px = value * basePx;
  if (unit === '%') px = (value / 100) * basePx;

  const clamped = Math.min(MAX_FONT_SIZE_PX, Math.max(1, Math.round(px)));
  return `${clamped}px`;
};

export const mapFontTagSizeToPx = (size: string | null) => {
  const parsed = Number(size ?? '');
  const map: Record<number, number> = {
    1: 10,
    2: 13,
    3: 16,
    4: 18,
    5: 24,
    6: 24,
    7: 24,
  };
  const px = Number.isFinite(parsed) ? (map[parsed] ?? 14) : 14;
  return `${px}px`;
};

// ── Span cleanup ──

export const flattenNestedFontSizeSpans = (root: ParentNode) => {
  const sizedSpans = root.querySelectorAll<HTMLSpanElement>('span[style]');
  sizedSpans.forEach((span) => {
    if (!span.style.fontSize) return;
    span.style.fontSize = normalizeFontSizeValue(span.style.fontSize);

    let parent = span.parentElement;
    while (parent && parent !== root) {
      if (!(parent instanceof HTMLSpanElement) || !parent.style.fontSize) {
        parent = parent.parentElement;
        continue;
      }

      const parentSize = normalizeFontSizeValue(parent.style.fontSize);
      const childSize = normalizeFontSizeValue(span.style.fontSize);
      if (parentSize === childSize) {
        span.style.removeProperty('font-size');
      }
      break;
    }
  });
};

export const pruneRedundantSpans = (root: ParentNode) => {
  const spans = root.querySelectorAll<HTMLSpanElement>('span');
  spans.forEach((span) => {
    if (span.hasAttribute('style') && span.style.cssText.trim().length === 0) {
      span.removeAttribute('style');
    }
    if (span.attributes.length === 0) {
      span.replaceWith(...Array.from(span.childNodes));
    }
  });
};

// ── DOM sanitisation ──

export const sanitizeEditorDom = (root: HTMLElement) => {
  const fonts = root.querySelectorAll<HTMLElement>('font[size]');
  fonts.forEach((font) => {
    const span = document.createElement('span');
    span.style.fontSize = mapFontTagSizeToPx(font.getAttribute('size'));
    span.innerHTML = font.innerHTML;
    font.replaceWith(span);
  });

  const styled = root.querySelectorAll<HTMLElement>('[style]');
  styled.forEach((element) => {
    if (!element.style.fontSize) return;
    const normalized = normalizeFontSizeValue(element.style.fontSize);
    element.style.setProperty('font-size', normalized, 'important');
  });

  flattenNestedFontSizeSpans(root);
  pruneRedundantSpans(root);
};

export const getSanitizedEditorHtml = (editor: HTMLElement) => {
  const clone = editor.cloneNode(true) as HTMLElement;

  clone
    .querySelectorAll('.bw-code-node__toolbar, .bw-resize-handle, .bw-image-resize-tooltip')
    .forEach((element) => element.remove());

  clone.querySelectorAll<HTMLElement>('.bw-code-node').forEach((wrapper) => {
    const pre = wrapper.querySelector('pre');
    if (pre) {
      wrapper.replaceWith(pre.cloneNode(true));
    }
  });

  clone.querySelectorAll<HTMLElement>('.bw-resize-container').forEach((wrapper) => {
    const img = wrapper.querySelector('img');
    if (img) {
      wrapper.replaceWith(img.cloneNode(true));
    }
  });

  clone.querySelectorAll<HTMLElement>('*').forEach((element) => {
    element.removeAttribute('contenteditable');
    element.removeAttribute('draggable');
    element.removeAttribute('data-node-view-wrapper');
    element.removeAttribute('data-node-view-content');
    element.removeAttribute('data-drag-handle');
    element.classList.remove('ProseMirror-selectednode');
  });

  sanitizeEditorDom(clone);
  // DOMPurify: script/iframe/이벤트 핸들러 제거
  return DOMPurify.sanitize(clone.innerHTML, EDITOR_PURIFY_CONFIG) as unknown as string;
};

// ── Caret / selection helpers ──

export const getClosestWithinEditor = (
  node: Node | null,
  editor: HTMLElement,
  selector: string
) => {
  let current: Node | null = node;
  while (current && current !== editor) {
    if (current instanceof HTMLElement && current.matches(selector)) {
      return current;
    }
    current = current.parentNode;
  }
  return null;
};

export const placeCaretAtNodeStart = (node: Node) => {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

// ── Editor empty-state helpers ──

export const isEditorVisuallyEmpty = (editor: HTMLElement) => {
  const hasMeaningfulNode = (node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.replace(/\u00A0/g, '').trim() ?? '';
      return text.length > 0;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    const element = node as HTMLElement;
    const tag = element.tagName;

    if (tag === 'BR') return false;
    if (element.classList.contains('bw-code-lang-wrapper')) return false;

    if (
      [
        'PRE',
        'IMG',
        'VIDEO',
        'IFRAME',
        'TABLE',
        'HR',
        'CANVAS',
        'SVG',
      ].includes(tag)
    ) {
      return true;
    }

    return Array.from(element.childNodes).some(hasMeaningfulNode);
  };

  return !Array.from(editor.childNodes).some(hasMeaningfulNode);
};

// ── Selection offset helpers (code blocks) ──

export const getSelectionOffsetsInElement = (element: HTMLElement) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (
    !element.contains(range.startContainer) ||
    !element.contains(range.endContainer)
  ) {
    return null;
  }

  const startRange = document.createRange();
  startRange.selectNodeContents(element);
  startRange.setEnd(range.startContainer, range.startOffset);
  const start = startRange.toString().length;

  const endRange = document.createRange();
  endRange.selectNodeContents(element);
  endRange.setEnd(range.endContainer, range.endOffset);
  const end = endRange.toString().length;

  return { start, end };
};

export const setSelectionInElementByOffset = (
  element: HTMLElement,
  startOffset: number,
  endOffset = startOffset
) => {
  const selection = window.getSelection();
  if (!selection) return;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let totalLength = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    textNodes.push(node);
    totalLength += node.data.length;
  }

  if (textNodes.length === 0) {
    const emptyNode = document.createTextNode(element.textContent || '');
    element.innerHTML = '';
    element.appendChild(emptyNode);
    textNodes.push(emptyNode);
    totalLength = emptyNode.data.length;
  }

  const clamp = (value: number) => Math.max(0, Math.min(value, totalLength));
  const targetStart = clamp(startOffset);
  const targetEnd = clamp(endOffset);

  const resolve = (target: number) => {
    let consumed = 0;
    for (const node of textNodes) {
      const nodeLength = node.data.length;
      if (target <= consumed + nodeLength) {
        return { node, offset: target - consumed };
      }
      consumed += nodeLength;
    }
    const last = textNodes[textNodes.length - 1];
    return { node: last, offset: last.data.length };
  };

  const startPos = resolve(targetStart);
  const endPos = resolve(targetEnd);

  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);
  selection.removeAllRanges();
  selection.addRange(range);
};

// ── Color reading helper ──

export const readCurrentColor = () => {
  const raw = document.queryCommandValue('foreColor');
  if (typeof raw === 'string') {
    const hex = raw.match(/#([0-9a-fA-F]{6})/);
    if (hex) return `#${hex[1]}`.toUpperCase();
    const rgb = raw.match(/rgb\s*\((\d+),\s*(\d+),\s*(\d+)\)/i);
    if (rgb) {
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      return `#${toHex(Number(rgb[1]))}${toHex(Number(rgb[2]))}${toHex(Number(rgb[3]))}`.toUpperCase();
    }
  }
  return '#0C0C0C';
};

// ── Link helpers ──

export const findAnchorFromNode = (node: Node | null, editorElement: HTMLElement | null) => {
  let current = node;
  while (current && current !== editorElement) {
    if (current instanceof HTMLAnchorElement) return current;
    current = current.parentNode;
  }
  return null;
};

export const normalizeLinkUrl = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};
