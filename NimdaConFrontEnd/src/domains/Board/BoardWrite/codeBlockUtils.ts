import { CODE_LANGUAGE_OPTIONS, getCodeLanguageLabel } from './constants';
import {
  getSelectionOffsetsInElement,
  setSelectionInElementByOffset,
} from './editorUtils';
import { highlightCodeBlocks } from '@/utils/codeHighlight';

// ── Code element retrieval ──

export const getCodeElementInPre = (pre: HTMLElement) => {
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
  pre.style.unicodeBidi = 'embed';
  code.style.unicodeBidi = 'embed';
  pre.style.textAlign = 'left';
  code.style.textAlign = 'left';
  return code;
};

// ── Code-block empty state ──

export const syncCodeBlockEmptyState = (pre: HTMLElement) => {
  const code = pre.querySelector('code') as HTMLElement | null;
  const normalizedText = (code?.textContent ?? '')
    .replace(/\u00A0/g, '')
    .trim();
  pre.setAttribute(
    'data-code-empty',
    normalizedText.length === 0 ? 'true' : 'false'
  );
};

// ── Language selector ──

export const ensureCodeLanguageSelector = (pre: HTMLElement, language: string) => {
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

// ── Highlight refresh ──

export const refreshCodeBlockHighlight = (
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

// ── Language update ──

export const updateCodeBlockLanguage = (pre: HTMLElement, language: string) => {
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

// ── Get current PRE element from selection ──

export const getCurrentPreElement = (contentEditor: HTMLElement | null) => {
  const selection = window.getSelection();
  let node: Node | null = selection?.anchorNode ?? null;

  while (node && node !== contentEditor) {
    if (node instanceof HTMLElement && node.tagName === 'PRE') {
      return node;
    }
    node = node.parentNode;
  }

  return null;
};

// ── Apply code language (insert or update code block) ──

export const applyCodeLanguage = (
  language: string,
  contentRef: React.RefObject<HTMLDivElement | null>,
  getEditorContent: () => string,
  setContent: (html: string) => void
) => {
  contentRef.current?.focus();

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !contentRef.current) {
    return;
  }

  const currentPre = getCurrentPreElement(contentRef.current);

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
    setTimeout(() => {
      if (contentRef.current) {
        highlightCodeBlocks(contentRef.current);
      }
    }, 0);
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
