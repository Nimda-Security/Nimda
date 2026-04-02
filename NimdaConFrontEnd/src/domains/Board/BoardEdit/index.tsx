import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import InlineColorPicker from '@/components/InlineColorPicker';
import { getBoardDetailAPI, updateBoardAPI } from '@/api/board';
import { uploadBoardFileViaS3 } from '@/api/attachments';
import { highlightCodeBlocks } from '@/utils/codeHighlight';
import type { Board } from '../types';

const CODE_LANGUAGE_OPTIONS = [
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

const getCodeLanguageLabel = (language: string) =>
  CODE_LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ||
  language.toUpperCase();

const COLOR_PALETTE = [
  '#0C0C0C',
  '#D64454',
  '#E17654',
  '#E8B446',
  '#5CB85C',
  '#5BC0DE',
  '#4A7FCC',
  '#8B6BB7',
  '#D97399',
];
const MAX_RECENT_COLORS = 5;
type ColorPickerTab = 'palette' | 'custom';

type EyeDropperApi = {
  open: () => Promise<{ sRGBHex: string }>;
};

function BoardEditPage() {
  const navigate = useNavigate();
  const { boardType: paramBoardType, id } = useParams<{
    boardType: string;
    id: string;
  }>();

  const slug = paramBoardType?.toLowerCase() || 'news';

  const [board, setBoard] = useState<Board | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<string>('');
  /** 새로 선택한 파일(저장 시 S3 업로드). */
  const [file, setFile] = useState<File | null>(null);
  /**
   * 수정 API에 넘길 최종 첨부 ID 목록.
   * null = 상세에 attachments 필드가 없던 응답(옛 API) → PUT 시 attachmentIds 생략·첨부 동기화 안 함.
   * 배열 = 동기화(빈 배열이면 서버에서 해당 글 첨부 전부 제거).
   */
  const [attachmentIdList, setAttachmentIdList] = useState<number[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerTab, setColorPickerTab] =
    useState<ColorPickerTab>('palette');
  const [selectedColor, setSelectedColor] = useState<string>('currentColor');
  const [pendingColor, setPendingColor] = useState<string>('#0C0C0C');
  const [pendingCustomColor, setPendingCustomColor] =
    useState<string>('#0C0C0C');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [currentAlignment, setCurrentAlignment] = useState<
    'left' | 'center' | 'right'
  >('left');
  const contentRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const justEndedCompositionRef = useRef(false);

  const getEditorContent = () => {
    return contentRef.current?.innerHTML || '';
  };

  const isEditorVisuallyEmpty = (editor: HTMLElement) => {
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

  const syncEditorEmptyState = () => {
    const editor = contentRef.current;
    if (!editor) return;
    editor.setAttribute(
      'data-empty',
      isEditorVisuallyEmpty(editor) ? 'true' : 'false'
    );
    editor
      .querySelectorAll('pre.bw-code-block')
      .forEach((pre) => syncCodeBlockEmptyState(pre as HTMLElement));
  };

  useEffect(() => {
    syncEditorEmptyState();
    if (isComposingRef.current || justEndedCompositionRef.current) {
      return;
    }
    if (contentRef.current && !getCurrentPreElement()) {
      highlightCodeBlocks(contentRef.current);
    }
  }, [content]);

  // Native beforeinput handler to fix RTL text input in code blocks
  useEffect(() => {
    const editor = contentRef.current;
    if (!editor) return;

    const emptyStateObserver = new MutationObserver(() => {
      syncEditorEmptyState();
    });
    emptyStateObserver.observe(editor, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    syncEditorEmptyState();

    const handleCompositionStart = () => {
      isComposingRef.current = true;
      justEndedCompositionRef.current = false;
    };

    const handleCompositionEnd = () => {
      isComposingRef.current = false;
      justEndedCompositionRef.current = true;
      requestAnimationFrame(() => {
        justEndedCompositionRef.current = false;
      });
    };

    const handleBeforeInput = (e: InputEvent) => {
      if (e.isComposing || isComposingRef.current) return;
      if (e.inputType !== 'insertText' || !e.data) return;

      const currentPre = getCurrentPreElement();
      if (!currentPre) return;

      e.preventDefault();

      const codeElement = getCodeElementInPre(currentPre);
      const offsets = getSelectionOffsetsInElement(codeElement);
      if (!offsets) return;

      const text = codeElement.textContent || '';
      const { start, end } = offsets;
      codeElement.textContent = text.slice(0, start) + e.data + text.slice(end);
      const nextOffset = start + e.data.length;
      setSelectionInElementByOffset(codeElement, nextOffset);
      setContent(getEditorContent());
      requestAnimationFrame(() => {
        refreshCodeBlockHighlight(currentPre, nextOffset);
      });
    };

    const handleLanguageChange = (e: Event) => {
      const target = e.target;
      if (!(target instanceof HTMLSelectElement)) return;
      if (!target.classList.contains('bw-code-lang-select')) return;

      const pre = target.closest('pre') as HTMLElement | null;
      if (!pre) return;

      updateCodeBlockLanguage(pre, target.value);
      const code = getCodeElementInPre(pre);
      const offsets = getSelectionOffsetsInElement(code);
      const cursorStart = offsets?.start ?? code.textContent?.length ?? 0;
      const cursorEnd = offsets?.end ?? cursorStart;

      setContent(getEditorContent());
      requestAnimationFrame(() => {
        refreshCodeBlockHighlight(pre, cursorStart, cursorEnd);
      });
    };

    const handleCodeDeleteClick = (e: MouseEvent) => {
      const rawTarget = e.target;
      if (!(rawTarget instanceof HTMLElement)) return;

      const deleteButton = rawTarget.closest('.bw-code-delete-btn');
      if (!(deleteButton instanceof HTMLElement)) return;

      e.preventDefault();
      e.stopPropagation();

      const pre = deleteButton.closest('pre') as HTMLElement | null;
      if (!pre || !editor.contains(pre)) return;

      const next = pre.nextElementSibling as HTMLElement | null;
      const prev = pre.previousElementSibling as HTMLElement | null;

      let targetNode: HTMLElement;
      let collapseToEnd = false;

      if (next) {
        targetNode = next;
      } else if (prev) {
        targetNode = prev;
        collapseToEnd = true;
      } else {
        const paragraph = document.createElement('p');
        paragraph.innerHTML = '<br>';
        pre.insertAdjacentElement('afterend', paragraph);
        targetNode = paragraph;
      }

      pre.remove();

      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(targetNode);
        range.collapse(!collapseToEnd);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      setContent(getEditorContent());
      syncEditorEmptyState();
      if (!getCurrentPreElement()) {
        requestAnimationFrame(() => {
          highlightCodeBlocks(editor);
        });
      }
    };

    editor.addEventListener('compositionstart', handleCompositionStart);
    editor.addEventListener('compositionend', handleCompositionEnd);
    editor.addEventListener('beforeinput', handleBeforeInput);
    editor.addEventListener('change', handleLanguageChange);
    editor.addEventListener('click', handleCodeDeleteClick);
    return () => {
      emptyStateObserver.disconnect();
      editor.removeEventListener('compositionstart', handleCompositionStart);
      editor.removeEventListener('compositionend', handleCompositionEnd);
      editor.removeEventListener('beforeinput', handleBeforeInput);
      editor.removeEventListener('change', handleLanguageChange);
      editor.removeEventListener('click', handleCodeDeleteClick);
    };
  }, []);

  const applyFormat = (
    format: 'bold' | 'italic' | 'underline' | 'strikeThrough'
  ) => {
    contentRef.current?.focus();
    document.execCommand(format, false);
  };

  const applyFontSize = (size: string) => {
    contentRef.current?.focus();
    const selectedColor = readCurrentColor();
    document.execCommand('fontSize', false, '7');
    const editor = contentRef.current;
    if (editor) {
      const fonts = editor.querySelectorAll('font[size="7"]');
      fonts.forEach((font) => {
        const span = document.createElement('span');
        span.style.fontSize = size;
        span.style.color = selectedColor;
        span.innerHTML = font.innerHTML;
        font.parentNode?.replaceChild(span, font);
      });
    }
    setShowFontSize(false);
  };

  const applyColor = (color: string) => {
    contentRef.current?.focus();
    document.execCommand('foreColor', false, color);
    setSelectedColor(color === '#0C0C0C' ? 'currentColor' : color);
    setShowColorPicker(false);
  };

  const pushRecentColor = (color: string) => {
    setRecentColors((prev) => {
      const normalized = color.toUpperCase();
      return [normalized, ...prev.filter((item) => item !== normalized)].slice(
        0,
        MAX_RECENT_COLORS
      );
    });
  };

  const handlePickScreenColor = async () => {
    const EyeDropperCtor = (
      window as unknown as {
        EyeDropper?: new () => EyeDropperApi;
      }
    ).EyeDropper;
    if (!EyeDropperCtor) return;

    try {
      const eyeDropper = new EyeDropperCtor();
      const result = await eyeDropper.open();
      const picked = result.sRGBHex.toUpperCase();
      setPendingCustomColor(picked);
      setPendingColor(picked);
    } catch {}
  };

  const readCurrentColor = () => {
    contentRef.current?.focus();
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

  const applyAlignment = (align: 'left' | 'center' | 'right') => {
    contentRef.current?.focus();
    const command =
      align === 'left'
        ? 'justifyLeft'
        : align === 'center'
          ? 'justifyCenter'
          : 'justifyRight';
    document.execCommand(command, false);
    setCurrentAlignment(align);
  };

  const cycleAlignment = () => {
    const next =
      currentAlignment === 'left'
        ? 'center'
        : currentAlignment === 'center'
          ? 'right'
          : 'left';
    applyAlignment(next);
  };

  const getCurrentPreElement = () => {
    const selection = window.getSelection();
    let node: Node | null = selection?.anchorNode ?? null;

    while (node && node !== contentRef.current) {
      if (node instanceof HTMLElement && node.tagName === 'PRE') {
        return node;
      }
      node = node.parentNode;
    }

    return null;
  };

  const getCodeElementInPre = (pre: HTMLElement) => {
    let code = pre.querySelector('code');
    if (!code) {
      code = document.createElement('code');
      code.textContent = pre.textContent || '';
      pre.innerHTML = '';
      pre.appendChild(code);
    }
    pre.setAttribute('dir', 'ltr');
    code.setAttribute('dir', 'ltr');
    pre.style.direction = 'ltr';
    code.style.direction = 'ltr';
    pre.style.textAlign = 'left';
    code.style.textAlign = 'left';
    return code;
  };

  const syncCodeBlockEmptyState = (pre: HTMLElement) => {
    const code = pre.querySelector('code') as HTMLElement | null;
    const normalizedText = (code?.textContent ?? '')
      .replace(/\u00A0/g, '')
      .trim();
    pre.setAttribute(
      'data-code-empty',
      normalizedText.length === 0 ? 'true' : 'false'
    );
  };

  const ensureCodeLanguageSelector = (pre: HTMLElement, language: string) => {
    let wrapper = pre.querySelector(
      '.bw-code-lang-wrapper'
    ) as HTMLElement | null;

    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.contentEditable = 'false';
      wrapper.className = 'bw-code-lang-wrapper';
      pre.insertBefore(wrapper, pre.firstChild);
    }

    let select = wrapper.querySelector('select') as HTMLSelectElement | null;
    if (!select) {
      select = document.createElement('select');
      select.className = 'bw-code-lang-select';
      CODE_LANGUAGE_OPTIONS.forEach((option) => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        select?.appendChild(optionElement);
      });
      wrapper.appendChild(select);
    }

    let deleteButton = wrapper.querySelector(
      '.bw-code-delete-btn'
    ) as HTMLButtonElement | null;
    if (!deleteButton) {
      deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'bw-code-delete-btn';
      deleteButton.textContent = '×';
      deleteButton.title = '코드블럭 삭제';
      deleteButton.setAttribute('aria-label', '코드블럭 삭제');
      wrapper.appendChild(deleteButton);
    }

    if (select) {
      select.value = language;
    }
  };

  const refreshCodeBlockHighlight = (
    pre: HTMLElement,
    cursorStart: number,
    cursorEnd = cursorStart
  ) => {
    highlightCodeBlocks(pre);
    syncCodeBlockEmptyState(pre);
    const code = pre.querySelector('code') as HTMLElement | null;
    if (code) {
      setSelectionInElementByOffset(code, cursorStart, cursorEnd);
    }
  };

  const updateCodeBlockLanguage = (pre: HTMLElement, language: string) => {
    const normalizedLanguage =
      language === 'plaintext' ? 'plaintext' : language;

    const prevLanguageClass = Array.from(pre.classList).find((c) =>
      c.startsWith('language-')
    );
    if (prevLanguageClass) {
      pre.classList.remove(prevLanguageClass);
    }

    pre.classList.add('bw-code-block', `language-${normalizedLanguage}`);
    pre.setAttribute('data-language', normalizedLanguage);
    pre.setAttribute(
      'data-language-label',
      getCodeLanguageLabel(normalizedLanguage)
    );
    ensureCodeLanguageSelector(pre, normalizedLanguage);

    const code = getCodeElementInPre(pre);
    Array.from(code.classList)
      .filter((cls) => cls.startsWith('language-'))
      .forEach((cls) => code.classList.remove(cls));
    code.classList.add(`language-${normalizedLanguage}`);
    code.removeAttribute('data-highlighted');
    syncCodeBlockEmptyState(pre);
  };

  const getSelectionOffsetsInElement = (element: HTMLElement) => {
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

  const setSelectionInElementByOffset = (
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

  const applyCodeLanguage = (language: string) => {
    contentRef.current?.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !contentRef.current) {
      return;
    }

    const currentPre = getCurrentPreElement();

    if (language === 'none') {
      if (currentPre) {
        const codeElement = getCodeElementInPre(currentPre);
        const text = codeElement.textContent || '';
        const paragraph = document.createElement('p');
        paragraph.innerHTML = text ? text.replace(/\n/g, '<br>') : '<br>';
        currentPre.replaceWith(paragraph);

        const range = document.createRange();
        range.selectNodeContents(paragraph);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setContent(getEditorContent());
      return;
    }

    let targetPre = currentPre;

    if (!targetPre) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      const normalizedLanguage =
        language === 'plaintext' ? 'plaintext' : language;
      const pre = document.createElement('pre');
      pre.className = `bw-code-block language-${normalizedLanguage}`;
      pre.setAttribute('data-language', language);
      pre.setAttribute('data-language-label', getCodeLanguageLabel(language));
      pre.setAttribute('dir', 'ltr');
      pre.style.direction = 'ltr';
      pre.style.unicodeBidi = 'embed';
      pre.style.textAlign = 'left';
      const code = document.createElement('code');
      code.className = `language-${normalizedLanguage}`;
      code.setAttribute('dir', 'ltr');
      code.style.direction = 'ltr';
      code.style.unicodeBidi = 'embed';
      code.style.textAlign = 'left';
      code.textContent = selectedText || '';
      ensureCodeLanguageSelector(pre, normalizedLanguage);
      pre.appendChild(code);
      syncCodeBlockEmptyState(pre);

      const paragraph = document.createElement('p');
      paragraph.innerHTML = '<br>';

      range.deleteContents();
      range.insertNode(paragraph);
      range.insertNode(pre);

      targetPre = pre;
      const newRange = document.createRange();
      newRange.selectNodeContents(code);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    if (targetPre) {
      updateCodeBlockLanguage(targetPre, language);
    }

    setContent(getEditorContent());
    const editor = contentRef.current;
    if (editor) {
      setTimeout(() => highlightCodeBlocks(editor), 0);
    }
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const nativeEvent = e.nativeEvent as KeyboardEvent;
    const isImeComposingNow =
      nativeEvent.isComposing ||
      isComposingRef.current ||
      nativeEvent.keyCode === 229;

    if (e.key === 'Enter' && isImeComposingNow) {
      return;
    }

    const currentPre = getCurrentPreElement();

    if (currentPre) {
      const codeElement = getCodeElementInPre(currentPre);
      const offsets = getSelectionOffsetsInElement(codeElement);

      if (!offsets) {
        return;
      }

      const text = codeElement.textContent || '';
      const { start, end } = offsets;
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const lineEndIndex = text.indexOf('\n', start);
      const lineEnd = lineEndIndex === -1 ? text.length : lineEndIndex;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(codeElement);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        const isAtEnd =
          end === text.length ||
          (end === text.length - 1 && text.endsWith('\n'));
        if (isAtEnd) {
          e.preventDefault();

          const next = currentPre.nextElementSibling as HTMLElement | null;
          let target = next;
          if (!target) {
            const paragraph = document.createElement('p');
            paragraph.innerHTML = '<br>';
            currentPre.insertAdjacentElement('afterend', paragraph);
            target = paragraph;
          }

          const selection = window.getSelection();
          if (selection) {
            const range = document.createRange();
            range.selectNodeContents(target);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          setContent(getEditorContent());
          return;
        }
      }

      const currentLine = text.slice(lineStart, lineEnd);

      if (e.key === 'Home') {
        e.preventDefault();
        const indentLength = (currentLine.match(/^[ \t]*/) || [''])[0].length;
        const firstTextOffset = lineStart + indentLength;
        const targetOffset =
          start === firstTextOffset ? lineStart : firstTextOffset;
        setSelectionInElementByOffset(codeElement, targetOffset);
        return;
      }

      if (e.key === 'Backspace' && start === end) {
        if (text.length === 0) {
          e.preventDefault();
          return;
        }

        if (start === lineStart && currentLine.length === 0 && lineStart > 0) {
          e.preventDefault();
          codeElement.textContent =
            text.slice(0, lineStart - 1) + text.slice(lineStart);
          setSelectionInElementByOffset(codeElement, lineStart - 1);
          setContent(getEditorContent());
          return;
        }
      }

      if (e.key === 'Tab') {
        e.preventDefault();

        if (start !== end) {
          const blockStart = text.lastIndexOf('\n', start - 1) + 1;
          const selected = text.slice(blockStart, end);
          const lines = selected.split('\n');

          if (e.shiftKey) {
            let removedTotal = 0;
            const unindented = lines
              .map((line) => {
                if (line.startsWith('  ')) {
                  removedTotal += 2;
                  return line.slice(2);
                }
                if (line.startsWith(' ')) {
                  removedTotal += 1;
                  return line.slice(1);
                }
                return line;
              })
              .join('\n');
            codeElement.textContent =
              text.slice(0, blockStart) + unindented + text.slice(end);
            setSelectionInElementByOffset(
              codeElement,
              blockStart,
              end - removedTotal
            );
          } else {
            const indented = lines.map((line) => `  ${line}`).join('\n');
            codeElement.textContent =
              text.slice(0, blockStart) + indented + text.slice(end);
            const addedTotal = lines.length * 2;
            setSelectionInElementByOffset(
              codeElement,
              blockStart + 2,
              end + addedTotal
            );
          }
        } else {
          if (e.shiftKey) {
            const lineStart = text.lastIndexOf('\n', start - 1) + 1;
            const beforeCaret = text.slice(lineStart, start);
            let removeCount = 0;
            if (beforeCaret.endsWith('  ')) removeCount = 2;
            else if (beforeCaret.endsWith(' ')) removeCount = 1;

            if (removeCount > 0) {
              codeElement.textContent =
                text.slice(0, start - removeCount) + text.slice(start);
              setSelectionInElementByOffset(codeElement, start - removeCount);
            }
          } else {
            codeElement.textContent =
              text.slice(0, start) + '  ' + text.slice(end);
            setSelectionInElementByOffset(codeElement, start + 2);
          }
        }

        setContent(getEditorContent());
        requestAnimationFrame(() => {
          refreshCodeBlockHighlight(currentPre, start + 1);
        });
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();

        const linePrefix = text.slice(lineStart, start);
        const indent = (linePrefix.match(/^[ \t]*/) || [''])[0];
        const insertText = e.shiftKey ? '\n' : `\n${indent}`;

        const isAtEnd =
          end === text.length ||
          (end === text.length - 1 && text.endsWith('\n'));

        if (isAtEnd && !text.endsWith('\n\n')) {
          codeElement.textContent = text.slice(0, start) + insertText + '\n';
        } else {
          codeElement.textContent =
            text.slice(0, start) + insertText + text.slice(end);
        }

        const newOffset = start + insertText.length;
        setSelectionInElementByOffset(codeElement, newOffset);
        setContent(getEditorContent());
        requestAnimationFrame(() => {
          refreshCodeBlockHighlight(currentPre, newOffset);
        });
        return;
      }
    }

    if (!currentPre && (e.key === 'Enter' || e.key === ' ')) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        const textContent = node.textContent || '';
        const textBeforeCursor = textContent.slice(0, range.startOffset);
        const match = textBeforeCursor.match(/^```([a-zA-Z0-9#+\-.]*)$/);

        if (match) {
          e.preventDefault();
          const lang = match[1] || 'plaintext';

          let blockNode: Node | null = node;
          while (
            blockNode &&
            blockNode.parentNode !== contentRef.current &&
            (blockNode as HTMLElement).classList?.contains(
              'bw-content-input'
            ) === false
          ) {
            if (blockNode.nodeName === 'DIV' || blockNode.nodeName === 'P')
              break;
            blockNode = blockNode.parentNode;
          }
          if (!blockNode || blockNode === contentRef.current) blockNode = node;

          let cleanLang = lang.toLowerCase();
          if (cleanLang === '') cleanLang = 'plaintext';

          const pre = document.createElement('pre');
          pre.className = `bw-code-block language-${cleanLang}`;
          pre.setAttribute('dir', 'ltr');
          pre.setAttribute('data-language', cleanLang);
          pre.setAttribute(
            'data-language-label',
            getCodeLanguageLabel(cleanLang)
          );

          const code = document.createElement('code');
          code.className = `language-${cleanLang}`;
          code.textContent = '';

          pre.style.position = 'relative';
          ensureCodeLanguageSelector(pre, cleanLang);
          pre.appendChild(code);
          syncCodeBlockEmptyState(pre);

          if (blockNode.parentNode) {
            blockNode.parentNode.replaceChild(pre, blockNode);
          } else {
            contentRef.current?.appendChild(pre);
          }

          const newRange = document.createRange();
          newRange.setStart(code, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);

          setContent(getEditorContent());
          setTimeout(() => {
            if (contentRef.current) highlightCodeBlocks(contentRef.current);
          }, 0);
          return;
        }
      }
    }

    if (e.key === 'ArrowUp') {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      let node: Node | null = range.startContainer;
      while (node && node !== contentRef.current) {
        if (node instanceof HTMLElement && node.tagName === 'PRE') {
          const pre = node;
          const code = pre.querySelector('code') as HTMLElement | null;
          if (!code) return;
          const offsets = getSelectionOffsetsInElement(code);
          if (offsets && offsets.start === 0 && offsets.end === 0) {
            e.preventDefault();
            const prev = pre.previousElementSibling;
            if (prev instanceof HTMLElement) {
              const newRange = document.createRange();
              newRange.selectNodeContents(prev);
              newRange.collapse(false);
              selection.removeAllRanges();
              selection.addRange(newRange);
            } else {
              const p = document.createElement('p');
              p.innerHTML = '<br>';
              pre.parentNode?.insertBefore(p, pre);
              const newRange = document.createRange();
              newRange.selectNodeContents(p);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
            setContent(getEditorContent());
          }
          return;
        }
        node = node.parentNode;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        document.execCommand('insertLineBreak', false);
      } else {
        document.execCommand('insertParagraph', false);
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchBoard(parseInt(id));
    }
  }, [id]);

  const fetchBoard = async (boardId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBoardDetailAPI(boardId);

      if (response.success && 'board' in response) {
        const fetchedBoard = response.board;
        setBoard(fetchedBoard);
        setTitle(fetchedBoard.title);
        setContent(fetchedBoard.content);
        setTag(fetchedBoard.tag || '');
        if (fetchedBoard.attachments !== undefined) {
          setAttachmentIdList(fetchedBoard.attachments.map((a) => a.id));
        } else {
          setAttachmentIdList(null);
        }
      } else {
        setError(response.message);
      }
    } catch {
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !board ||
      !title.trim() ||
      !getEditorContent()
        .replace(/<[^>]*>/g, '')
        .trim()
    ) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (!board.category) {
        setError('카테고리 정보가 없습니다.');
        return;
      }

      // 첨부 동기화: 상세에 attachments가 있었으면 목록 기준, 새 파일 있으면 S3 업로드 후 ID 추가.
      // attachmentIdList가 null이면 attachmentIds 필드 자체를 보내지 않음(백엔드가 기존 첨부 유지).
      let attachmentIds: number[] | undefined;
      if (attachmentIdList !== null) {
        attachmentIds = [...attachmentIdList];
      }
      if (file) {
        const uploaded = await uploadBoardFileViaS3(file, board.category.id);
        if (!uploaded.ok) {
          setError(uploaded.message);
          return;
        }
        attachmentIds = [...(attachmentIds ?? []), uploaded.attachmentId];
      }

      const response = await updateBoardAPI(board.id, {
        categoryId: board.category.id,
        title: title.trim(),
        content: getEditorContent(),
        tag: tag.trim() || undefined,
        attachmentIds,
      });

      if (response.success && 'board' in response) {
        alert('게시글이 수정되었습니다.');
        const boardSlug = response.board.category?.slug || slug;
        navigate(`/board/${boardSlug}/${board.id}`);
      } else {
        setError(response.message || '게시글 수정에 실패했습니다.');
      }
    } catch {
      setError('게시글 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (board) {
      const boardSlug = board.category?.slug || slug;
      navigate(`/board/${boardSlug}/${board.id}`);
    } else {
      navigate(`/board/${slug}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  /** 목록에서 첨부 ID 제거(서버 동기화는 저장 시). */
  const handleRemoveAttachmentId = (id: number) => {
    setAttachmentIdList((prev) =>
      prev === null ? null : prev.filter((x) => x !== id)
    );
  };

  // 카테고리의 availableTags를 파싱하여 배열로 변환
  const getAvailableTags = (): string[] => {
    if (!board?.category?.availableTags) return [];
    try {
      return JSON.parse(board.category.availableTags);
    } catch {
      return [];
    }
  };

  const availableTags = getAvailableTags();

  if (loading) {
    return (
      <Layout hideSidebar={true}>
        <div className="min-h-screen bg-white pt-8">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="text-center py-12 text-gray-600">로딩 중...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !board) {
    return (
      <Layout hideSidebar={true}>
        <div className="min-h-screen bg-white pt-8">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="text-center py-12 text-red-600">{error}</div>
            <div className="text-center">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideSidebar={true}>
      <div className="min-h-screen bg-white pt-8">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="mb-6">
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-black text-sm mb-4"
            >
              ← 돌아가기
            </button>
            <h1 className="text-2xl font-bold text-black">게시글 수정</h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                제목
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                maxLength={200}
                required
              />
            </div>

            {/* 내용 */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                내용
              </label>
              {/* 포맷팅 툴바 */}
              <div className="flex items-center gap-1 mb-2 p-1 border border-gray-300 rounded-t bg-gray-50">
                <button
                  type="button"
                  onClick={() => applyFormat('bold')}
                  className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded"
                  title="굵게"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('italic')}
                  className="px-2 py-1 text-sm italic hover:bg-gray-200 rounded"
                  title="기울임"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('underline')}
                  className="px-2 py-1 text-sm underline hover:bg-gray-200 rounded"
                  title="밑줄"
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('strikeThrough')}
                  className="px-2 py-1 text-sm line-through hover:bg-gray-200 rounded"
                  title="취소선"
                >
                  S
                </button>
                <span className="w-px h-5 bg-gray-300 mx-1" />
                {/* 폰트 크기 */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFontSize((p) => !p);
                      setShowColorPicker(false);
                    }}
                    className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
                    title="글자 크기"
                  >
                    <span style={{ fontSize: 11 }}>A</span>
                    <span style={{ fontSize: 15 }}>A</span>
                  </button>
                  {showFontSize && (
                    <div className="bw-tool-dropdown" style={{ left: 0 }}>
                      {[
                        { label: '작게', value: '12px' },
                        { label: '보통', value: '16px' },
                        { label: '크게', value: '20px' },
                        { label: '아주 크게', value: '28px' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className="bw-tool-dropdown-item"
                          style={{ fontSize: opt.value }}
                          onClick={() => applyFontSize(opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* 글자 색상 */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowColorPicker((p) => {
                        const next = !p;
                        if (next) {
                          const current = readCurrentColor();
                          setPendingColor(current);
                          setPendingCustomColor(current);
                          setColorPickerTab('palette');
                        }
                        return next;
                      });
                      setShowFontSize(false);
                    }}
                    className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
                    title="글자 색상"
                  >
                    <span
                      style={{
                        borderBottom: `3px solid ${selectedColor === 'currentColor' ? '#DC2626' : selectedColor}`,
                        paddingBottom: 1,
                      }}
                    >
                      A
                    </span>
                  </button>
                  {showColorPicker && (
                    <div
                      className="bw-tool-dropdown bw-color-grid"
                      style={{ left: 0 }}
                    >
                      <div className="bw-color-tabs">
                        <button
                          type="button"
                          className={`bw-color-tab ${colorPickerTab === 'palette' ? 'is-active' : ''}`}
                          onClick={() => setColorPickerTab('palette')}
                        >
                          팔레트
                        </button>
                        <button
                          type="button"
                          className={`bw-color-tab ${colorPickerTab === 'custom' ? 'is-active' : ''}`}
                          onClick={() => setColorPickerTab('custom')}
                        >
                          직접 선택
                        </button>
                      </div>

                      {colorPickerTab === 'palette' && (
                        <>
                          <button
                            type="button"
                            className="bw-color-swatch"
                            style={{
                              background:
                                'linear-gradient(to top right, #fff 0%, #fff 46%, #d64454 46%, #d64454 54%, #fff 54%, #fff 100%)',
                              border:
                                pendingColor === '#0C0C0C'
                                  ? '2px solid #0c0c0c'
                                  : '1px solid #e5e5e5',
                            }}
                            onClick={() => {
                              setPendingColor('#0C0C0C');
                              setPendingCustomColor('#0C0C0C');
                            }}
                            title="기본 색상"
                          />
                          {COLOR_PALETTE.map((c) => (
                            <button
                              key={c}
                              type="button"
                              className="bw-color-swatch"
                              style={{
                                background: c,
                                border:
                                  pendingColor === c
                                    ? '2px solid #0c0c0c'
                                    : '2px solid #e5e5e5',
                              }}
                              onClick={() => {
                                setPendingColor(c);
                                setPendingCustomColor(c);
                              }}
                              title={c}
                            />
                          ))}
                        </>
                      )}

                      {colorPickerTab === 'custom' && (
                        <div className="bw-color-custom-panel bw-color-custom-panel--full">
                          <div className="bw-color-custom-layout">
                            <InlineColorPicker
                              value={pendingCustomColor}
                              onChange={(hex) => {
                                setPendingCustomColor(hex);
                                setPendingColor(hex);
                              }}
                            />
                            <div className="bw-color-custom-controls">
                              <input
                                type="text"
                                className="bw-color-hex-input"
                                value={pendingCustomColor.toUpperCase()}
                                onChange={(e) => {
                                  const next = e.target.value.toUpperCase();
                                  setPendingCustomColor(next);
                                  if (/^#[0-9A-F]{6}$/.test(next)) {
                                    setPendingColor(next);
                                  }
                                }}
                                maxLength={7}
                                placeholder="#RRGGBB"
                              />
                              <div className="bw-color-preview-row">
                                <span
                                  className="bw-color-preview-box"
                                  style={{ background: pendingColor }}
                                  aria-label={`현재 선택 색상 ${pendingColor.toUpperCase()}`}
                                />
                                <button
                                  type="button"
                                  className="bw-color-eyedropper"
                                  onClick={handlePickScreenColor}
                                  title="화면에서 색상 추출"
                                  aria-label="스포이드"
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M19 11l-6-6" />
                                    <path d="M5 21l4-4" />
                                    <path d="M2 22l3-1 7-7-2-2-7 7-1 3z" />
                                    <path d="M14 4l6 6" />
                                  </svg>
                                </button>
                              </div>
                              <div className="bw-color-recent-wrap bw-color-recent-wrap--compact">
                                {Array.from({ length: MAX_RECENT_COLORS }).map(
                                  (_, idx) => {
                                    const color = recentColors[idx];
                                    const isEmpty = !color;

                                    return (
                                      <button
                                        key={color ?? `custom-empty-${idx}`}
                                        type="button"
                                        className={`bw-color-swatch ${isEmpty ? 'is-empty-slot' : ''}`}
                                        style={
                                          color
                                            ? {
                                                background: color,
                                                border:
                                                  pendingColor === color
                                                    ? '2px solid #0c0c0c'
                                                    : '2px solid #e5e5e5',
                                              }
                                            : undefined
                                        }
                                        onClick={() => {
                                          if (!color) return;
                                          setPendingColor(color);
                                          setPendingCustomColor(color);
                                        }}
                                        title={
                                          color ?? '비어있는 최근 색상 슬롯'
                                        }
                                      />
                                    );
                                  }
                                )}
                              </div>
                              <button
                                type="button"
                                className="bw-color-confirm"
                                onClick={() => {
                                  const confirmed = pendingColor.toUpperCase();
                                  applyColor(confirmed);
                                  pushRecentColor(confirmed);
                                }}
                              >
                                확인
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {colorPickerTab !== 'custom' && (
                        <button
                          type="button"
                          className="bw-color-confirm"
                          onClick={() => {
                            const confirmed = pendingColor.toUpperCase();
                            applyColor(confirmed);
                            pushRecentColor(confirmed);
                          }}
                        >
                          확인
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <span className="w-px h-5 bg-gray-300 mx-1" />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => applyCodeLanguage('plaintext')}
                    className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
                    title="코드 블록"
                  >
                    {'</>'}
                  </button>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={cycleAlignment}
                    className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
                    title="정렬"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {currentAlignment === 'left' && (
                        <>
                          <line x1="4" y1="6" x2="20" y2="6" />
                          <line x1="4" y1="10" x2="14" y2="10" />
                          <line x1="4" y1="14" x2="20" y2="14" />
                          <line x1="4" y1="18" x2="14" y2="18" />
                        </>
                      )}
                      {currentAlignment === 'center' && (
                        <>
                          <line x1="4" y1="6" x2="20" y2="6" />
                          <line x1="7" y1="10" x2="17" y2="10" />
                          <line x1="4" y1="14" x2="20" y2="14" />
                          <line x1="7" y1="18" x2="17" y2="18" />
                        </>
                      )}
                      {currentAlignment === 'right' && (
                        <>
                          <line x1="4" y1="6" x2="20" y2="6" />
                          <line x1="10" y1="10" x2="20" y2="10" />
                          <line x1="4" y1="14" x2="20" y2="14" />
                          <line x1="10" y1="18" x2="20" y2="18" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
              <div
                ref={contentRef}
                id="content"
                contentEditable
                dir="ltr"
                spellCheck={false}
                className="bw-edit-content-input w-full px-4 py-2 border border-gray-300 rounded-b focus:outline-none focus:ring-2 focus:ring-black min-h-[360px] whitespace-pre-wrap"
                data-placeholder="내용을 입력하세요"
                data-empty="true"
                dangerouslySetInnerHTML={{ __html: content }}
                onKeyDown={handleEditorKeyDown}
                onInput={() => {
                  setContent(getEditorContent());
                  syncEditorEmptyState();

                  if (
                    isComposingRef.current ||
                    justEndedCompositionRef.current
                  ) {
                    return;
                  }

                  if (contentRef.current && !getCurrentPreElement()) {
                    setTimeout(
                      () =>
                        highlightCodeBlocks(contentRef.current as HTMLElement),
                      0
                    );
                  }
                }}
              />
            </div>

            {/* 태그 선택 (카테고리에 availableTags가 있을 때만 표시) */}
            {availableTags.length > 0 && (
              <div>
                <label
                  htmlFor="tag"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  세부 카테고리 (선택사항)
                </label>
                <select
                  id="tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">세부 카테고리를 선택하세요</option>
                  {availableTags.map((tagOption) => (
                    <option key={tagOption} value={tagOption}>
                      {tagOption}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 첨부: S3 연동 시 attachments 목록 / 옛 글은 filename만 있을 수 있음 */}
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">
                첨부파일
              </span>
              {attachmentIdList !== null && attachmentIdList.length > 0 && (
                <ul className="mb-3 space-y-1 text-sm text-gray-700">
                  {attachmentIdList.map((aid) => {
                    const meta = board?.attachments?.find((a) => a.id === aid);
                    return (
                      <li key={aid} className="flex items-center gap-2">
                        <span>{meta?.originFilename ?? `첨부 #${aid}`}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachmentId(aid)}
                          className="text-red-600 hover:text-red-800"
                        >
                          제거
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {board?.attachments === undefined && board?.filename && (
                <p className="text-xs text-gray-500 mb-2">
                  (레거시 서버 저장 파일명:{' '}
                  {board.filename.split('_').slice(1).join('_')} — S3 첨부
                  목록이 없을 때만 표시)
                </p>
              )}

              <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                새 첨부 추가
              </label>
              {file ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    삭제
                  </button>
                </div>
              ) : (
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                저장 시 S3에 업로드 후 글에 연결됩니다. 위 목록에서 제거한
                항목은 저장 시 삭제됩니다.
              </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
            )}

            {/* 버튼 */}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? '수정 중...' : '수정하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default BoardEditPage;
