import React from 'react';
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { CODE_LANGUAGE_OPTIONS } from './constants';

export default function CodeBlockView({
  node,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  const language = (node.attrs.language as string | null) || 'plaintext';

  return (
    <NodeViewWrapper className="bw-code-node">
      <div className="bw-code-node__toolbar" contentEditable={false}>
        <label className="bw-code-node__label">
          <span className="bw-code-node__label-text">Language</span>
          <select
            className="bw-code-lang-select"
            value={language}
            onChange={(event) => updateAttributes({ language: event.target.value })}
          >
            {CODE_LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="bw-code-delete-btn"
          onClick={() => deleteNode()}
          aria-label="코드 블록 삭제"
        >
          ×
        </button>
      </div>
      <pre className={`bw-code-block language-${language}`} data-language={language}>
        <NodeViewContent as="code" className={`language-${language}`} />
      </pre>
    </NodeViewWrapper>
  );
}
