import axios from 'axios';
import { getAuthToken } from './auth';

// 백엔드 NotificationResponse DTO 매핑
// ApiResponse<T> = { success: boolean, message?: string, data?: T }
// @JsonInclude(NON_NULL) 적용 — null 필드는 JSON에서 제외됨
export interface NotificationResponse {
  id: number;
  unReadCount?: number;
  senderNickName?: string;
  message: string;
  url?: string;
  hasUnRead?: boolean;
  createdAt: string;    // LocalDateTime → ISO string "2025-01-15T10:30:00"
  isRead: boolean;
}

interface ApiResponseWrapper<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const api = axios.create({
  baseURL: '/api/notifications',
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notificationApi = {
  // GET /api/notifications → { success, data: NotificationResponse[] }
  getNotifications: async (): Promise<NotificationResponse[]> => {
    const { data } = await api.get<ApiResponseWrapper<NotificationResponse[]>>('');
    return data.data ?? [];
  },

  // GET /api/notifications/unRead → { success, data: NotificationResponse[] }
  getUnReadNotifications: async (): Promise<NotificationResponse[]> => {
    const { data } = await api.get<ApiResponseWrapper<NotificationResponse[]>>('/unRead');
    return data.data ?? [];
  },

  // PATCH /api/notifications/{id}/read → { success }
  markAsRead: async (notificationId: number): Promise<void> => {
    await api.patch(`/${notificationId}/read`);
  },

  // PATCH /api/notifications/readAll → { success }
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/readAll');
  },

  // GET /api/notifications/hasUnread → { success, data: { hasUnRead, unReadCount } }
  checkUnreadStatus: async (): Promise<{ hasUnRead: boolean; unReadCount: number }> => {
    const { data } = await api.get<ApiResponseWrapper<{ hasUnRead: boolean; unReadCount: number }>>('/hasUnread');
    return data.data ?? { hasUnRead: false, unReadCount: 0 };
  },

  // DELETE /api/notifications/{id} → { success, message }
  deleteNotification: async (notificationId: number): Promise<void> => {
    await api.delete(`/${notificationId}`);
  },

  // SSE 구독: GET /api/alarm/subscribe (Authorization 헤더 필요)
  subscribe: (onNotification: (data: NotificationResponse) => void): AbortController | null => {
    const token = getAuthToken();
    if (!token) return null;

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch('/api/alarm/subscribe', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          let eventName = '';
          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith('data:') && eventName === 'notification') {
              try {
                const parsed: NotificationResponse = JSON.parse(line.slice(5).trim());
                onNotification(parsed);
              } catch {
                // parse 실패 무시
              }
              eventName = '';
            } else if (line === '') {
              eventName = '';
            }
          }
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.warn('SSE 연결 오류:', e);
        }
      }
    })();

    return controller;
  }
};

