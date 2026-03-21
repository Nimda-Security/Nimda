import axios from 'axios';

// 1. Response 인터페이스 정의
export interface NotificationResponse {
id: number;
message: string;
isRead: boolean;
createdAt: string;
hasUnRead?: boolean;
unReadCount?: number;
// 필요 시 DTO에 정의된 필드 추가 (예: 햄스터가 내 게시글을 좋아합니다 등)
}

const api = axios.create({
baseURL: '/api/notifications',
});

// 인터셉터를 활용해 Authorization 헤더 자동 주입 (토큰 관리 효율화)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // 또는 쿠키/상태관리 도구
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notificationApi = {
  // 도착한 알림 최신순 조회
  getNotifications: async (): Promise<NotificationResponse[]> => {
    const { data } = await api.get('');
    return data.notifications;
  },

  // 읽지 않은 알림만 조회
  getUnReadNotifications: async (): Promise<NotificationResponse[]> => {
    const { data } = await api.get('/unRead');
    return data.notifications;
  },

  // 알림 개별 읽기 처리
  markAsRead: async (notificationId: number): Promise<void> => {
    await api.patch(`/${notificationId}/read`);
  },

  // 모든 읽지 않은 알림 읽기 처리
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/readAll');
  },

  // 읽지 않은 알림 개수 및 존재 여부 확인
  checkUnreadStatus: async (): Promise<NotificationResponse> => {
    const { data } = await api.get('/hasUnread');
    return data;
  },

  // 알림 삭제
  deleteNotification: async (notificationId: number): Promise<void> => {
    await api.delete(`/${notificationId}`);
  }
};

