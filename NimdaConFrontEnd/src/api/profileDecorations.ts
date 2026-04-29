import {
  putFileToPresignedUrl,
  requestPresignedUpload,
} from '@/api/attachments';

export interface ProfileDecorationOption {
  id?: number;
  key: string;
  label: string;
  src: string;
  requiredRoles?: string[];
  requiredRole?: string | null;
  active?: boolean;
}

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
    const response = await fetch('/api/profile-decorations', {
      method: 'GET',
      credentials: 'include',
    });
    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      return { success: true, decorations: result.data ?? [] };
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
    const response = await fetch('/api/admin/profile-decorations', {
      method: 'GET',
      credentials: 'include',
    });
    const result = await parseJsonSafe(response);
    if (response.ok && result?.success) {
      return { success: true, decorations: result.data ?? [] };
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

export const createProfileDecorationAPI = async ({
  key,
  label,
  requiredRole,
  filePath,
}: {
  key: string;
  label: string;
  requiredRole?: string | null;
  filePath: string;
}) => {
  try {
    const response = await fetch('/api/admin/profile-decorations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ key, label, requiredRole, filePath }),
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

export const uploadProfileDecorationImageAPI = async (file: File) => {
  const presigned = await requestPresignedUpload('profile-decoration', file.name);
  if (!presigned.ok) return presigned;

  const upload = await putFileToPresignedUrl(
    presigned.data.uploadUrl,
    file,
    file.type
  );
  if (!upload.ok) return upload;

  return { ok: true as const, data: { key: presigned.data.key } };
};
