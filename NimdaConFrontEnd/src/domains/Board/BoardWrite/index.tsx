import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { createBoardAPI, getBoardDetailAPI, updateBoardAPI } from '@/api/board';
import { uploadBoardFileViaS3 } from '@/api/attachments';
import { getAllCategoriesAPI } from '@/api/category';
import { getTagsByCategoryAPI } from '@/api/tag';
import type { TagResponse } from '@/api/tag';
import ChevronDown from '@/components/icons/ChevronDown';
import { isAdmin, hasRole } from '@/utils/jwt';
import { highlightCodeBlocks } from '@/utils/codeHighlight';
import InlineColorPicker from '@/components/InlineColorPicker';
import EmoticonPicker, {
  getEmoticonSrc,
} from '@/domains/Comment/EmoticonPicker';
import type { Category } from '../types';

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

function BoardWritePage() {
  const navigate = useNavigate();
  const { boardType: paramBoardType, id: editId } = useParams<{
    boardType: string;
    id: string;
  }>();
  const isEditMode = !!editId;
  const slug = paramBoardType?.toLowerCase() || 'news';

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [showSubDropdown, setShowSubDropdown] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<
    { id: number; name: string; size: number; isInline?: boolean }[]
  >([]);
  const [editBoardId, setEditBoardId] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const [isPinned, setIsPinned] = useState(false);
  const [currentTagList, setCurrentTagList] = useState<TagResponse[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const linkPopoverWrapRef = useRef<HTMLDivElement>(null);
  const savedLinkRangeRef = useRef<Range | null>(null);
  const detailCategoryWarningRef = useRef<HTMLParagraphElement>(null);
  const isComposingRef = useRef(false);
  const justEndedCompositionRef = useRef(false);

  // contentEditable에서 HTML 추출
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

  // 모든 카테고리 로드
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

  // URL slug에 따른 초기 게시판 설정
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
            setTag(b.tag || '');
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
          // 만약 slug가 하위 카테고리라면 부모를 상단에, 자기자신을 하단에 설정
          setParentCategoryId(cat.parentId);
          setSubCategoryId(cat.id);
        } else {
          // slug가 상위 카테고리라면 상단에 설정, 하단은 첫 번째 자식으로 초기화 시도
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

  // 현재 선택된 카테고리의 태그를 Tag API에서 조회
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
    return () => { cancelled = true; };
  }, [currentSubCat?.id, currentParentCat?.id]);

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
    if (currentTagList.length > 0 && !tag.trim()) {
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
          tag: tag.trim() || undefined,
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
        tag: tag.trim() || undefined,
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

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
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

  // 텍스트 포맷팅 (bold, italic, underline, strikeThrough)
  const applyFormat = (
    format: 'bold' | 'italic' | 'underline' | 'strikeThrough'
  ) => {
    contentRef.current?.focus();
    document.execCommand(format, false);
  };

  const applyFontSize = (size: string) => {
    contentRef.current?.focus();
    const selectedColor = readCurrentColor();
    // execCommand fontSize uses 1-7 scale, so we use formatBlock + span approach
    document.execCommand('fontSize', false, '7');
    // Replace the generated <font size="7"> with a span that has the actual px size
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
      window as unknown as { EyeDropper?: new () => EyeDropperApi }
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

  const findAnchorFromNode = (node: Node | null) => {
    let current = node;
    while (current && current !== contentRef.current) {
      if (current instanceof HTMLAnchorElement) return current;
      current = current.parentNode;
    }
    return null;
  };

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

    const anchor = findAnchorFromNode(selection.anchorNode);
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
    const anchor = findAnchorFromNode(selection.anchorNode);

    setLinkUrl(anchor?.getAttribute('href') || 'https://');
    setLinkText(anchor?.textContent || selectedText);
    setShowLinkPopover(true);
  };

  const normalizeLinkUrl = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
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

    const activeAnchor = findAnchorFromNode(selection.anchorNode);
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
    pre.style.unicodeBidi = 'embed';
    code.style.unicodeBidi = 'embed';
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

  return (
    <Layout hideSidebar={true}>
      <div className="bw-page">
        <form onSubmit={handleSubmit} className="bw-container">
          {/* ── 상단: 대분류 + 소분류 게시판 선택 ── */}
          <div className="bw-top-bar">
            {/* 대분류 */}
            <span className="bw-label">게시판</span>
            <div
              className="bw-category-selector"
              onClick={() => {
                setShowParentDropdown((p) => !p);
                setShowSubDropdown(false);
              }}
            >
              <span className="bw-category-selected">
                {currentParentCat ? currentParentCat.name : '선택하세요'}
              </span>
              <span
                className={`bw-chevron ${showParentDropdown ? 'bw-chevron--open' : ''}`}
              >
                <ChevronDown />
              </span>
              {showParentDropdown && (
                <div className="bw-category-dropdown">
                  {rootCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className={`bw-category-option ${cat.id === parentCategoryId ? 'bw-category-option--active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setParentCategoryId(cat.id);
                        const children = allCategories.filter(
                          (c) => c.parentId === cat.id
                        );
                        if (children.length > 0) {
                          setSubCategoryId(children[0].id);
                        } else {
                          setSubCategoryId(cat.id);
                        }
                        setTag('');
                        setShowParentDropdown(false);
                      }}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 소분류 (하위 카테고리가 있을 때만 표시) */}
            {subCategories.length > 0 && (
              <>
                <span className="bw-label" style={{ marginLeft: '16px' }}>
                  소분류
                </span>
                <div
                  className="bw-category-selector"
                  onClick={() => {
                    setShowSubDropdown((p) => !p);
                    setShowParentDropdown(false);
                  }}
                >
                  <span className="bw-category-selected">
                    {currentSubCat ? currentSubCat.name : '선택하세요'}
                  </span>
                  <span
                    className={`bw-chevron ${showSubDropdown ? 'bw-chevron--open' : ''}`}
                  >
                    <ChevronDown />
                  </span>
                  {showSubDropdown && (
                    <div className="bw-category-dropdown">
                      {subCategories.map((sub) => (
                        <div
                          key={sub.id}
                          className={`bw-category-option ${sub.id === subCategoryId ? 'bw-category-option--active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubCategoryId(sub.id);
                            setTag('');
                            setShowSubDropdown(false);
                          }}
                        >
                          {sub.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

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
          <div className="bw-toolbar">
            <div className="bw-tool-dropdown-wrap">
              <EmoticonPicker onSelect={handleToolbarEmoticonSelect} />
            </div>
            <span className="bw-tool-dot" />
            <button
              type="button"
              className="bw-tool-btn"
              title="굵게"
              onClick={() => applyFormat('bold')}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
              </svg>
            </button>
            <button
              type="button"
              className="bw-tool-btn"
              title="기울임"
              onClick={() => applyFormat('italic')}
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
                <line x1="19" y1="4" x2="10" y2="4" />
                <line x1="14" y1="20" x2="5" y2="20" />
                <line x1="15" y1="4" x2="9" y2="20" />
              </svg>
            </button>
            <button
              type="button"
              className="bw-tool-btn"
              title="밑줄"
              onClick={() => applyFormat('underline')}
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
                <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
                <line x1="4" y1="21" x2="20" y2="21" />
              </svg>
            </button>
            <button
              type="button"
              className="bw-tool-btn"
              title="취소선"
              onClick={() => applyFormat('strikeThrough')}
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
                <line x1="4" y1="12" x2="20" y2="12" />
                <path d="M17.5 7.5C17.5 5.01 15.49 3 13 3H11C8.51 3 6.5 5.01 6.5 7.5c0 1.38.62 2.61 1.6 3.43" />
                <path d="M6.5 16.5C6.5 18.99 8.51 21 11 21h2c2.49 0 4.5-2.01 4.5-4.5 0-1.38-.62-2.61-1.6-3.43" />
              </svg>
            </button>
            <div className="bw-tool-dropdown-wrap" ref={linkPopoverWrapRef}>
              <button
                type="button"
                className={`bw-tool-btn ${isLinkActive ? 'bw-tool-btn--active' : ''}`}
                title="링크"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setShowFontSize(false);
                  setShowColorPicker(false);
                  if (showLinkPopover) {
                    setShowLinkPopover(false);
                  } else {
                    openLinkPopover();
                  }
                }}
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
                  <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 1 0-7.07-7.07L11 4" />
                  <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L13 19" />
                </svg>
              </button>
              {showLinkPopover && (
                <div
                  className="bw-link-popover"
                  role="dialog"
                  aria-label="링크 삽입"
                >
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
                          applyLink();
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
                      onClick={applyLink}
                    >
                      확인
                    </button>
                  </div>
                </div>
              )}
            </div>
            <span className="bw-tool-dot" />
            {/* 폰트 크기 */}
            <div className="bw-tool-dropdown-wrap">
              <button
                type="button"
                className="bw-tool-btn"
                title="글자 크기"
                onClick={() => {
                  setShowFontSize((p) => !p);
                  setShowColorPicker(false);
                }}
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
                  <polyline points="4 7 4 4 20 4 20 7" />
                  <line x1="9" y1="20" x2="15" y2="20" />
                  <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
              </button>
              {showFontSize && (
                <div className="bw-tool-dropdown">
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
            <div className="bw-tool-dropdown-wrap">
              <button
                type="button"
                className="bw-tool-btn"
                title="글자 색상"
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
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={selectedColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
                                    title={color ?? '비어있는 최근 색상 슬롯'}
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
            <span className="bw-tool-dot" />
            <button
              type="button"
              className="bw-tool-btn"
              title="사진 첨부"
              onClick={() => imageInputRef.current?.click()}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </button>
            <span className="bw-tool-dot" />
            <div className="bw-tool-dropdown-wrap">
              <button
                type="button"
                className="bw-tool-btn"
                title="코드 블록"
                onClick={() => applyCodeLanguage('plaintext')}
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
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </button>
            </div>
            <div className="bw-tool-dropdown-wrap">
              <button
                type="button"
                className="bw-tool-btn"
                title="정렬"
                onClick={cycleAlignment}
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

          <div className="bw-divider" />

          {/* ── 내용 ── */}
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

              // Only highlight when cursor is NOT inside a code block
              // (highlighting resets cursor position, causing RTL bug)
              if (contentRef.current && !getCurrentPreElement()) {
                setTimeout(
                  () => highlightCodeBlocks(contentRef.current as HTMLElement),
                  0
                );
              }
            }}
          />

          <div className="bw-divider" />

          {/* ── 태그 선택 (Tag 엔티티 기반) ── */}
          <div className="bw-section">
            <span className="bw-section-label">세부 카테고리</span>
            {currentTagList.length > 0 ? (
              <div className="bw-tag-list">
                {currentTagList.map((tagOption) => (
                  <button
                    key={tagOption.id}
                    type="button"
                    className={`bw-tag-chip ${tag === tagOption.tagName ? 'bw-tag-chip--active' : ''}`}
                    onClick={() => setTag(tag === tagOption.tagName ? '' : tagOption.tagName)}
                  >
                    #{tagOption.tagName}
                  </button>
                ))}
              </div>
            ) : (
              <p className="bw-tag-hint">카테고리가 없습니다.</p>
            )}
            {!tag.trim() && (
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
                    최대 50MB &nbsp;·&nbsp; 여러 파일 동시 업로드 가능
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
