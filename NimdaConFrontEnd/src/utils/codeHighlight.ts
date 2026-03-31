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

  registered = true;
};

export const highlightCodeBlocks = (root: ParentNode) => {
  ensureLanguages();
  const blocks = root.querySelectorAll('pre code');

  blocks.forEach((block) => {
    const element = block as HTMLElement;
    if (element.classList.contains('language-plaintext')) {
      return;
    }
    hljs.highlightElement(element);
  });
};
