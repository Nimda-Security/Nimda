import hljs from 'highlight.js/lib/core';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

let registered = false;

const ensureLanguages = () => {
  if (registered) return;

  if (!hljs.getLanguage('c')) hljs.registerLanguage('c', c);
  if (!hljs.getLanguage('cpp')) hljs.registerLanguage('cpp', cpp);
  if (!hljs.getLanguage('css')) hljs.registerLanguage('css', css);
  if (!hljs.getLanguage('java')) hljs.registerLanguage('java', java);
  if (!hljs.getLanguage('javascript'))
    hljs.registerLanguage('javascript', javascript);
  if (!hljs.getLanguage('typescript'))
    hljs.registerLanguage('typescript', typescript);
  if (!hljs.getLanguage('python')) hljs.registerLanguage('python', python);
  if (!hljs.getLanguage('xml')) hljs.registerLanguage('xml', xml);
  if (!hljs.getLanguage('html')) hljs.registerLanguage('html', xml);
  if (!hljs.getLanguage('js')) hljs.registerLanguage('js', javascript);
  if (!hljs.getLanguage('ts')) hljs.registerLanguage('ts', typescript);
  if (!hljs.getLanguage('py')) hljs.registerLanguage('py', python);
  if (!hljs.getLanguage('c++')) hljs.registerLanguage('c++', cpp);
  if (!hljs.getLanguage('hpp')) hljs.registerLanguage('hpp', cpp);
  if (!hljs.getLanguage('h')) hljs.registerLanguage('h', c);

  registered = true;
};

export const highlightCodeBlocks = (root: ParentNode) => {
  ensureLanguages();
  const preBlocks: HTMLElement[] = [];
  if (root instanceof HTMLElement && root.tagName === 'PRE') {
    preBlocks.push(root);
  }
  preBlocks.push(
    ...(Array.from(root.querySelectorAll('pre')) as HTMLElement[])
  );

  const aliasMap: Record<string, string> = {
    cxx: 'cpp',
    'c++': 'cpp',
    hpp: 'cpp',
    h: 'c',
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    html: 'xml',
    text: 'plaintext',
  };

  preBlocks.forEach((pre) => {
    let code = pre.querySelector('code') as HTMLElement | null;

    if (!code) {
      code = document.createElement('code');
      code.textContent = pre.textContent || '';
      pre.innerHTML = '';
      pre.appendChild(code);
    }

    const preLanguageClass = Array.from(pre.classList).find((cls) =>
      cls.startsWith('language-')
    );
    const codeLanguageClass = Array.from(code.classList).find((cls) =>
      cls.startsWith('language-')
    );

    const rawLanguage =
      codeLanguageClass?.replace('language-', '') ||
      preLanguageClass?.replace('language-', '') ||
      (pre.getAttribute('data-language') || '').toLowerCase();

    const normalizedLanguage = aliasMap[rawLanguage] ?? rawLanguage;

    if (!normalizedLanguage || normalizedLanguage === 'plaintext') {
      code.classList.remove('hljs');
      return;
    }

    Array.from(code.classList)
      .filter((cls) => cls.startsWith('language-'))
      .forEach((cls) => code?.classList.remove(cls));
    code.classList.add(`language-${normalizedLanguage}`);
    code.removeAttribute('data-highlighted');

    hljs.highlightElement(code);
  });
};
