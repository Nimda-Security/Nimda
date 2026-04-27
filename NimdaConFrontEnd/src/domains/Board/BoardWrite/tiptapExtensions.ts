import { Extension, mergeAttributes } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { common, createLowlight } from 'lowlight';
import CodeBlockView from './CodeBlockView';
import ImageView from './ImageView';
import { getCodeLanguageLabel } from './constants';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.style.fontSize || null,
            renderHTML: (attributes: { fontSize?: string | null }) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

export const ResolvedTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      color: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.color || null,
        renderHTML: (attributes: { color?: string | null }) => {
          if (!attributes.color) {
            return {};
          }

          return {
            style: `color: ${attributes.color}`,
          };
        },
      },
    };
  },
});

export const RichImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('class'),
        renderHTML: (attributes: { class?: string | null }) =>
          attributes.class ? { class: attributes.class } : {},
      },
      'data-emoticon-id': {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-emoticon-id'),
        renderHTML: (attributes: { 'data-emoticon-id'?: string | null }) =>
          attributes['data-emoticon-id']
            ? { 'data-emoticon-id': attributes['data-emoticon-id'] }
            : {},
      },
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('width'),
        renderHTML: (attributes: { width?: string | number | null }) =>
          attributes.width ? { width: attributes.width } : {},
      },
      height: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('height'),
        renderHTML: (attributes: { height?: string | number | null }) =>
          attributes.height ? { height: attributes.height } : {},
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});

export const lowlight = createLowlight(common);

export const RichCodeBlock = CodeBlockLowlight.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: this.options.defaultLanguage,
        parseHTML: (element: HTMLElement) => {
          const directLanguage = element.getAttribute('data-language');
          if (directLanguage) {
            return directLanguage;
          }

          const code = element.querySelector('code');
          const classSource = code?.className || '';
          const prefixedLanguage = classSource
            .split(/\s+/)
            .find((className) =>
              className.startsWith(this.options.languageClassPrefix)
            );

          return prefixedLanguage
            ? prefixedLanguage.replace(this.options.languageClassPrefix, '')
            : null;
        },
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const language = (node.attrs.language as string | null) || 'plaintext';
    const languageClass = `${this.options.languageClassPrefix}${language}`;

    return [
      'pre',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `bw-code-block ${languageClass}`,
        'data-language': language,
        'data-language-label': getCodeLanguageLabel(language),
      }),
      [
        'code',
        {
          class: languageClass,
        },
        0,
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
});
