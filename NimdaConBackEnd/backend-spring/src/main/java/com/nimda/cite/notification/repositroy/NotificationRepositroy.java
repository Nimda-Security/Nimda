package com.nimda.cite.notification.repositroy;

import com.nimda.cite.notification.entity.Notification;
import com.nimda.cup.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepositroy extends JpaRepository<Notification, Long> {
    // 읽지 않은 알림 개수 확인
    Long countByRecipientAndIsReadFalse(User recipient);

    // 수신자별 알림 목록 (최신순)
    List<Notification> findAllByRecipientOrderByCreatedAtDesc(User recipient);
    
    // 발송된 알림 중 읽지 않은 알림 가지고 오기
    List<Notification> findAllByRecipientAndIsReadFalse(User user);
}
