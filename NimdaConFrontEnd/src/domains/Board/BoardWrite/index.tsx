import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { createBoardAPI, getBoardDetailAPI, updateBoardAPI } from '@/api/board';
import { deleteAttachments, uploadBoardFileViaS3 } from '@/api/attachments';
import { getAllCategoriesAPI } from '@/api/category';
import { getTagsByCategoryAPI } from '@/api/tag';
import type { TagResponse } from '@/api/tag';
import {
  getAdminProfileDecorationsAPI,
  type ProfileDecorationOption,
} from '@/api/profileDecorations';
import { getEmoticonSrc } from '@/domains/Comment/emoticonUtils';
import { hasRole, isAdmin } from '@/utils/jwt';
import CategorySelector from './CategorySelector';
import Toolbar from './Toolbar';
import AttachmentSection from './AttachmentSection';
import type { Category } from '../types';
import type { ColorPickerTab, EyeDropperApi } from './constants';
import { FontSize, ResolvedTextStyle, RichCodeBlock, RichImage, lowlight } from './tiptapExtensions';
import { getSanitizedEditorHtml } from './editorUtils';

const EMPTY_DOC = '<p></p>';
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

type AttachedFile = { id: number; name: string; size: number; isInline?: boolean };
type EditHydrationState = 'loading' | 'ready' | 'failed';

const isImageAttachment = (file: AttachedFile) => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return IMAGE_EXTENSIONS.includes(ext);
};

const normalizeLinkUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const hasMeaningfulContent = (html: string) => {
  const textOnly = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return textOnly.length > 0 || /<img\b/i.test(html);
};

const isShopCategoryGroup = (category: Category, categories: Category[]) => {
  if (category.shopEnabled) return true;
  if (category.parentId == null) return false;
  const parent = categories.find((item) => item.id === category.parentId);
  return Boolean(parent?.shopEnabled);
};
const getDraftSignature = ({
  parentCategoryId,
  subCategoryId,
  title,
  content,
  itemPrice,
  itemType,
  profileDecorationId,
  thumbnailAttachmentId,
  tagId,
  attachmentIds,
}: {
  parentCategoryId: number | null;
  subCategoryId: number | null;
  title: string;
  content: string;
  itemPrice: string;
  itemType: 'GENERAL' | 'BADGE';
  profileDecorationId: number | null;
  thumbnailAttachmentId: number | null;
  tagId: number | null;
  attachmentIds: number[];
}) => JSON.stringify({
  parentCategoryId,
  subCategoryId,
  title,
  content,
  itemPrice,
  itemType,
  profileDecorationId,
  thumbnailAttachmentId,
  tagId,
  attachmentIds,
});

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
  const [content, setContent] = useState(EMPTY_DOC);
  const [itemPrice, setItemPrice] = useState('');
  const [itemType, setItemType] = useState<'GENERAL' | 'BADGE'>('GENERAL');
  const [profileDecorationId, setProfileDecorationId] = useState<number | null>(null);
  const [profileDecorations, setProfileDecorations] = useState<ProfileDecorationOption[]>([]);
  const [thumbnailAttachmentId, setThumbnailAttachmentId] = useState<number | null>(null);
  const [tagId, setTagId] = useState<number | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [editBoardId, setEditBoardId] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingUploadCount, setPendingUploadCount] = useState(0);
  const [pendingAttachmentMutationCount, setPendingAttachmentMutationCount] = useState(0);
  const [editHydrationState, setEditHydrationState] = useState<EditHydrationState>(
    isEditMode ? 'loading' : 'ready'
  );
  const [error, setError] = useState<string | null>(null);
  const [currentTagList, setCurrentTagList] = useState<TagResponse[]>([]);
  const [draftBaseline, setDraftBaseline] = useState<string | null>(null);
  const [categoryLoadState, setCategoryLoadState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [tagLoadState, setTagLoadState] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const [categoryRetryKey, setCategoryRetryKey] = useState(0);
  const [tagRetryKey, setTagRetryKey] = useState(0);
  const [editRetryKey, setEditRetryKey] = useState(0);
  const [loadedTagCategoryId, setLoadedTagCategoryId] = useState<number | null>(null);

  const [showFontSize, setShowFontSize] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');
  const [colorPickerTab, setColorPickerTab] =
    useState<ColorPickerTab>('palette');
  const [pendingColor, setPendingColor] = useState('#0C0C0C');
  const [pendingCustomColor, setPendingCustomColor] = useState('#0C0C0C');
  const [recentColors, setRecentColors] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const linkPopoverWrapRef = useRef<HTMLDivElement>(null);
  const detailCategoryWarningRef = useRef<HTMLParagraphElement>(null);
  const pendingUploadsRef = useRef(0);
  const sessionNewAttachmentIdsRef = useRef(new Set<number>());
  const mountedRef = useRef(true);
  const navigationBypassRef = useRef(false);
  const isDraftDirtyRef = useRef(false);
  const blockerHandlingRef = useRef(false);
  const removingAttachmentIdsRef = useRef(new Set<number>());
  const discardUploadsRef = useRef(false);
  const commitInFlightRef = useRef(false);
  const pendingAttachmentMutationsRef = useRef(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      ResolvedTextStyle,
      FontSize,
      Color,
      Underline,
      RichCodeBlock.configure({
        lowlight,
        defaultLanguage: 'plaintext',
        enableTabIndentation: true,
        languageClassPrefix: 'language-',
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      RichImage.configure({
        allowBase64: false,
        inline: true,
        resize: {
          enabled: true,
          minWidth: 96,
          minHeight: 64,
          alwaysPreserveAspectRatio: true,
          directions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
          className: {
            container: 'bw-resize-container',
            wrapper: 'bw-resize-wrapper',
            handle: 'bw-resize-handle',
            resizing: 'is-resizing',
          },
        },
      }),
      Placeholder.configure({
        placeholder: '내용을 입력하세요.',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: EMPTY_DOC,
    editorProps: {
      attributes: {
        class: 'bw-content-input',
        dir: 'ltr',
        spellcheck: 'false',
        role: 'textbox',
        'aria-label': '내용',
        'aria-multiline': 'true',
      },
      handlePaste: (_view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        if (text == null) return false;
        event.preventDefault();
        editor?.chain().focus().insertContent(text).run();
        return true;
      },
      handleKeyDown: (_view, event) => {
        if (event.key !== 'Enter' || event.shiftKey || !editor) {
          return false;
        }

        const { selection } = editor.state;
        const { $from } = selection;
        const isEmptyListItem =
          selection.empty &&
          editor.isActive('listItem') &&
          $from.parent.isTextblock &&
          $from.parent.content.size === 0;

        if (!isEmptyListItem) {
          return false;
        }

        event.preventDefault();
        return editor.chain().focus().liftListItem('listItem').run();
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setContent(currentEditor.getHTML());
    },
  });

  const isUploading = pendingUploadCount > 0;
  const isAttachmentMutationPending = pendingAttachmentMutationCount > 0;
  const isEditHydrationBlocked = isEditMode && editHydrationState !== 'ready';
  const isInteractionBlocked =
    isEditHydrationBlocked || isSubmitting || isAttachmentMutationPending;

  const beginUpload = () => {
    pendingUploadsRef.current += 1;
    if (mountedRef.current) {
      setPendingUploadCount((count) => count + 1);
    }
  };

  const finishUpload = () => {
    pendingUploadsRef.current = Math.max(0, pendingUploadsRef.current - 1);
    if (mountedRef.current) {
      setPendingUploadCount((count) => Math.max(0, count - 1));
    }
  };

  const beginAttachmentMutation = () => {
    pendingAttachmentMutationsRef.current += 1;
    if (mountedRef.current) {
      setPendingAttachmentMutationCount((count) => count + 1);
    }
  };

  const finishAttachmentMutation = () => {
    pendingAttachmentMutationsRef.current = Math.max(
      0,
      pendingAttachmentMutationsRef.current - 1
    );
    if (mountedRef.current) {
      setPendingAttachmentMutationCount((count) => Math.max(0, count - 1));
    }
  };
  const rejectUploadWhileBusy = () => {
    if (commitInFlightRef.current) {
      setError('게시글을 저장하는 중입니다. 저장이 끝난 뒤 파일을 올려주세요.');
      return true;
    }
    if (pendingAttachmentMutationsRef.current > 0) {
      setError('첨부 파일을 처리하는 중입니다. 작업이 끝난 뒤 파일을 올려주세요.');
      return true;
    }
    return false;
  };


  useEffect(() => {
    editor?.setEditable(!isInteractionBlocked);
  }, [editor, isInteractionBlocked]);

  const rootCategories = useMemo(
    () =>
      allCategories
        .filter((category) => category.parentId === null && category.isActive)
        .filter((category) => !['바로가기', '대회'].includes(category.name))
        .filter((category) => category.name !== '새 소식' || isAdmin())
        .filter((category) => !isShopCategoryGroup(category, allCategories) || isAdmin())
        .filter(
          (category) =>
            category.name !== '카르텔' || hasRole('ROLE_CARTEL') || isAdmin()
        ),
    [allCategories]
  );

  const currentParentCat = allCategories.find(
    (category) => category.id === parentCategoryId
  );
  const subCategories = allCategories.filter(
    (category) => category.parentId === parentCategoryId && category.isActive
  );
  const currentSubCat = allCategories.find(
    (category) => category.id === subCategoryId
  );
  const targetCategoryId = currentSubCat?.id ?? currentParentCat?.id ?? null;
  const selectedCategory = currentSubCat ?? currentParentCat ?? null;
  const isShopCategory = selectedCategory
    ? isShopCategoryGroup(selectedCategory, allCategories)
    : false;
  const draftSignature = getDraftSignature({
    parentCategoryId,
    subCategoryId,
    title,
    content,
    itemPrice,
    itemType,
    profileDecorationId,
    thumbnailAttachmentId,
    tagId,
    attachmentIds: attachedFiles.map((file) => file.id),
  });
  const hasNewDraftInput =
    title.trim().length > 0 ||
    hasMeaningfulContent(content) ||
    attachedFiles.length > 0 ||
    itemPrice.trim().length > 0 ||
    profileDecorationId !== null ||
    thumbnailAttachmentId !== null ||
    tagId !== null;
  const isDraftDirty =
    isUploading ||
    (draftBaseline !== null
      ? draftSignature !== draftBaseline
      : !isEditMode && hasNewDraftInput);
  isDraftDirtyRef.current = isDraftDirty;
  const blocker = useBlocker(() => isDraftDirtyRef.current && !navigationBypassRef.current);

  const removeInlineAttachment = (attachmentId: number) => {
    if (!editor) return;

    const positions: number[] = [];
    editor.state.doc.descendants((node, position) => {
      const src = node.attrs.src as string | undefined;
      if (node.type.name === 'image' && src?.includes(`/attachments/${attachmentId}/`)) {
        positions.push(position);
      }
    });

    if (positions.length > 0) {
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          positions.reverse().forEach((position) => tr.delete(position, position + 1));
          return true;
        })
        .run();
    }
  };

  const cleanupSessionAttachments = useCallback(async (
    keepalive = false,
    reportError = true
  ): Promise<boolean> => {
    if (commitInFlightRef.current) return true;

    const fileIds = [...sessionNewAttachmentIdsRef.current];
    if (fileIds.length === 0) return true;

    pendingAttachmentMutationsRef.current += 1;
    if (mountedRef.current) {
      setPendingAttachmentMutationCount((count) => count + 1);
    }

    try {
      const result = await deleteAttachments(fileIds, { keepalive });
      if (!result.ok) {
        if (reportError && mountedRef.current) {
          setError(`업로드한 첨부 파일을 정리하지 못했습니다. ${result.message}`);
        }
        return false;
      }

      fileIds.forEach((fileId) => sessionNewAttachmentIdsRef.current.delete(fileId));
      return true;
    } catch {
      if (reportError && mountedRef.current) {
        setError('업로드한 첨부 파일을 정리하는 중 오류가 발생했습니다.');
      }
      return false;
    } finally {
      pendingAttachmentMutationsRef.current = Math.max(
        0,
        pendingAttachmentMutationsRef.current - 1
      );
      if (mountedRef.current) {
        setPendingAttachmentMutationCount((count) => Math.max(0, count - 1));
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setDraftBaseline(null);
    navigationBypassRef.current = false;
    sessionNewAttachmentIdsRef.current.clear();
    discardUploadsRef.current = false;
  }, [editId, isEditMode, slug]);

  useEffect(() => {
    if (!isEditMode && draftBaseline === null && allCategories.length > 0 && targetCategoryId) {
      setDraftBaseline(draftSignature);
    }
  }, [allCategories.length, draftBaseline, draftSignature, isEditMode, targetCategoryId]);

  useEffect(() => {
    if (blocker.state !== 'blocked' || blockerHandlingRef.current) return;

    blockerHandlingRef.current = true;
    if (commitInFlightRef.current) {
      setError('게시글을 저장하는 중입니다. 저장이 끝난 뒤 이동해주세요.');
      blocker.reset();
      blockerHandlingRef.current = false;
      return;
    }
    if (pendingUploadsRef.current > 0) {
      setError('파일 업로드가 끝난 뒤 이동해주세요.');
      blocker.reset();
      blockerHandlingRef.current = false;
      return;
    }
    if (pendingAttachmentMutationsRef.current > 0) {
      setError('첨부 파일을 처리하는 중입니다. 작업이 끝난 뒤 이동해주세요.');
      blocker.reset();
      blockerHandlingRef.current = false;
      return;
    }
    if (!window.confirm('작성 중인 내용이 있습니다. 나가시겠습니까? 업로드한 첨부 파일은 삭제됩니다.')) {
      blocker.reset();
      blockerHandlingRef.current = false;
      return;
    }
    discardUploadsRef.current = true;

    void cleanupSessionAttachments().then((cleaned) => {
      if (cleaned) {
        blocker.proceed();
      } else {
        discardUploadsRef.current = false;
        blocker.reset();
      }
      blockerHandlingRef.current = false;
    });
  }, [blocker, cleanupSessionAttachments]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDraftDirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted || commitInFlightRef.current) return;
      discardUploadsRef.current = true;
      void cleanupSessionAttachments(true, false);
    };
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        discardUploadsRef.current = false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [cleanupSessionAttachments]);

  useEffect(() => {
    if (!isShopCategory || !isAdmin()) {
      setProfileDecorations([]);
      setItemType('GENERAL');
      setProfileDecorationId(null);
      return;
    }

    let cancelled = false;

    const loadProfileDecorations = async () => {
      const result = await getAdminProfileDecorationsAPI();
      if (!cancelled && result.success) {
        setProfileDecorations(
          result.decorations.filter((decoration) => decoration.active !== false)
        );
      }
    };

    void loadProfileDecorations();

    return () => {
      cancelled = true;
    };
  }, [isShopCategory]);

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
    } catch (pickerError) {
      console.debug('EyeDropper dismissed', pickerError);
    }
  };

  const handleApplyLink = () => {
    if (!editor) return;

    const normalizedUrl = normalizeLinkUrl(linkUrl);
    if (!normalizedUrl) {
      editor.chain().focus().unsetLink().run();
      setShowLinkPopover(false);
      return;
    }

    const label = linkText.trim();
    const selectionEmpty = editor.state.selection.empty;

    if (!selectionEmpty) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: normalizedUrl }).run();
    } else if (label) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: label,
          marks: [{ type: 'link', attrs: { href: normalizedUrl } }],
        })
        .run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: normalizedUrl }).run();
    }

    setShowLinkPopover(false);
  };

  const handleInsertCodeBlock = () => {
    if (!editor) return;
    editor.chain().focus().toggleCodeBlock({ language: 'plaintext' }).run();
  };

  const handleToolbarEmoticonSelect = (marker: string) => {
    if (!editor) return;

    const id = marker.match(/\[nimda:(\d{2})\]/)?.[1];
    if (!id) return;

    editor
      .chain()
      .focus()
      .setImage({
        src: getEmoticonSrc(id),
        alt: marker,
        class: 'comment-emoticon-inline',
        'data-emoticon-id': id,
      })
      .insertContent(' ')
      .run();
  };

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      setCategoryLoadState('loading');
      try {
        const categories = await getAllCategoriesAPI();
        if (!cancelled) {
          setAllCategories(categories);
          setCategoryLoadState(categories.length > 0 ? 'ready' : 'failed');
        }
      } catch {
        if (!cancelled) {
          setCategoryLoadState('failed');
        }
      }
    };

    void loadCategories();
    return () => {
      cancelled = true;
    };
  }, [categoryRetryKey]);

  useEffect(() => {
    if (allCategories.length === 0) return;

    const matchedCategory = allCategories.find((category) => category.slug === slug);
    const isBannerCategory = matchedCategory
      ? matchedCategory.slug === 'banner' ||
        (matchedCategory.parentId != null &&
          allCategories.find((category) => category.id === matchedCategory.parentId)?.slug === 'banner')
      : slug === 'banner';

    if (isBannerCategory && !isAdmin()) {
      alert('배너 게시판은 관리자만 작성할 수 있습니다.');
      navigate('/board/banner');
      return;
    }

    if (matchedCategory && isShopCategoryGroup(matchedCategory, allCategories) && !isAdmin()) {
      alert('상품 등록은 관리자만 가능합니다.');
      navigate(`/board/${matchedCategory.slug}`);
      return;
    }

    if (isEditMode && editId) {
      let cancelled = false;
      setEditHydrationState('loading');
      setEditBoardId(null);
      setError(null);

      const loadBoard = async () => {
        const parsedEditId = Number.parseInt(editId, 10);
        if (!Number.isFinite(parsedEditId)) {
          if (!cancelled) {
            setEditHydrationState('failed');
            setError('게시글을 불러오는 중 오류가 발생했습니다.');
          }
          return;
        }

        try {
          const response = await getBoardDetailAPI(parsedEditId);
          if (!response.success || !('board' in response)) {
            if (!cancelled) {
              setEditHydrationState('failed');
              setError(response.message || '게시글을 불러오는 중 오류가 발생했습니다.');
            }
            return;
          }

          if (cancelled) return;
          const board = response.board;
          setEditBoardId(board.id);
          setTitle(board.title);
          setItemPrice(board.itemPrice != null ? String(board.itemPrice) : '');
          setItemType(board.itemType === 'BADGE' ? 'BADGE' : 'GENERAL');
          setProfileDecorationId(board.profileDecoration?.id ?? null);
          setThumbnailAttachmentId(board.thumbnailAttachmentId ?? null);
          setTagId(board.tag?.id ?? null);
          setAttachedFiles(
            board.attachments?.map((attachment) => ({
              id: attachment.id,
              name: attachment.originFilename || 'file',
              size: attachment.fileSize || 0,
            })) ?? []
          );

          if (board.category) {
            if (board.category.parentId) {
              setParentCategoryId(board.category.parentId);
              setSubCategoryId(board.category.id);
            } else {
              setParentCategoryId(board.category.id);
              setSubCategoryId(board.category.id);
            }
          }

          const nextContent = board.content || EMPTY_DOC;
          setContent(nextContent);
          editor?.commands.setContent(nextContent, false);
          setDraftBaseline(getDraftSignature({
            parentCategoryId: board.category?.parentId ?? board.category?.id ?? null,
            subCategoryId: board.category?.id ?? null,
            title: board.title,
            content: nextContent,
            itemPrice: board.itemPrice != null ? String(board.itemPrice) : '',
            itemType: board.itemType === 'BADGE' ? 'BADGE' : 'GENERAL',
            profileDecorationId: board.profileDecoration?.id ?? null,
            thumbnailAttachmentId: board.thumbnailAttachmentId ?? null,
            tagId: board.tag?.id ?? null,
            attachmentIds: board.attachments?.map((attachment) => attachment.id) ?? [],
          }));
          setEditHydrationState('ready');
        } catch {
          if (!cancelled) {
            setEditHydrationState('failed');
            setError('게시글을 불러오는 중 오류가 발생했습니다.');
          }
        }
      };

      void loadBoard();
      return () => {
        cancelled = true;
      };
    }

    setEditHydrationState('ready');

    const category = allCategories.find((item) => item.slug === slug);
    if (!category) return;

    if (category.parentId) {
      setParentCategoryId(category.parentId);
      setSubCategoryId(category.id);
      return;
    }

    setParentCategoryId(category.id);
    const children = allCategories.filter((item) => item.parentId === category.id);
    setSubCategoryId(children[0]?.id ?? category.id);
  }, [allCategories, slug, isEditMode, editId, editRetryKey, editor, navigate]);

  useEffect(() => {
    if (!targetCategoryId) {
      setCurrentTagList([]);
      setTagLoadState('idle');
      setLoadedTagCategoryId(null);
      return;
    }

    let cancelled = false;
    const loadTags = async () => {
      setTagLoadState('loading');
      setLoadedTagCategoryId(null);
      try {
        const tags = await getTagsByCategoryAPI(targetCategoryId);
        if (!cancelled) {
          setCurrentTagList(tags);
          setTagLoadState('ready');
          setLoadedTagCategoryId(targetCategoryId);
        }
      } catch {
        if (!cancelled) {
          setCurrentTagList([]);
          setTagLoadState('failed');
        }
      }
    };

    void loadTags();
    return () => {
      cancelled = true;
    };
  }, [tagRetryKey, targetCategoryId]);

  useEffect(() => {
    if (!editor || !showLinkPopover) return;

    const selectedHref = editor.getAttributes('link').href as string | undefined;
    const { from, to, empty } = editor.state.selection;
    const selectedText = empty
      ? ''
      : editor.state.doc.textBetween(from, to, ' ');

    setLinkUrl(selectedHref || 'https://');
    setLinkText(selectedText);
  }, [editor, showLinkPopover]);

  useEffect(() => {
    if (!showLinkPopover) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        linkPopoverWrapRef.current &&
        !linkPopoverWrapRef.current.contains(event.target as Node)
      ) {
        setShowLinkPopover(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showLinkPopover]);

  const handleImageUploadToEditor = async (files: FileList | File[]) => {
    if (rejectUploadWhileBusy()) return;

    beginUpload();
    try {
      const targetCategoryId = subCategoryId || parentCategoryId;
      if (!targetCategoryId) {
        setError('카테고리를 먼저 선택해주세요.');
        return;
      }
      if (!editor) return;

      setError(null);
      for (const file of Array.from(files)) {
        const result = await uploadBoardFileViaS3(file, targetCategoryId);
        if (!result.ok) {
          setError(result.message);
          break;
        }

        if (discardUploadsRef.current || !mountedRef.current) {
          void deleteAttachments([result.attachmentId], { keepalive: true });
          continue;
        }
        sessionNewAttachmentIdsRef.current.add(result.attachmentId);
        setAttachedFiles((prev) => [
          ...prev,
          {
            id: result.attachmentId,
            name: file.name,
            size: file.size,
            isInline: true,
          },
        ]);

        editor
          .chain()
          .focus()
          .setImage({
            src: `/api/cite/attachments/${result.attachmentId}/download?disposition=inline`,
            alt: file.name,
            class: 'bw-editor-image',
          })
          .insertContent('<p></p>')
          .run();
      }
    } catch {
      setError((current) => current || '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      finishUpload();
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files?.length) return;
      await handleImageUploadToEditor(event.target.files);
    } catch {
      setError((current) => current || '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      event.target.value = '';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    if (rejectUploadWhileBusy()) {
      event.target.value = '';
      return;
    }

    beginUpload();
    try {
      const targetCategoryId = subCategoryId || parentCategoryId;
      if (!targetCategoryId) {
        setError('카테고리를 먼저 선택해주세요.');
        return;
      }

      setError(null);
      for (const file of files) {
        const result = await uploadBoardFileViaS3(file, targetCategoryId);
        if (!result.ok) {
          setError(result.message);
          break;
        }

        if (discardUploadsRef.current || !mountedRef.current) {
          void deleteAttachments([result.attachmentId], { keepalive: true });
          continue;
        }
        sessionNewAttachmentIdsRef.current.add(result.attachmentId);
        setAttachedFiles((prev) => [
          ...prev,
          { id: result.attachmentId, name: file.name, size: file.size },
        ]);
      }
    } catch {
      setError((current) => current || '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      finishUpload();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = async (attachmentId: number) => {
    if (commitInFlightRef.current) {
      setError('게시글을 저장하는 중입니다. 저장이 끝난 뒤 첨부 파일을 삭제해주세요.');
      return;
    }
    if (removingAttachmentIdsRef.current.has(attachmentId)) return;

    if (sessionNewAttachmentIdsRef.current.has(attachmentId)) {
      removingAttachmentIdsRef.current.add(attachmentId);
      beginAttachmentMutation();

      try {
        const result = await deleteAttachments([attachmentId]);
        if (!result.ok) {
          if (mountedRef.current) {
            setError(`첨부 파일을 삭제하지 못했습니다. ${result.message}`);
          }
          return;
        }
        sessionNewAttachmentIdsRef.current.delete(attachmentId);
      } catch {
        if (mountedRef.current) {
          setError('첨부 파일을 삭제하는 중 오류가 발생했습니다.');
        }
        return;
      } finally {
        removingAttachmentIdsRef.current.delete(attachmentId);
        finishAttachmentMutation();
      }
    }

    if (!mountedRef.current) return;
    setAttachedFiles((prev) => prev.filter((file) => file.id !== attachmentId));
    setThumbnailAttachmentId((current) => (current === attachmentId ? null : current));
    removeInlineAttachment(attachmentId);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0 || rejectUploadWhileBusy()) return;

    setError(null);
    try {
      const images = files.filter((file) => file.type.startsWith('image/'));
      const docs = files.filter((file) => !file.type.startsWith('image/'));

      if (images.length > 0) {
        await handleImageUploadToEditor(images);
      }

      if (docs.length > 0) {
        beginUpload();
        try {
          const targetCategoryId = subCategoryId || parentCategoryId;
          if (!targetCategoryId) {
            setError('카테고리를 먼저 선택해주세요.');
            return;
          }

          for (const file of docs) {
            const result = await uploadBoardFileViaS3(file, targetCategoryId);
            if (!result.ok) {
              setError(result.message);
              break;
            }

            if (discardUploadsRef.current || !mountedRef.current) {
              void deleteAttachments([result.attachmentId], { keepalive: true });
              continue;
            }
            sessionNewAttachmentIdsRef.current.add(result.attachmentId);
            setAttachedFiles((prev) => [
              ...prev,
              { id: result.attachmentId, name: file.name, size: file.size },
            ]);
          }
        } finally {
          finishUpload();
        }
      }
    } catch {
      setError((current) => current || '파일 업로드 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting || commitInFlightRef.current) return;
    if (pendingUploadsRef.current > 0) {
      setError('파일 업로드가 완료될 때까지 기다려주세요.');
      return;
    }
    if (pendingAttachmentMutationsRef.current > 0) {
      setError('첨부 파일 삭제가 완료될 때까지 기다려주세요.');
      return;
    }
    if (isEditHydrationBlocked) {
      setError(
        editHydrationState === 'failed'
          ? '게시글을 불러오지 못해 수정할 수 없습니다.'
          : '게시글을 불러오는 중입니다.'
      );
      return;
    }
    const targetCategoryId = subCategoryId || parentCategoryId;
    if (categoryLoadState !== 'ready') {
      setError('카테고리 정보를 확인한 뒤 등록할 수 있습니다.');
      return;
    }
    if (targetCategoryId && (tagLoadState !== 'ready' || loadedTagCategoryId !== targetCategoryId)) {
      setError('태그 정보를 확인한 뒤 등록할 수 있습니다.');
      return;
    }
    const latestContent =
      editor?.view?.dom instanceof HTMLElement
        ? getSanitizedEditorHtml(editor.view.dom)
        : editor?.getHTML() ?? content;

    if (!title.trim() || !hasMeaningfulContent(latestContent)) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    if (!targetCategoryId) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    const parsedItemPrice = itemPrice.trim() ? Number(itemPrice) : null;
    if (isShopCategory && (!Number.isFinite(parsedItemPrice) || !parsedItemPrice || parsedItemPrice <= 0)) {
      setError('상품 가격을 1 NC 이상으로 입력해주세요.');
      return;
    }
    if (isShopCategory && itemType === 'BADGE' && !profileDecorationId) {
      setError('배지 상품으로 등록하려면 지급할 배지를 선택해주세요.');
      return;
    }
    const imageAttachments = attachedFiles.filter(isImageAttachment);
    const resolvedThumbnailAttachmentId =
      thumbnailAttachmentId && imageAttachments.some((file) => file.id === thumbnailAttachmentId)
        ? thumbnailAttachmentId
        : null;
    if (isShopCategory && imageAttachments.length === 0) {
      setError('마일리지 상점 상품은 썸네일로 사용할 이미지를 첨부해야 합니다.');
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
      setContent(latestContent);

      const submittedAttachmentIds = attachedFiles.map((file) => file.id);
      const attachmentIds = isEditMode
        ? submittedAttachmentIds
        : submittedAttachmentIds.length > 0
          ? submittedAttachmentIds
          : undefined;

      if (isEditMode) {
        if (!editBoardId) {
          setError('게시글을 불러오지 못해 수정할 수 없습니다.');
          return;
        }
        commitInFlightRef.current = true;
        const response = await updateBoardAPI(editBoardId, {
          categoryId: targetCategoryId,
          title: title.trim(),
          content: latestContent,
          tagId: tagId ?? undefined,
          attachmentIds,
          itemPrice: isShopCategory ? parsedItemPrice : null,
          itemType: isShopCategory ? itemType : 'GENERAL',
          profileDecorationId: isShopCategory && itemType === 'BADGE' ? profileDecorationId : null,
          thumbnailAttachmentId: isShopCategory ? resolvedThumbnailAttachmentId : null,
        });

        if (response.success && 'board' in response) {
          submittedAttachmentIds.forEach((attachmentId) =>
            sessionNewAttachmentIdsRef.current.delete(attachmentId)
          );
          isDraftDirtyRef.current = false;
          navigationBypassRef.current = true;
          discardUploadsRef.current = false;
          const boardSlug = response.board.category?.slug || slug;
          navigate(`/board/${boardSlug}/${editBoardId}`);
          return;
        }

        setError(response.message || '게시글 수정에 실패했습니다.');
        return;
      }

      commitInFlightRef.current = true;
      const response = await createBoardAPI({
        categoryId: targetCategoryId,
        title: title.trim(),
        content: latestContent,
        tagId: tagId ?? undefined,
        attachmentIds,
        itemPrice: isShopCategory ? parsedItemPrice : null,
        itemType: isShopCategory ? itemType : 'GENERAL',
        profileDecorationId: isShopCategory && itemType === 'BADGE' ? profileDecorationId : null,
        thumbnailAttachmentId: isShopCategory ? resolvedThumbnailAttachmentId : null,
      });

      if (response.success && 'board' in response) {
        submittedAttachmentIds.forEach((attachmentId) =>
          sessionNewAttachmentIdsRef.current.delete(attachmentId)
        );
        isDraftDirtyRef.current = false;
        navigationBypassRef.current = true;
        discardUploadsRef.current = false;
        const writtenCategory = allCategories.find(
          (category) => category.id === targetCategoryId
        );
        navigate(`/board/${writtenCategory?.slug || slug}/${response.board.id}`);
        return;
      }

      setError(response.message || '게시글 작성에 실패했습니다.');
    } catch {
      setError(
        isEditMode
          ? '게시글 수정 중 오류가 발생했습니다.'
          : '게시글 작성 중 오류가 발생했습니다.'
      );
    } finally {
      commitInFlightRef.current = false;
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    const category = allCategories.find(
      (item) => item.id === (subCategoryId || parentCategoryId)
    );
    navigate(`/board/${category?.slug || slug}`);
  };

  const isTaxonomyBlocked =
    categoryLoadState !== 'ready' ||
    !targetCategoryId ||
    tagLoadState !== 'ready' ||
    loadedTagCategoryId !== targetCategoryId;

  return (
    <Layout hideSidebar>
      <div className="bw-page">
        <form onSubmit={handleSubmit} className="bw-container">
          {categoryLoadState === 'failed' && (
            <div role="alert">
              <p>카테고리 정보를 불러오지 못했습니다.</p>
              <button type="button" onClick={() => setCategoryRetryKey((key) => key + 1)}>
                카테고리 다시 시도
              </button>
            </div>
          )}
          {tagLoadState === 'failed' && (
            <div role="alert">
              <p>태그 정보를 불러오지 못했습니다.</p>
              <button type="button" onClick={() => setTagRetryKey((key) => key + 1)}>
                태그 다시 시도
              </button>
            </div>
          )}
          {isEditMode && editHydrationState === 'failed' && (
            <div role="alert">
              <p>게시글을 불러오지 못했습니다.</p>
              <button type="button" onClick={() => setEditRetryKey((key) => key + 1)}>
                게시글 다시 시도
              </button>
            </div>
          )}

          <fieldset
            disabled={isInteractionBlocked}
            aria-busy={editHydrationState === 'loading'}
            style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
          >
          {categoryLoadState === 'loading' && (
            <p role="status" aria-live="polite">카테고리 정보를 불러오는 중입니다.</p>
          )}
          {tagLoadState === 'loading' && (
            <p role="status" aria-live="polite">태그 정보를 불러오는 중입니다.</p>
          )}
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
            <label htmlFor="bw-title" className="sr-only">제목</label>
            <input
              id="bw-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 입력하세요."
              className="bw-title-input"
              maxLength={200}
              aria-describedby={error ? 'board-write-error' : undefined}
              required
            />
          </div>

          {isShopCategory && (
            <>
              <div className="bw-divider" />
              <div className="bw-title-area">
                <label htmlFor="bw-item-price" className="sr-only">상품 가격</label>
                <input
                  id="bw-item-price"
                  type="number"
                  min="1"
                  step="1"
                  value={itemPrice}
                  onChange={(event) => setItemPrice(event.target.value)}
                  placeholder="상품 가격을 입력하세요. 예: 1200"
                  className="bw-title-input"
                  aria-describedby={error ? 'board-write-error' : undefined}
                  required
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 180px) minmax(0, 1fr)',
                  gap: '14px',
                  alignItems: 'center',
                }}
              >
                <select
                  value={itemType}
                  onChange={(event) => {
                    const nextType = event.target.value as 'GENERAL' | 'BADGE';
                    setItemType(nextType);
                    if (nextType !== 'BADGE') {
                      setProfileDecorationId(null);
                    }
                  }}
                  className="bw-title-input"
                  aria-label="상품 종류"
                  style={{ fontSize: '16px' }}
                >
                  <option value="GENERAL">일반 상품</option>
                  <option value="BADGE">배지 상품</option>
                </select>
                <select
                  value={profileDecorationId ?? ''}
                  onChange={(event) =>
                    setProfileDecorationId(
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
                  className="bw-title-input"
                  aria-label="지급 배지"
                  disabled={itemType !== 'BADGE'}
                  style={{ fontSize: '16px', opacity: itemType === 'BADGE' ? 1 : 0.45 }}
                >
                  <option value="">
                    {itemType === 'BADGE'
                      ? '구매자에게 지급할 배지를 선택하세요'
                      : '배지 상품일 때만 선택'}
                  </option>
                  {profileDecorations.map((decoration) => (
                    <option key={decoration.id ?? decoration.key} value={decoration.id}>
                      {decoration.label} ({decoration.key})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="bw-divider" />

          <Toolbar
            editor={editor}
            showFontSize={showFontSize}
            setShowFontSize={setShowFontSize}
            showColorPicker={showColorPicker}
            setShowColorPicker={setShowColorPicker}
            showLinkPopover={showLinkPopover}
            setShowLinkPopover={setShowLinkPopover}
            colorPickerTab={colorPickerTab}
            setColorPickerTab={setColorPickerTab}
            pendingColor={pendingColor}
            setPendingColor={setPendingColor}
            pendingCustomColor={pendingCustomColor}
            setPendingCustomColor={setPendingCustomColor}
            recentColors={recentColors}
            pushRecentColor={pushRecentColor}
            handlePickScreenColor={handlePickScreenColor}
            linkUrl={linkUrl}
            setLinkUrl={setLinkUrl}
            linkText={linkText}
            setLinkText={setLinkText}
            linkPopoverWrapRef={linkPopoverWrapRef}
            imageInputRef={imageInputRef}
            fileInputRef={fileInputRef}
            onApplyLink={handleApplyLink}
            onInsertCodeBlock={handleInsertCodeBlock}
            onInsertEmoticon={handleToolbarEmoticonSelect}
          />

          <div className="bw-divider" />

          <div className="bw-editor-surface">
            <EditorContent editor={editor} />
          </div>

          <div className="bw-divider" />

          <AttachmentSection
            currentTagList={currentTagList}
            tagId={tagId}
            setTagId={setTagId}
            detailCategoryWarningRef={detailCategoryWarningRef}
            attachedFiles={attachedFiles}
            isShopCategory={isShopCategory}
            thumbnailAttachmentId={thumbnailAttachmentId}
            setThumbnailAttachmentId={setThumbnailAttachmentId}
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

          </fieldset>

          {error && <div id="board-write-error" className="bw-error" role="alert" aria-live="assertive">{error}</div>}

          <div className="bw-divider" />

          <div className="bw-actions">
            <button
              type="button"
              className="bw-btn bw-btn--cancel"
              onClick={handleCancel}
              disabled={isSubmitting || isUploading || isAttachmentMutationPending}
            >
              취소
            </button>
            <button
              type="submit"
              className="bw-btn bw-btn--submit"
              disabled={
                isSubmitting ||
                isUploading ||
                isAttachmentMutationPending ||
                isEditHydrationBlocked ||
                isTaxonomyBlocked
              }
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
