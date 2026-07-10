import { useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { createBoardAPI, getBoardDetailAPI, updateBoardAPI } from '@/api/board';
import { uploadBoardFileViaS3 } from '@/api/attachments';
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
  const [editHydrationState, setEditHydrationState] = useState<EditHydrationState>(
    isEditMode ? 'loading' : 'ready'
  );
  const [error, setError] = useState<string | null>(null);
  const [currentTagList, setCurrentTagList] = useState<TagResponse[]>([]);

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
  const isEditHydrationBlocked = isEditMode && editHydrationState !== 'ready';
  const isInteractionBlocked = isEditHydrationBlocked || isSubmitting;

  const beginUpload = () => {
    pendingUploadsRef.current += 1;
    setPendingUploadCount((count) => count + 1);
  };

  const finishUpload = () => {
    pendingUploadsRef.current = Math.max(0, pendingUploadsRef.current - 1);
    setPendingUploadCount((count) => Math.max(0, count - 1));
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
        .insertContent(`<a href="${normalizedUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`)
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
    const loadCategories = async () => {
      try {
        const categories = await getAllCategoriesAPI();
        setAllCategories(categories);
      } catch (loadError) {
        console.error('카테고리 목록 로드 오류:', loadError);
      }
    };

    loadCategories();
  }, []);

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
  }, [allCategories, slug, isEditMode, editId, editor, navigate]);

  useEffect(() => {
    if (!targetCategoryId) {
      setCurrentTagList([]);
      return;
    }

    let cancelled = false;

    const loadTags = async () => {
      try {
        const tags = await getTagsByCategoryAPI(targetCategoryId);
        if (!cancelled) {
          setCurrentTagList(tags);
        }
      } catch {
        if (!cancelled) {
          setCurrentTagList([]);
        }
      }
    };

    loadTags();

    return () => {
      cancelled = true;
    };
  }, [targetCategoryId]);

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

  const handleRemoveFile = (attachmentId: number) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== attachmentId));
    setThumbnailAttachmentId((current) => (current === attachmentId ? null : current));
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
    if (files.length === 0) return;

    beginUpload();
    setError(null);
    try {
      const images = files.filter((file) => file.type.startsWith('image/'));
      const docs = files.filter((file) => !file.type.startsWith('image/'));

      if (images.length > 0) {
        await handleImageUploadToEditor(images);
      }

      if (docs.length > 0) {
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

          setAttachedFiles((prev) => [
            ...prev,
            { id: result.attachmentId, name: file.name, size: file.size },
          ]);
        }
      }
    } catch {
      setError((current) => current || '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      finishUpload();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) return;
    if (pendingUploadsRef.current > 0) {
      setError('파일 업로드가 완료될 때까지 기다려주세요.');
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

      const attachmentIds = isEditMode
        ? attachedFiles.map((file) => file.id)
        : attachedFiles.length > 0
          ? attachedFiles.map((file) => file.id)
          : undefined;

      if (isEditMode) {
        if (!editBoardId) {
          setError('게시글을 불러오지 못해 수정할 수 없습니다.');
          return;
        }
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
          const boardSlug = response.board.category?.slug || slug;
          navigate(`/board/${boardSlug}/${editBoardId}`);
          return;
        }

        setError(response.message || '게시글 수정에 실패했습니다.');
        return;
      }

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
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!window.confirm('작성 중인 내용이 사라집니다. 정말 나가시겠습니까?')) {
      return;
    }

    const category = allCategories.find(
      (item) => item.id === (subCategoryId || parentCategoryId)
    );
    navigate(`/board/${category?.slug || slug}`);
  };

  return (
    <Layout hideSidebar>
      <div className="bw-page">
        <form onSubmit={handleSubmit} className="bw-container">
          <fieldset
            disabled={isInteractionBlocked}
            aria-busy={editHydrationState === 'loading'}
            style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
          >
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
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 입력하세요."
              className="bw-title-input"
              maxLength={200}
              required
            />
          </div>

          {isShopCategory && (
            <>
              <div className="bw-divider" />
              <div className="bw-title-area">
                <input
                  id="bw-item-price"
                  type="number"
                  min="1"
                  step="1"
                  value={itemPrice}
                  onChange={(event) => setItemPrice(event.target.value)}
                  placeholder="상품 가격을 입력하세요. 예: 1200"
                  className="bw-title-input"
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

          {error && <div className="bw-error">{error}</div>}

          <div className="bw-divider" />

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
              disabled={isSubmitting || isUploading || isEditHydrationBlocked}
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
