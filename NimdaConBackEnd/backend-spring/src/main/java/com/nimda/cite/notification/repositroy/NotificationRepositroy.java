package com.nimda.cite.notification.repositroy;

import com.nimda.cite.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepositroy extends JpaRepository<Notification, Long> {
}
