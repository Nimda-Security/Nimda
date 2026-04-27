import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { createBoardAPI, getBoardDetailAPI, updateBoardAPI } from '@/api/board';
import { uploadBoardFileViaS3 } from '@/api/attachments';
import { getAllCategoriesAPI } from '@/api/category';
import { getTagsByCategoryAPI } from '@/api/tag';
import type { TagResponse } from '@/api/tag';
import { isAdmin, hasRole } from '@/utils/jwt';
import { highlightCodeBlocks } from '@/utils/codeHighlight';
import { getEmoticonSrc } from '@/domains/Comment/EmoticonPicker';
import type { Category } from '../types';

import type {
  ColorPickerTab,
  EyeDropperApi,
  ImageResizeHandle,
  ImageResizeSession,
} from './constants';

import {
  getSanitizedEditorHtml,
  sanitizeEditorDom,
  normalizeFontSizeValue,
  isEditorVisuallyEmpty,
  getClosestWithinEditor,
  placeCaretAtNodeStart,
  getSelectionOffsetsInElement,
  setSelectionInElementByOffset,
  readCurrentColor as readCurrentColorUtil,
  findAnchorFromNode,
  normalizeLinkUrl,
} from './editorUtils';

import {
  getCodeElementInPre,
  syncCodeBlockEmptyState,
  ensureCodeLanguageSelector,
  refreshCodeBlockHighlight,
  updateCodeBlockLanguage,
  getCurrentPreElement,
  applyCodeLanguage as applyCodeLanguageUtil,
} from './codeBlockUtils';

import { getCodeLanguageLabel } from './constants';

import CategorySelector from './CategorySelector';
import Toolbar from './Toolbar';
import AttachmentSection from './AttachmentSection';

function BoardWritePage() {
  const navigate = useNavigate();
  const { boardType: paramBoardType, id: editId } = useParams<{
    boardType: string;
    id: string;
  }>();
  const isEditMode = !!editId;
  const slug = paramBoardType?.toLowerCase() || 'news';

  // ── Category state ──
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [showSubDropdown, setShowSubDropdown] = useState(false);

  // ── Post state ──
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagId, setTagId] = useState<number | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<
    { id: number; name: string; size: number; isInline?: boolean }[]
  >([]);
  const [editBoardId, setEditBoardId] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [currentTagList, setCurrentTagList] = useState<TagResponse[]>([]);

  // ── Toolbar state ──
  const [showFontSize, setShowFontSize] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');
  const [isLinkActive, setIsLinkActive] = useState(false);
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

  // ── Refs ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const linkPopoverWrapRef = useRef<HTMLDivElement>(null);
  const savedLinkRangeRef = useRef<Range | null>(null);
  const detailCategoryWarningRef = useRef<HTMLParagraphElement>(null);
  const isComposingRef = useRef(false);
  const justEndedCompositionRef = useRef(false);
  const editorSurfaceRef = useRef<HTMLDivElement>(null);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const resizeSessionRef = useRef<ImageResizeSession | null>(null);
  const [selectedImageRect, setSelectedImageRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [resizeTooltip, setResizeTooltip] = useState<string>('');

  // ── Image resize helpers ──

  const clearSelectedImage = () => {
    if (selectedImageRef.current) {
      selectedImageRef.current.classList.remove('bw-resizable-image--selected');
    }
    selectedImageRef.current = null;
    setSelectedImageRect(null);
    setResizeTooltip('');
    resizeSessionRef.current = null;
  };

  const updateSelectedImageRect = () => {
    const img = selectedImageRef.current;
    const surface = editorSurfaceRef.current;
    if (!img || !surface || !surface.contains(img)) {
      clearSelectedImage();
      return;
    }

    const imgRect = img.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();

    setSelectedImageRect({
      left: imgRect.left - surfaceRect.left,
      top: imgRect.top - surfaceRect.top,
      width: imgRect.width,
      height: imgRect.height,
    });

    const percent = Math.max(
      1,
      Math.round((imgRect.width / Math.max(1, surface.clientWidth)) * 100)
    );
    setResizeTooltip(
      `${Math.round(imgRect.width)}×${Math.round(imgRect.height)}px (${percent}%)`
    );
  };

  const selectImage = (img: HTMLImageElement) => {
    if (selectedImageRef.current && selectedImageRef.current !== img) {
      selectedImageRef.current.classList.remove('bw-resizable-image--selected');
    }
    selectedImageRef.current = img;
    img.classList.add('bw-resizable-image--selected');
    updateSelectedImageRect();
  };

  const startImageResize = (
    handle: ImageResizeHandle,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const img = selectedImageRef.current;
    if (!img || !selectedImageRect) return;

    const width = selectedImageRect.width || img.offsetWidth;
    const height = selectedImageRect.height || img.offsetHeight;
    if (width <= 0 || height <= 0) return;

    resizeSessionRef.current = {
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: width,
      startHeight: height,
      startLeft: selectedImageRect.left,
      startTop: selectedImageRect.top,
      aspectRatio: width / height,
    };
  };

  // ── Editor content helpers ──

  const getEditorContent = () => {
    const editor = contentRef.current;
    if (!editor) return '';
    return getSanitizedEditorHtml(editor);
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

  // ── Content sync effect ──
  useEffect(() => {
    syncEditorEmptyState();
    if (isComposingRef.current || justEndedCompositionRef.current) {
      return;
    }
    if (contentRef.current && !getCurrentPreElement(contentRef.current)) {
      highlightCodeBlocks(contentRef.current);
    }
  }, [content]);

  // ── Image resize: global pointer move/up ──
  useEffect(() => {
    const handleGlobalPointerMove = (e: MouseEvent) => {
      const session = resizeSessionRef.current;
      const img = selectedImageRef.current;
      const surface = editorSurfaceRef.current;
      if (!session || !img || !surface) return;

      e.preventDefault();

      const isWest = session.handle === 'nw' || session.handle === 'sw';
      const isNorth = session.handle === 'nw' || session.handle === 'ne';

      const dx = e.clientX - session.startX;
      const dy = e.clientY - session.startY;
      const signedDx = isWest ? -dx : dx;
      const signedDy = isNorth ? -dy : dy;

      const minWidth = 80;
      const maxWidth = Math.max(minWidth, surface.clientWidth);

      const widthFromDx = Math.max(
        minWidth,
        Math.min(maxWidth, session.startWidth + signedDx)
      );
      const heightFromDy = Math.max(
        minWidth / session.aspectRatio,
        session.startHeight + signedDy
      );

      let nextWidth: number;
      if (
        Math.abs(dx / Math.max(1, session.startWidth)) >=
        Math.abs(dy / Math.max(1, session.startHeight))
      ) {
        nextWidth = widthFromDx;
      } else {
        nextWidth = Math.max(
          minWidth,
          Math.min(maxWidth, heightFromDy * session.aspectRatio)
        );
      }
      const nextHeight = nextWidth / session.aspectRatio;

      const nextLeft = isWest
        ? session.startLeft + (session.startWidth - nextWidth)
        : session.startLeft;
      const nextTop = isNorth
        ? session.startTop + (session.startHeight - nextHeight)
        : session.startTop;

      img.style.width = `${Math.round(nextWidth)}px`;
      img.style.height = `${Math.round(nextHeight)}px`;
      img.style.maxWidth = '100%';
      img.setAttribute('width', String(Math.round(nextWidth)));
      img.setAttribute('height', String(Math.round(nextHeight)));

      setSelectedImageRect({
        left: nextLeft,
        top: nextTop,
        width: nextWidth,
        height: nextHeight,
      });
      const percent = Math.max(
        1,
        Math.round((nextWidth / Math.max(1, surface.clientWidth)) * 100)
      );
      setResizeTooltip(
        `${Math.round(nextWidth)}×${Math.round(nextHeight)}px (${percent}%)`
      );
    };

    const handleGlobalPointerUp = () => {
      if (!resizeSessionRef.current) return;
      resizeSessionRef.current = null;
      setContent(getEditorContent());
      updateSelectedImageRect();
    };

    document.addEventListener('mousemove', handleGlobalPointerMove);
    document.addEventListener('mouseup', handleGlobalPointerUp);
    return () => {
      document.removeEventListener('mousemove', handleGlobalPointerMove);
      document.removeEventListener('mouseup', handleGlobalPointerUp);
    };
  }, []);

  // ── Outside click / window resize for image deselect ──
  useEffect(() => {
    const handleOutsideMouseDown = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;

      const surface = editorSurfaceRef.current;
      if (!surface) return;
      if (surface.contains(target)) return;
      clearSelectedImage();
    };

    const handleWindowResize = () => {
      if (!selectedImageRef.current) return;
      updateSelectedImageRect();
    };

    document.addEventListener('mousedown', handleOutsideMouseDown);
    window.addEventListener('resize', handleWindowResize);
    return () => {
      document.removeEventListener('mousedown', handleOutsideMouseDown);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // ── Native beforeinput handler to fix RTL text input in code blocks ──
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
      if (
        e.isComposing ||
        isComposingRef.current ||
        justEndedCompositionRef.current
      ) {
        return;
      }
      if (e.inputType !== 'insertText' || !e.data) return;

      const editorEl = contentRef.current;
      const selection = window.getSelection();
      if (!editorEl || !selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (!editorEl.contains(range.commonAncestorContainer)) return;

      if (e.data === ' ') {
        const currentBlock = getClosestWithinEditor(
          range.startContainer,
          editorEl,
          'p,div'
        ) as HTMLElement | null;

        if (
          currentBlock &&
          !getClosestWithinEditor(
            range.startContainer,
            editorEl,
            'pre,code,table,li'
          )
        ) {
          const nodeText =
            range.startContainer.nodeType === Node.TEXT_NODE
              ? (range.startContainer.textContent ?? '')
              : '';
          const blockText =
            currentBlock.textContent?.replace(/\u00A0/g, ' ') ?? '';
          const isOnlyDashBlock = blockText.trim() === '-';
          const isDashNode = nodeText === '-' || nodeText === '- ';
          const isCaretAfterDash =
            range.startContainer.nodeType === Node.TEXT_NODE
              ? range.startOffset >= 1
              : true;

          if (isOnlyDashBlock && isDashNode && isCaretAfterDash) {
            e.preventDefault();
            const ul = document.createElement('ul');
            ul.className = 'list-disc list-inside pl-4 my-1';
            const li = document.createElement('li');
            li.className = 'my-0.5';
            li.innerHTML = '<br>';
            ul.appendChild(li);
            currentBlock.replaceWith(ul);
            placeCaretAtNodeStart(li);
            setContent(getEditorContent());
            syncEditorEmptyState();
            return;
          }
        }
      }

      const currentPre = getCurrentPreElement(editorEl);
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

      const imageTarget = rawTarget.closest('img');
      if (
        imageTarget instanceof HTMLImageElement &&
        editor.contains(imageTarget)
      ) {
        selectImage(imageTarget);
      } else if (!rawTarget.closest('.bw-image-resize-overlay')) {
        clearSelectedImage();
      }

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
      if (!getCurrentPreElement(editor)) {
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

  // ── Load all categories ──
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const categories = await getAllCategoriesAPI();
        setAllCategories(categories);
      } catch (err) {
        console.error('카테고리 목록 로드 오류:', err);
      }
    };
    fetchAllCategories();
  }, []);

  // ── Initial board setup from URL slug ──
  useEffect(() => {
    if (allCategories.length === 0) return;

    const matchedCategory = allCategories.find((c) => c.slug === slug);
    const isBannerCategory = matchedCategory
      ? matchedCategory.slug === 'banner' ||
        (matchedCategory.parentId != null &&
          allCategories.find((c) => c.id === matchedCategory.parentId)?.slug ===
            'banner')
      : slug === 'banner';

    if (isBannerCategory && !isAdmin()) {
      alert('배너 게시판은 관리자만 작성할 수 있습니다.');
      navigate('/board/banner');
      return;
    }

    // 수정 모드: 게시글 데이터 로드
    if (isEditMode && editId) {
      const loadBoard = async () => {
        try {
          const res = await getBoardDetailAPI(parseInt(editId));
          if (res.success && 'board' in res) {
            const b = res.board;
            setEditBoardId(b.id);
            setTitle(b.title);
            setTagId(b.tag?.id ?? null);
            setIsPinned(b.pinned || false);
            if (b.attachments && b.attachments.length > 0) {
              setAttachedFiles(
                b.attachments.map((a) => ({
                  id: a.id,
                  name: a.originFilename || 'file',
                  size: a.fileSize || 0,
                }))
              );
            }
            // 카테고리 설정
            if (b.category) {
              if (b.category.parentId) {
                setParentCategoryId(b.category.parentId);
                setSubCategoryId(b.category.id);
              } else {
                setParentCategoryId(b.category.id);
                setSubCategoryId(b.category.id);
              }
            }
            // contentEditable에 기존 HTML 삽입
            if (contentRef.current) {
              contentRef.current.innerHTML = b.content;
              setContent(b.content);
            }
          }
        } catch {
          setError('게시글을 불러오는 중 오류가 발생했습니다.');
        }
      };
      loadBoard();
      return;
    }

    const fetchInitial = async () => {
      const cat = allCategories.find((c) => c.slug === slug);
      if (cat) {
        if (cat.parentId) {
          setParentCategoryId(cat.parentId);
          setSubCategoryId(cat.id);
        } else {
          setParentCategoryId(cat.id);
          const children = allCategories.filter((c) => c.parentId === cat.id);
          if (children.length > 0) {
            setSubCategoryId(children[0].id);
          } else {
            setSubCategoryId(cat.id);
          }
        }
      }
    };
    fetchInitial();
  }, [allCategories, slug]);

  // ── Derived category data ──
  const rootCategories = allCategories
    .filter((c) => c.parentId === null && c.isActive)
    .filter((c) => !['바로가기', '대회'].includes(c.name))
    .filter((c) => c.name !== '새 소식' || isAdmin())
    .filter((c) => c.name !== '카르텔' || hasRole('ROLE_CARTEL') || isAdmin());
  const currentParentCat = allCategories.find((c) => c.id === parentCategoryId);
  const subCategories = allCategories.filter(
    (c) => c.parentId === parentCategoryId && c.isActive
  );
  const currentSubCat = allCategories.find((c) => c.id === subCategoryId);

  // ── Fetch tags for selected category ──
  useEffect(() => {
    const targetCat = currentSubCat || currentParentCat;
    if (!targetCat?.id) {
      setCurrentTagList([]);
      return;
    }
    let cancelled = false;
    const fetchTags = async () => {
      try {
        const tags = await getTagsByCategoryAPI(targetCat.id);
        if (!cancelled) setCurrentTagList(tags);
      } catch {
        if (!cancelled) setCurrentTagList([]);
      }
    };
    fetchTags();
    return () => {
      cancelled = true;
    };
  }, [currentSubCat?.id, currentParentCat?.id]);

  // ── Submit handler ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetCategoryId = subCategoryId || parentCategoryId;

    if (!title.trim() || !content.replace(/<[^>]*>/g, '').trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }
    if (!targetCategoryId) {
      setError('카테고리를 선택해주세요.');
      return;
    }
    if (currentTagList.length > 0 && tagId === null) {
      setError(null);
      requestAnimationFrame(() => {
        detailCategoryWarningRef.current?.focus();
        detailCategoryWarningRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const attachmentIds: number[] | undefined =
        attachedFiles.length > 0 ? attachedFiles.map((f) => f.id) : undefined;

      // 수정 모드
      if (isEditMode && editBoardId) {
        const response = await updateBoardAPI(editBoardId, {
          categoryId: targetCategoryId,
          title: title.trim(),
          content,
          tagId: tagId ?? undefined,
          attachmentIds,
          ...(isAdmin() && { pinned: isPinned }),
        });
        if (response.success && 'board' in response) {
          const boardSlug = response.board.category?.slug || slug;
          navigate(`/board/${boardSlug}/${editBoardId}`);
        } else {
          setError(response.message || '게시글 수정에 실패했습니다.');
        }
        return;
      }

      // 작성 모드
      const response = await createBoardAPI({
        categoryId: targetCategoryId,
        title: title.trim(),
        content,
        tagId: tagId ?? undefined,
        attachmentIds,
      });

      if (response.success && 'board' in response) {
        const writtenCategory = allCategories.find(
          (cat) => cat.id === targetCategoryId
        );
        const categorySlug = writtenCategory?.slug || slug;
        navigate(`/board/${categorySlug}/${response.board.id}`);
      } else {
        setError(response.message || '게시글 작성에 실패했습니다.');
      }
    } catch {
      setError(
        isEditMode
          ? '게시글 수정 중 오류가 발생했습니다.'
          : '게시글 작성 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 사라집니다. 정말 나가시겠습니까?')) {
      const cat = allCategories.find(
        (c) => c.id === (subCategoryId || parentCategoryId)
      );
      navigate(`/board/${cat?.slug || slug}`);
    }
  };

  // ── Image / file upload handlers ──
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    const targetCategoryId = subCategoryId || parentCategoryId;
    if (!targetCategoryId) {
      setError('카테고리를 먼저 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setError(null);
    for (const f of Array.from(selectedFiles)) {
      const result = await uploadBoardFileViaS3(f, targetCategoryId);
      if (result.ok) {
        setAttachedFiles((prev) => [
          ...prev,
          {
            id: result.attachmentId,
            name: f.name,
            size: f.size,
            isInline: true,
          },
        ]);
        const imgUrl = `/api/cite/attachments/${result.attachmentId}/download?disposition=inline`;
        const safeAlt = f.name
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        contentRef.current?.focus();
        document.execCommand(
          'insertHTML',
          false,
          `<img src="${imgUrl}" alt="${safeAlt}" style="max-width:100%;margin:8px 0;border-radius:8px;" /><br>`
        );
        setContent(getEditorContent());
      } else {
        setError(result.message);
        break;
      }
    }
    setIsUploading(false);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    const targetCategoryId = subCategoryId || parentCategoryId;
    if (!targetCategoryId) {
      setError('카테고리를 먼저 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setError(null);
    for (const f of Array.from(selectedFiles)) {
      const result = await uploadBoardFileViaS3(f, targetCategoryId);
      if (result.ok) {
        setAttachedFiles((prev) => [
          ...prev,
          { id: result.attachmentId, name: f.name, size: f.size },
        ]);
      } else {
        setError(result.message);
        break;
      }
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (attachmentId: number) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== attachmentId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    const targetCategoryId = subCategoryId || parentCategoryId;
    if (!targetCategoryId) {
      setError('카테고리를 먼저 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setError(null);
    for (const f of Array.from(droppedFiles)) {
      const isImage = f.type.startsWith('image/');
      const result = await uploadBoardFileViaS3(f, targetCategoryId);
      if (result.ok) {
        setAttachedFiles((prev) => [
          ...prev,
          {
            id: result.attachmentId,
            name: f.name,
            size: f.size,
            isInline: isImage,
          },
        ]);
        if (isImage) {
          const imgUrl = `/api/cite/attachments/${result.attachmentId}/download?disposition=inline`;
          const safeAlt = f.name
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          contentRef.current?.focus();
          document.execCommand(
            'insertHTML',
            false,
            `<img src="${imgUrl}" alt="${safeAlt}" style="max-width:100%;margin:8px 0;border-radius:8px;" /><br>`
          );
          setContent(getEditorContent());
        }
      } else {
        setError(result.message);
        break;
      }
    }
    setIsUploading(false);
  };

  // ── Toolbar action helpers ──

  const applyFormat = (
    format: 'bold' | 'italic' | 'underline' | 'strikeThrough'
  ) => {
    contentRef.current?.focus();
    document.execCommand(format, false);
  };

  const applyFontSize = (size: string) => {
    contentRef.current?.focus();
    const currentColor = readCurrentColorUtil();
    const normalizedSize = normalizeFontSizeValue(size);
    document.execCommand('fontSize', false, '7');
    const editor = contentRef.current;
    if (editor) {
      const fonts = editor.querySelectorAll('font[size="7"]');
      fonts.forEach((font) => {
        const span = document.createElement('span');
        span.style.fontSize = normalizedSize;
        span.style.color = currentColor;
        span.innerHTML = font.innerHTML;
        font.parentNode?.replaceChild(span, font);
      });
      sanitizeEditorDom(editor);
      setContent(getEditorContent());
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
        5
      );
    });
  };

  const handlePickScreenColor = async () => {
    const EyeDropperCtor = (
      window as unknown as { EyeDropper?: new () => EyeDropperApi }
    ).EyeDropper;
    if (!EyeDropperCtor) return;

    try {
      const eyeDropper = new EyeDropperCtor();
      const result = await eyeDropper.open();
      const picked = result.sRGBHex.toUpperCase();
      setPendingCustomColor(picked);
      setPendingColor(picked);
    } catch (error) {
      console.debug('EyeDropper was dismissed or unavailable.', error);
    }
  };

  const readCurrentColor = () => {
    contentRef.current?.focus();
    return readCurrentColorUtil();
  };

  // ── Link helpers ──

  const updateLinkActiveState = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setIsLinkActive(false);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!contentRef.current?.contains(range.commonAncestorContainer)) {
      setIsLinkActive(false);
      return;
    }

    const anchor = findAnchorFromNode(selection.anchorNode, contentRef.current);
    setIsLinkActive(!!anchor);
  };

  const openLinkPopover = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !contentRef.current) {
      setLinkUrl('https://');
      setLinkText('');
      setShowLinkPopover(true);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!contentRef.current.contains(range.commonAncestorContainer)) {
      contentRef.current.focus();
      setLinkUrl('https://');
      setLinkText('');
      setShowLinkPopover(true);
      return;
    }

    savedLinkRangeRef.current = range.cloneRange();
    const selectedText = range.toString().trim();
    const anchor = findAnchorFromNode(selection.anchorNode, contentRef.current);

    setLinkUrl(anchor?.getAttribute('href') || 'https://');
    setLinkText(anchor?.textContent || selectedText);
    setShowLinkPopover(true);
  };

  const applyLink = () => {
    const editor = contentRef.current;
    if (!editor) return;

    const normalizedUrl = normalizeLinkUrl(linkUrl);
    if (!normalizedUrl) {
      setShowLinkPopover(false);
      return;
    }

    editor.focus();

    const selection = window.getSelection();
    const savedRange = savedLinkRangeRef.current;
    if (!selection || !savedRange) {
      setShowLinkPopover(false);
      return;
    }

    selection.removeAllRanges();
    selection.addRange(savedRange);

    const activeAnchor = findAnchorFromNode(selection.anchorNode, editor);
    if (activeAnchor && savedRange.collapsed) {
      activeAnchor.setAttribute('href', normalizedUrl);
      activeAnchor.setAttribute('target', '_blank');
      activeAnchor.setAttribute('rel', 'noopener noreferrer');
      if (linkText.trim()) {
        activeAnchor.textContent = linkText.trim();
      }
      setContent(getEditorContent());
      setShowLinkPopover(false);
      updateLinkActiveState();
      return;
    }

    const selectedText = savedRange.toString().trim();
    const label = linkText.trim() || selectedText || normalizedUrl;
    const a = document.createElement('a');
    a.href = normalizedUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = label;

    savedRange.deleteContents();
    savedRange.insertNode(a);

    const rangeAfter = document.createRange();
    rangeAfter.setStartAfter(a);
    rangeAfter.collapse(true);
    selection.removeAllRanges();
    selection.addRange(rangeAfter);

    setContent(getEditorContent());
    setShowLinkPopover(false);
    updateLinkActiveState();
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      updateLinkActiveState();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  useEffect(() => {
    if (!showLinkPopover) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        linkPopoverWrapRef.current &&
        !linkPopoverWrapRef.current.contains(e.target as Node)
      ) {
        setShowLinkPopover(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showLinkPopover]);

  // ── Emoticon handler ──

  const handleToolbarEmoticonSelect = (marker: string) => {
    const editor = contentRef.current;
    if (!editor) return;

    const id = marker.match(/\[nimda:(\d{2})\]/)?.[1];
    if (!id) return;

    const img = document.createElement('img');
    img.src = getEmoticonSrc(id);
    img.alt = marker;
    img.dataset.emoticonId = id;
    img.className = 'comment-emoticon-inline';
    img.draggable = false;

    const moveCaretAfter = (node: Node) => {
      const range = document.createRange();
      range.setStartAfter(node);
      range.collapse(true);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    };

    const sel = window.getSelection();
    if (
      sel &&
      sel.rangeCount > 0 &&
      editor.contains(sel.getRangeAt(0).commonAncestorContainer)
    ) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(img);
      moveCaretAfter(img);
    } else {
      editor.appendChild(img);
      moveCaretAfter(img);
    }

    setContent(getEditorContent());
    syncEditorEmptyState();
  };

  // ── Alignment ──

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

  // ── Code language (delegates to codeBlockUtils) ──
  const handleApplyCodeLanguage = (language: string) => {
    applyCodeLanguageUtil(language, contentRef, getEditorContent, setContent);
  };

  // ── Editor key-down handler ──

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const nativeEvent = e.nativeEvent as KeyboardEvent;
    const isImeComposingNow =
      nativeEvent.isComposing ||
      isComposingRef.current ||
      nativeEvent.keyCode === 229;

    if (e.key === 'Enter' && isImeComposingNow) {
      return;
    }

    const editor = contentRef.current;
    if (!editor) return;

    const targetNode = e.target as Node;

    const currentLi = getClosestWithinEditor(targetNode, editor, 'li');
    if (currentLi instanceof HTMLLIElement) {
      const liText = currentLi.textContent?.replace(/\u00A0/g, '').trim() ?? '';
      const isLiEmpty = liText.length === 0;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (isLiEmpty) {
          const list = currentLi.closest('ul,ol');
          const paragraph = document.createElement('p');
          paragraph.innerHTML = '<br>';
          if (list) {
            list.insertAdjacentElement('afterend', paragraph);
            currentLi.remove();
            if (!list.querySelector('li')) list.remove();
          } else {
            currentLi.replaceWith(paragraph);
          }
          placeCaretAtNodeStart(paragraph);
        } else {
          const nextLi = document.createElement('li');
          nextLi.innerHTML = '<br>';
          currentLi.insertAdjacentElement('afterend', nextLi);
          placeCaretAtNodeStart(nextLi);
        }
        setContent(getEditorContent());
        syncEditorEmptyState();
        return;
      }

      if (e.key === 'Backspace') {
        const selection = window.getSelection();
        const range =
          selection && selection.rangeCount > 0
            ? selection.getRangeAt(0)
            : null;
        const isCollapsedAtLiStart =
          !!range &&
          range.collapsed &&
          range.startContainer === currentLi.firstChild &&
          range.startOffset === 0;

        if (isLiEmpty || isCollapsedAtLiStart) {
          e.preventDefault();

          const list = currentLi.closest('ul,ol');
          const paragraph = document.createElement('p');
          paragraph.innerHTML = '<br>';

          if (list && list.children.length === 1) {
            list.replaceWith(paragraph);
          } else if (list) {
            list.insertAdjacentElement('afterend', paragraph);
            currentLi.remove();
          } else {
            currentLi.replaceWith(paragraph);
          }

          placeCaretAtNodeStart(paragraph);
          setContent(getEditorContent());
          syncEditorEmptyState();
          return;
        }
      }
    }

    const currentPre = getCurrentPreElement(editor);

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
            const lineStartIdx = text.lastIndexOf('\n', start - 1) + 1;
            const beforeCaret = text.slice(lineStartIdx, start);
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
          const cursorOffsets = getSelectionOffsetsInElement(code);
          if (cursorOffsets && cursorOffsets.start === 0 && cursorOffsets.end === 0) {
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

    if (!currentPre && e.key === 'Enter') {
      requestAnimationFrame(() => {
        const editorEl = contentRef.current;
        if (!editorEl) return;
        sanitizeEditorDom(editorEl);
        setContent(getEditorContent());
      });
    }
  };

  // ── Render ──
  return (
    <Layout hideSidebar={true}>
      <div className="bw-page">
        <form onSubmit={handleSubmit} className="bw-container">
          {/* ── 상단: 대분류 + 소분류 게시판 선택 ── */}
          <CategorySelector
            allCategories={allCategories}
            rootCategories={rootCategories}
            parentCategoryId={parentCategoryId}
            subCategoryId={subCategoryId}
            showParentDropdown={showParentDropdown}
            showSubDropdown={showSubDropdown}
            currentParentCat={currentParentCat}
            currentSubCat={currentSubCat}
            subCategories={subCategories}
            setParentCategoryId={setParentCategoryId}
            setSubCategoryId={setSubCategoryId}
            setShowParentDropdown={setShowParentDropdown}
            setShowSubDropdown={setShowSubDropdown}
            setTagId={setTagId}
          />

          <div className="bw-divider" />
          <div className="bw-title-area">
            <input
              id="bw-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요."
              className="bw-title-input"
              maxLength={200}
              required
            />
          </div>

          <div className="bw-divider" />

          {/* ── 툴바 ── */}
          <Toolbar
            applyFormat={applyFormat}
            showFontSize={showFontSize}
            setShowFontSize={setShowFontSize}
            applyFontSize={applyFontSize}
            showColorPicker={showColorPicker}
            setShowColorPicker={setShowColorPicker}
            selectedColor={selectedColor}
            colorPickerTab={colorPickerTab}
            setColorPickerTab={setColorPickerTab}
            pendingColor={pendingColor}
            setPendingColor={setPendingColor}
            pendingCustomColor={pendingCustomColor}
            setPendingCustomColor={setPendingCustomColor}
            recentColors={recentColors}
            applyColor={applyColor}
            pushRecentColor={pushRecentColor}
            handlePickScreenColor={handlePickScreenColor}
            readCurrentColor={readCurrentColor}
            showLinkPopover={showLinkPopover}
            setShowLinkPopover={setShowLinkPopover}
            linkUrl={linkUrl}
            setLinkUrl={setLinkUrl}
            linkText={linkText}
            setLinkText={setLinkText}
            isLinkActive={isLinkActive}
            linkPopoverWrapRef={linkPopoverWrapRef}
            openLinkPopover={openLinkPopover}
            applyLink={applyLink}
            imageInputRef={imageInputRef}
            fileInputRef={fileInputRef}
            applyCodeLanguage={handleApplyCodeLanguage}
            currentAlignment={currentAlignment}
            cycleAlignment={cycleAlignment}
            handleToolbarEmoticonSelect={handleToolbarEmoticonSelect}
          />

          <div className="bw-divider" />

          {/* ── 내용 ── */}
          <div className="bw-editor-surface" ref={editorSurfaceRef}>
            <div
              ref={contentRef}
              id="bw-content"
              contentEditable
              dir="ltr"
              spellCheck={false}
              className="bw-content-input"
              data-placeholder="내용을 입력하세요."
              data-empty="true"
              onKeyDown={handleEditorKeyDown}
              onInput={() => {
                setContent(getEditorContent());
                syncEditorEmptyState();

                if (isComposingRef.current || justEndedCompositionRef.current) {
                  return;
                }

                if (contentRef.current && !getCurrentPreElement(contentRef.current)) {
                  setTimeout(
                    () =>
                      highlightCodeBlocks(contentRef.current as HTMLElement),
                    0
                  );
                }
                updateSelectedImageRect();
              }}
            />
            {selectedImageRect && selectedImageRef.current && (
              <div
                className="bw-image-resize-overlay"
                style={{
                  left: selectedImageRect.left,
                  top: selectedImageRect.top,
                  width: selectedImageRect.width,
                  height: selectedImageRect.height,
                }}
              >
                <div className="bw-image-resize-tooltip">{resizeTooltip}</div>
                {(['nw', 'ne', 'sw', 'se'] as const).map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    className={`bw-image-resize-handle bw-image-resize-handle--${handle}`}
                    onMouseDown={(e) => startImageResize(handle, e)}
                    aria-label={`이미지 크기 조절 (${handle})`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bw-divider" />

          <AttachmentSection
            currentTagList={currentTagList}
            tagId={tagId}
            setTagId={setTagId}
            detailCategoryWarningRef={detailCategoryWarningRef}
            attachedFiles={attachedFiles}
            isDragOver={isDragOver}
            isUploading={isUploading}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleRemoveFile={handleRemoveFile}
            fileInputRef={fileInputRef}
            imageInputRef={imageInputRef}
            handleFileSelect={handleFileSelect}
            handleImageSelect={handleImageSelect}
          />

          {error && <div className="bw-error">{error}</div>}

          <div className="bw-divider" />

          {/* ── 버튼 ── */}
          <div className="bw-actions">
            <button
              type="button"
              className="bw-btn bw-btn--cancel"
              onClick={handleCancel}
            >
              취소
            </button>
            <button
              type="submit"
              className="bw-btn bw-btn--submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? '수정 중...'
                  : '등록 중...'
                : isEditMode
                  ? '수정'
                  : '등록'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default BoardWritePage;
