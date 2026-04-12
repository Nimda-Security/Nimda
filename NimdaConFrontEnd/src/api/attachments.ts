/**
 * 게시글 첨부(S3 presigned → PUT → register) — 백엔드 동일 흐름.
 * @see AttachmentController /presigned, /register
 */

const ATTACHMENTS_BASE = '/api/cite/attachments';

const IMAGE_RE_ENCODE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
]);

/**
 * Canvas를 통해 이미지를 재인코딩하여 EXIF/메타데이터 및 내부 삽입 코드를 파괴한다.
 * GIF 애니메이션은 첫 프레임만 유지된다(보안과 트레이드오프).
 */
const reEncodeImageFile = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    if (!IMAGE_RE_ENCODE_TYPES.has(file.type)) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0);

      // PNG 계열은 lossless로, 나머지는 JPEG 92% 품질로 재인코딩
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = outputType === 'image/jpeg' ? 0.92 : undefined;
      const outputExt = outputType === 'image/png' ? '.png' : '.jpg';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // 확장자를 출력 형식에 맞게 정리
          let name = file.name;
          const dotIdx = name.lastIndexOf('.');
          if (dotIdx > 0) {
            name = name.substring(0, dotIdx) + outputExt;
          }

          resolve(new File([blob], name, { type: outputType }));
        },
        outputType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지 로드에 실패했습니다. 파일이 손상되었을 수 있습니다.'));
    };

    img.src = url;
  });

const parseJsonSafe = async (response: Response) => {
  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export type PresignedBoardUploadResult = {
  uploadUrl: string;
  key: string;
};

/**
 * S3 업로드용 presigned URL 발급 (type=board: 게시판 첨부 경로)
 */
export const requestPresignedUpload = async (
  type: 'board' | 'file' | 'profile',
  fileName: string
): Promise<{ ok: true; data: PresignedBoardUploadResult } | { ok: false; message: string }> => {
  const params = new URLSearchParams();
  params.set('type', type);
  params.set('fileName', fileName);

  const response = await fetch(`${ATTACHMENTS_BASE}/presigned`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    credentials: 'include',
    body: params.toString(),
  });

  const result = await parseJsonSafe(response);
  if (!response.ok || !result?.success) {
    return {
      ok: false,
      message: (result?.message as string) || 'Presigned URL 발급에 실패했습니다.',
    };
  }

  const data = result.data ?? result;
  const uploadUrl = data.uploadUrl as string | undefined;
  const key = data.key as string | undefined;
  if (!uploadUrl || !key) {
    return { ok: false, message: 'Presigned 응답 형식이 올바르지 않습니다.' };
  }

  return { ok: true, data: { uploadUrl, key } };
};

/**
 * 브라우저에서 S3로 직접 업로드 (PUT)
 */
export const putFileToPresignedUrl = async (
  uploadUrl: string,
  file: File
): Promise<{ ok: true } | { ok: false; message: string }> => {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!res.ok) {
    return { ok: false, message: `S3 업로드 실패 (${res.status})` };
  }
  return { ok: true };
};

export type RegisterAttachmentBody = {
  key: string;
  originFilename: string;
  fileSize: number;
  categoryId: number;
  /** 글 작성 전 등록 시 생략(null). 게시글 저장 후 attachmentIds로 연결. */
  boardId?: number | null;
};

/**
 * S3 업로드 완료 후 DB에 첨부 행 등록 → attachmentId 반환
 */
export const registerAttachmentAfterS3 = async (
  body: RegisterAttachmentBody
): Promise<{ ok: true; attachmentId: number } | { ok: false; message: string }> => {
  const response = await fetch(`${ATTACHMENTS_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      key: body.key,
      originFilename: body.originFilename,
      fileSize: body.fileSize,
      categoryId: body.categoryId,
      boardId: body.boardId ?? null,
    }),
  });

  const result = await parseJsonSafe(response);
  if (!response.ok || !result?.success) {
    return {
      ok: false,
      message: (result?.message as string) || '첨부 등록에 실패했습니다.',
    };
  }

  const data = result.data ?? result;
  const attachmentId = data.attachmentId as number | undefined;
  if (attachmentId == null || Number.isNaN(attachmentId)) {
    return { ok: false, message: '첨부 ID 응답이 없습니다.' };
  }

  return { ok: true, attachmentId };
};

/**
 * 파일 한 개에 대해 presigned → PUT → register까지 수행 (게시글 작성용 단일 첨부).
 * S3 미설정 등으로 presigned가 실패하면 메시지 반환.
 */
export const uploadBoardFileViaS3 = async (
  file: File,
  categoryId: number
): Promise<{ ok: true; attachmentId: number } | { ok: false; message: string }> => {
  // 이미지 파일은 Canvas로 재인코딩하여 메타데이터/삽입 코드 파괴
  let safeFile = file;
  if (IMAGE_RE_ENCODE_TYPES.has(file.type)) {
    try {
      safeFile = await reEncodeImageFile(file);
    } catch {
      return { ok: false, message: '이미지 처리에 실패했습니다. 파일이 손상되었을 수 있습니다.' };
    }
  }

  const presigned = await requestPresignedUpload('board', safeFile.name);
  if (!presigned.ok) {
    return presigned;
  }

  const put = await putFileToPresignedUrl(presigned.data.uploadUrl, safeFile);
  if (!put.ok) {
    return put;
  }

  return registerAttachmentAfterS3({
    key: presigned.data.key,
    originFilename: safeFile.name,
    fileSize: safeFile.size,
    categoryId,
    boardId: null,
  });
};

/**
 * 첨부의 presigned S3 URL을 가져온다.
 * <img src>에 직접 사용 가능한 URL을 반환.
 */
export const getAttachmentPresignedUrl = async (
  attachmentId: number
): Promise<string | null> => {
  try {
    const response = await fetch(`${ATTACHMENTS_BASE}/${attachmentId}/download-url`, { credentials: 'include' });
    const result = await parseJsonSafe(response);
    if (!response.ok || !result?.success) return null;
    const data = result.data ?? result;
    return (data.downloadUrl as string | undefined)?.trim() || null;
  } catch {
    return null;
  }
};

/**
 * 첨부 다운로드: 일반 링크로 API를 열면 Authorization이 없어 403.
 * Spring Security가 /attachments/** 를 막으므로 Bearer로 GET download-url만 호출한 뒤 새 탭에서 연다.
 */
export const openAttachmentDownloadInNewTab = async (
  attachmentId: number
): Promise<{ ok: true } | { ok: false; message: string }> => {
  const response = await fetch(`${ATTACHMENTS_BASE}/${attachmentId}/download-url`, { credentials: 'include' });
  const result = await parseJsonSafe(response);
  if (!response.ok || !result?.success) {
    return {
      ok: false,
      message: (result?.message as string) || '다운로드 URL을 가져오지 못했습니다.',
    };
  }
  const data = result.data ?? result;
  const downloadUrl = (data.downloadUrl as string | undefined)?.trim();
  if (!downloadUrl) {
    return { ok: false, message: '다운로드 URL이 없습니다.' };
  }
  window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  return { ok: true };
};
