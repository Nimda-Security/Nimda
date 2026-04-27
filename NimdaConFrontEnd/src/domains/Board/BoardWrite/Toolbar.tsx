import React from 'react';
import type { Editor } from '@tiptap/react';
import { COLOR_PALETTE, FONT_SIZE_OPTIONS } from './constants';
import EmoticonPicker from '@/domains/Comment/EmoticonPicker';
import InlineColorPicker from '@/components/InlineColorPicker';

interface ToolbarProps {
  editor: Editor | null;
  showFontSize: boolean;
  setShowFontSize: React.Dispatch<React.SetStateAction<boolean>>;
  showColorPicker: boolean;
  setShowColorPicker: React.Dispatch<React.SetStateAction<boolean>>;
  showLinkPopover: boolean;
  setShowLinkPopover: React.Dispatch<React.SetStateAction<boolean>>;
  colorPickerTab: 'palette' | 'custom';
  setColorPickerTab: React.Dispatch<React.SetStateAction<'palette' | 'custom'>>;
  pendingColor: string;
  setPendingColor: React.Dispatch<React.SetStateAction<string>>;
  pendingCustomColor: string;
  setPendingCustomColor: React.Dispatch<React.SetStateAction<string>>;
  recentColors: string[];
  pushRecentColor: (color: string) => void;
  handlePickScreenColor: () => void;
  linkUrl: string;
  setLinkUrl: React.Dispatch<React.SetStateAction<string>>;
  linkText: string;
  setLinkText: React.Dispatch<React.SetStateAction<string>>;
  linkPopoverWrapRef: React.RefObject<HTMLDivElement | null>;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onApplyLink: () => void;
  onInsertCodeBlock: () => void;
  onInsertEmoticon: (marker: string) => void;
}

export default function Toolbar({
  editor,
  showFontSize,
  setShowFontSize,
  showColorPicker,
  setShowColorPicker,
  showLinkPopover,
  setShowLinkPopover,
  colorPickerTab,
  setColorPickerTab,
  pendingColor,
  setPendingColor,
  pendingCustomColor,
  setPendingCustomColor,
  recentColors,
  pushRecentColor,
  handlePickScreenColor,
  linkUrl,
  setLinkUrl,
  linkText,
  setLinkText,
  linkPopoverWrapRef,
  imageInputRef,
  fileInputRef,
  onApplyLink,
  onInsertCodeBlock,
  onInsertEmoticon,
}: ToolbarProps) {
  const selectedColor =
    editor?.getAttributes('textStyle').color?.toUpperCase() || '#0C0C0C';
  const currentAlignment = editor?.isActive({ textAlign: 'center' })
    ? 'center'
    : editor?.isActive({ textAlign: 'right' })
      ? 'right'
      : 'left';

  const applyColor = (color: string) => {
    if (!editor) return;
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const applyFontSize = (size: string) => {
    if (!editor) return;
    editor.chain().focus().setFontSize(size).run();
    setShowFontSize(false);
  };

  const cycleAlignment = () => {
    if (!editor) return;

    if (currentAlignment === 'left') {
      editor.chain().focus().setTextAlign('center').run();
      return;
    }

    if (currentAlignment === 'center') {
      editor.chain().focus().setTextAlign('right').run();
      return;
    }

    editor.chain().focus().setTextAlign('left').run();
  };

  const openColorPicker = () => {
    setShowColorPicker((prev) => {
      const next = !prev;
      if (next) {
        setPendingColor(selectedColor);
        setPendingCustomColor(selectedColor);
        setColorPickerTab('palette');
      }
      return next;
    });
    setShowFontSize(false);
  };

  return (
    <div className="bw-toolbar">
      <div className="bw-tool-dropdown-wrap">
        <EmoticonPicker onSelect={onInsertEmoticon} />
      </div>
      <span className="bw-tool-dot" />
      <button
        type="button"
        className={`bw-tool-btn ${editor?.isActive('bold') ? 'bw-tool-btn--active' : ''}`}
        title="굵게"
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
      </button>
      <button
        type="button"
        className={`bw-tool-btn ${editor?.isActive('italic') ? 'bw-tool-btn--active' : ''}`}
        title="기울임"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="4" x2="10" y2="4" />
          <line x1="14" y1="20" x2="5" y2="20" />
          <line x1="15" y1="4" x2="9" y2="20" />
        </svg>
      </button>
      <button
        type="button"
        className={`bw-tool-btn ${editor?.isActive('underline') ? 'bw-tool-btn--active' : ''}`}
        title="밑줄"
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
          <line x1="4" y1="21" x2="20" y2="21" />
        </svg>
      </button>
      <button
        type="button"
        className={`bw-tool-btn ${editor?.isActive('strike') ? 'bw-tool-btn--active' : ''}`}
        title="취소선"
        onClick={() => editor?.chain().focus().toggleStrike().run()}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="12" x2="20" y2="12" />
          <path d="M17.5 7.5C17.5 5.01 15.49 3 13 3H11C8.51 3 6.5 5.01 6.5 7.5c0 1.38.62 2.61 1.6 3.43" />
          <path d="M6.5 16.5C6.5 18.99 8.51 21 11 21h2c2.49 0 4.5-2.01 4.5-4.5 0-1.38-.62-2.61-1.6-3.43" />
        </svg>
      </button>
      <div className="bw-tool-dropdown-wrap" ref={linkPopoverWrapRef}>
        <button
          type="button"
          className={`bw-tool-btn ${editor?.isActive('link') ? 'bw-tool-btn--active' : ''}`}
          title="링크"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowFontSize(false);
            setShowColorPicker(false);
            setShowLinkPopover((prev) => !prev);
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 1 0-7.07-7.07L11 4" />
            <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L13 19" />
          </svg>
        </button>
        {showLinkPopover && (
          <div className="bw-link-popover" role="dialog" aria-label="링크 삽입">
            <label className="bw-link-popover__label">
              URL 주소
              <input
                type="text"
                className="bw-link-popover__input"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://"
              />
            </label>
            <label className="bw-link-popover__label">
              표시 텍스트
              <input
                type="text"
                className="bw-link-popover__input"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="표시할 텍스트"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onApplyLink();
                  }
                }}
              />
            </label>
            <div className="bw-link-popover__actions">
              <button
                type="button"
                className="bw-link-popover__btn bw-link-popover__btn--cancel"
                onClick={() => setShowLinkPopover(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="bw-link-popover__btn bw-link-popover__btn--confirm"
                onClick={onApplyLink}
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
      <span className="bw-tool-dot" />
      <div className="bw-tool-dropdown-wrap">
        <button
          type="button"
          className="bw-tool-btn"
          title="글자 크기"
          onClick={() => {
            setShowFontSize((prev) => !prev);
            setShowColorPicker(false);
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        </button>
        {showFontSize && (
          <div className="bw-tool-dropdown">
            {FONT_SIZE_OPTIONS.map((opt) => (
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
      <div className="bw-tool-dropdown-wrap">
        <button
          type="button"
          className="bw-tool-btn"
          title="글자 색상"
          onClick={openColorPicker}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={selectedColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3L4 21h16L12 3z" />
            <line x1="8" y1="15" x2="16" y2="15" />
          </svg>
        </button>
        {showColorPicker && (
          <div className="bw-tool-dropdown bw-color-grid">
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
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="bw-color-swatch"
                    style={{
                      background: color,
                      border:
                        pendingColor.toUpperCase() === color
                          ? '2px solid #0c0c0c'
                          : '2px solid #e5e5e5',
                    }}
                    onClick={() => {
                      setPendingColor(color);
                      setPendingCustomColor(color);
                    }}
                    title={color}
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
                      />
                      <button
                        type="button"
                        className="bw-color-eyedropper"
                        onClick={handlePickScreenColor}
                        title="화면에서 색상 추출"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 11l-6-6" />
                          <path d="M5 21l4-4" />
                          <path d="M2 22l3-1 7-7-2-2-7 7-1 3z" />
                          <path d="M14 4l6 6" />
                        </svg>
                      </button>
                    </div>
                    <div className="bw-color-recent-wrap bw-color-recent-wrap--compact">
                      {recentColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="bw-color-swatch"
                          style={{ background: color }}
                          onClick={() => {
                            setPendingColor(color);
                            setPendingCustomColor(color);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
        )}
      </div>
      <span className="bw-tool-dot" />
      <button
        type="button"
        className="bw-tool-btn"
        title="사진 첨부"
        onClick={() => imageInputRef.current?.click()}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </button>
      <button
        type="button"
        className="bw-tool-btn"
        title="파일 첨부"
        onClick={() => fileInputRef.current?.click()}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </button>
      <span className="bw-tool-dot" />
      <button
        type="button"
        className={`bw-tool-btn ${editor?.isActive('codeBlock') ? 'bw-tool-btn--active' : ''}`}
        title="코드 블록"
        onClick={onInsertCodeBlock}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </button>
      <div className="bw-tool-dropdown-wrap">
        <button
          type="button"
          className="bw-tool-btn"
          title="정렬"
          onClick={cycleAlignment}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  );
}
