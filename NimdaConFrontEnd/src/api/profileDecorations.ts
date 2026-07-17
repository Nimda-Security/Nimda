import {
  putFileToPresignedUrl,
  requestPresignedUpload,
} from '@/api/attachments';
import { addVersionToHeaders } from '@/constants/version';

export interface ProfileDecorationOption {
  id?: number;
  key: string;
  label: string;
  src: string;
  requiredRole?: string | null;
  purchaseRequired?: boolean;
  active?: boolean;
}

const normalizeDecorations = (data: unknown): ProfileDecorationOption[] =>
  Array.isArray(data)
    ? data.filter(
        (item): item is ProfileDecorationOption =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof item.key === 'string' &&
          typeof item.label === 'string' &&
          typeof item.src === 'string'
      )
    : [];

const parseJsonSafe = async (response: Response) => {
  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const getProfileDecorationsAPI = async (): Promise<{
  success: boolean;
  message?: string;
  decorations: ProfileDecorationOption[];
}> => {
  try {
    const response = await fetch('/api/cite/profile-decorations', {
      method: 'GET',
      headers: addVersionToHeaders(),
      credentials: 'include',
    });
    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      return { success: true, decorations: normalizeDecorations(result.data) };
    }

    return {
      success: false,
      message: result?.message || '프로필 배지 목록을 불러오지 못했습니다.',
      decorations: [],
    };
  } catch {
    return {
      success: false,
      message: '프로필 배지 목록을 불러오지 못했습니다.',
      decorations: [],
    };
  }
};

export const getAdminProfileDecorationsAPI = async () => {
  try {
    const response = await fetch('/api/cite/admin/profile-decorations', {
      method: 'GET',
      headers: addVersionToHeaders(),
      credentials: 'include',
    });
    const result = await parseJsonSafe(response);
    if (response.ok && result?.success) {
      return { success: true, decorations: normalizeDecorations(result.data) };
    }
    return {
      success: false,
      message: result?.message || '프로필 배지 목록을 불러오지 못했습니다.',
      decorations: [],
    };
  } catch {
    return {
      success: false,
      message: '프로필 배지 목록을 불러오지 못했습니다.',
      decorations: [],
    };
  }
};

export const getMyProfileDecorationsAPI = async (): Promise<{
  success: boolean;
  message?: string;
  decorations: ProfileDecorationOption[];
}> => {
  try {
    const response = await fetch('/api/cite/profile-decorations/me', {
      method: 'GET',
      headers: addVersionToHeaders(),
      credentials: 'include',
    });
    const result = await parseJsonSafe(response);
    if (response.ok && result?.success) {
      return { success: true, decorations: normalizeDecorations(result.data) };
    }
    return {
      success: false,
      message: result?.message || '보유한 프로필 배지 목록을 불러오지 못했습니다.',
      decorations: [],
    };
  } catch {
    return {
      success: false,
      message: '보유한 프로필 배지 목록을 불러오지 못했습니다.',
      decorations: [],
    };
  }
};

export const createProfileDecorationAPI = async ({
  key,
  label,
  requiredRole,
  filePath,
  purchaseRequired,
}: {
  key: string;
  label: string;
  requiredRole?: string | null;
  filePath: string;
  purchaseRequired?: boolean;
}) => {
  try {
    const response = await fetch('/api/cite/admin/profile-decorations', {
      method: 'POST',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ key, label, requiredRole, filePath, purchaseRequired }),
    });
    const result = await parseJsonSafe(response);
    if (response.ok && result?.success) {
      return { success: true, decoration: result.data, message: result.message };
    }
    return {
      success: false,
      message: result?.message || '프로필 배지 등록에 실패했습니다.',
    };
  } catch {
    return { success: false, message: '프로필 배지 등록에 실패했습니다.' };
  }
};

export const deleteProfileDecorationAPI = async (id: number) => {
  try {
    const response = await fetch(`/api/cite/admin/profile-decorations/${id}`, {
      method: 'DELETE',
      headers: addVersionToHeaders(),
      credentials: 'include',
    });
    const result = await parseJsonSafe(response);
    if (response.ok && result?.success) {
      return {
        success: true,
        message: result.message || '프로필 배지가 삭제되었습니다.',
      };
    }
    return {
      success: false,
      message: result?.message || '프로필 배지 삭제에 실패했습니다.',
    };
  } catch {
    return { success: false, message: '프로필 배지 삭제에 실패했습니다.' };
  }
};

export const grantProfileDecorationAPI = async ({
  studentNum,
  decorationId,
}: {
  studentNum: string;
  decorationId: number;
}) => {
  try {
    const response = await fetch('/api/cite/admin/profile-decorations/ownership/grant', {
      method: 'POST',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ studentNum, decorationId }),
    });
    const result = await parseJsonSafe(response);
    if (response.ok && result?.success) {
      return { success: true, message: result.message || '프로필 배지가 지급되었습니다.' };
    }
    return { success: false, message: result?.message || '프로필 배지 지급에 실패했습니다.' };
  } catch {
    return { success: false, message: '프로필 배지 지급에 실패했습니다.' };
  }
};

export const revokeProfileDecorationAPI = async ({
  studentNum,
  decorationId,
}: {
  studentNum: string;
  decorationId: number;
}) => {
  try {
    const response = await fetch('/api/cite/admin/profile-decorations/ownership/revoke', {
      method: 'POST',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ studentNum, decorationId }),
    });
    const result = await parseJsonSafe(response);
    if (response.ok && result?.success) {
      return { success: true, message: result.message || '프로필 배지가 회수되었습니다.' };
    }
    return { success: false, message: result?.message || '프로필 배지 회수에 실패했습니다.' };
  } catch {
    return { success: false, message: '프로필 배지 회수에 실패했습니다.' };
  }
};

export const uploadProfileDecorationImageAPI = async (file: File) => {
  try {
    const presigned = await requestPresignedUpload('profile-decoration', file.name);
    if (!presigned.ok) return presigned;

    const upload = await putFileToPresignedUrl(
      presigned.data.uploadUrl,
      file,
      file.type
    );
    if (!upload.ok) return upload;

    return { ok: true as const, data: { key: presigned.data.key } };
  } catch {
    return { ok: false as const, message: '프로필 배지 이미지 업로드에 실패했습니다.' };
  }
};
