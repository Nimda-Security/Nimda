import React from 'react';
import type { TagResponse } from '@/api/tag';
import { formatFileSize } from './constants';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

const isImageFile = (file: { name: string }) => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return IMAGE_EXTENSIONS.includes(ext);
};

interface AttachmentSectionProps {
  // Tags
  currentTagList: TagResponse[];
  tagId: number | null;
  setTagId: (id: number | null) => void;
  detailCategoryWarningRef: React.RefObject<HTMLParagraphElement | null>;

  // Files
  attachedFiles: { id: number; name: string; size: number; isInline?: boolean }[];
  isShopCategory: boolean;
  thumbnailAttachmentId: number | null;
  setThumbnailAttachmentId: (id: number | null) => void;
  isDragOver: boolean;
  isUploading: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handleRemoveFile: (attachmentId: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AttachmentSection({
  currentTagList,
  tagId,
  setTagId,
  detailCategoryWarningRef,
  attachedFiles,
  isShopCategory,
  thumbnailAttachmentId,
  setThumbnailAttachmentId,
  isDragOver,
  isUploading,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleRemoveFile,
  fileInputRef,
  imageInputRef,
  handleFileSelect,
  handleImageSelect,
}: AttachmentSectionProps) {
  const imageFiles = attachedFiles
    .filter(isImageFile)
    .sort((left, right) => left.id - right.id);
  const automaticThumbnailId = imageFiles[0]?.id ?? null;

  return (
    <>
      {/* ── 태그 선택 (Tag 엔티티 기반) ── */}
      <div className="bw-section">
        <span className="bw-section-label">세부 카테고리</span>
        {currentTagList.length > 0 ? (
          <div className="bw-tag-list">
            {currentTagList.map((tagOption) => (
              <button
                key={tagOption.id}
                type="button"
                className={`bw-tag-chip ${tagId === tagOption.id ? 'bw-tag-chip--active' : ''}`}
                onClick={() =>
                  setTagId(tagId === tagOption.id ? null : tagOption.id)
                }
              >
                #{tagOption.tagName}
              </button>
            ))}
          </div>
        ) : (
          <p className="bw-tag-hint">카테고리가 없습니다.</p>
        )}
        {!tagId && (
          <p
            ref={detailCategoryWarningRef}
            tabIndex={-1}
            style={{
              marginTop: '8px',
              color: '#D64454',
              fontSize: '13px',
              lineHeight: '150%',
              outline: 'none',
            }}
          >
            게시글 분류를 위한 카테고리를 선택해 주세요.
          </p>
        )}
      </div>

      <div className="bw-divider" />

      {/* ── 첨부파일 ── */}
      <div className="bw-section">
        <span className="bw-section-label">첨부파일</span>
        {isShopCategory && (
          <div className="bw-thumbnail-picker">
            <div className="bw-thumbnail-picker__header">
              <span>상품 썸네일</span>
              <small>
                사진을 클릭하면 썸네일로 지정되고, 다시 클릭하면 자동 지정으로 돌아갑니다.
              </small>
            </div>
            {imageFiles.length > 0 ? (
              <div className="bw-thumbnail-picker__grid">
                {imageFiles.map((file) => {
                  const selected = thumbnailAttachmentId === file.id;
                  const automatic = thumbnailAttachmentId == null && automaticThumbnailId === file.id;
                  return (
                    <button
                      key={file.id}
                      type="button"
                      className={`bw-thumbnail-option ${selected ? 'bw-thumbnail-option--selected' : ''} ${automatic ? 'bw-thumbnail-option--auto' : ''}`}
                      onClick={() => setThumbnailAttachmentId(selected ? null : file.id)}
                    >
                      <img
                        src={`/api/cite/attachments/${file.id}/download?disposition=inline`}
                        alt={file.name}
                      />
                      {(selected || automatic) && (
                        <span>{selected ? '썸네일' : '자동 썸네일'}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="bw-tag-hint">마일리지 상점 상품은 이미지 첨부가 필요합니다.</p>
            )}
          </div>
        )}
        {attachedFiles.some((f) => !f.isInline) && (
          <div className="bw-file-list">
            {attachedFiles
              .filter((f) => !f.isInline)
              .map((f) => (
                <div key={f.id} className="bw-file-selected">
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="bw-file-name">{f.name}</span>
                  <span className="bw-file-size">
                    {formatFileSize(f.size)}
                  </span>
                  <button
                    type="button"
                    className="bw-file-remove"
                    onClick={() => handleRemoveFile(f.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        )}
        <div
          className={`bw-dropzone ${isDragOver ? 'bw-dropzone--active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <p className="bw-dropzone-text">업로드 중...</p>
          ) : (
            <>
              <svg
                className="bw-dropzone-icon"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
              <p className="bw-dropzone-text">
                파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="bw-dropzone-hint">
                최대 10MB &nbsp;·&nbsp; 여러 파일 동시 업로드 가능
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
      </div>
    </>
  );
}
