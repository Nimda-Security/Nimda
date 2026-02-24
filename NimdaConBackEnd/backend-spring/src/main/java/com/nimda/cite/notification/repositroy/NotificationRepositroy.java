package com.nimda.cite.notification.repositroy;

import com.nimda.cite.notification.entity.Notification;
import com.nimda.cup.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepositroy extends JpaRepository<Notification, Long> {
    // 읽지 않은 알림 개수 확인

    Long countByRecipientAndIsReadFalse(User recipient);

    // 모든 알림 생성순으로 가지고 오기
    @Query("SELECT n FROM Notification n JOIN FETCH n.sender " +
            "WHERE n.recipient = :recipient " +
            "ORDER BY n.createdAt DESC") // 정렬을 JPQL 안으로 이동
    List<Notification> findAllByRecipient(@Param("recipient") User recipient);
    // 발송된 알림 중 읽지 않은 알림 가지고 오기
    List<Notification> findAllByRecipientAndIsReadFalse(User user);
    // 읽지 않은 알림 존재 여부
    boolean existsByRecipientIdAndIsReadFalse(Long recipient);

    // 읽지 않은 알림 개수
    Long countByRecipientIdAndIsReadFalse(Long userId);
}
