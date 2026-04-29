package com.nimda.cite.domain.alarm.service;

import com.nimda.cite.domain.alarm.Event.AddChildCommentEvent;
import com.nimda.cite.domain.alarm.Event.AddCommentEvent;
import com.nimda.cite.domain.alarm.Event.CommentLikeEvent;
import com.nimda.cite.domain.alarm.Event.PushLikeButtonEvent;
import com.nimda.cite.domain.alarm.Repository.SseEmitterRepository;
import com.nimda.cite.domain.notification.dto.NotificationResponse;
import com.nimda.cite.domain.notification.entity.Notification;
import com.nimda.cite.domain.notification.enums.NotificationType;
import com.nimda.cite.domain.notification.repositroy.NotificationRepositroy;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

// 비동기 Configuration 설정 및 메인에 @EnableAsync 붙이기
@RequiredArgsConstructor
@Service
public class AlarmService {

    private final SseEmitterRepository sseEmitterRepository;
    private final NotificationRepositroy notificationRepositroy;
    private final UserRepository userRepository;


    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(60 * 1000L * 60 * 24); //
        sseEmitterRepository.save(userId, emitter);

        emitter.onCompletion(() -> sseEmitterRepository.deleteByUserId(userId));
        emitter.onTimeout(() -> sseEmitterRepository.deleteByUserId(userId));

        // 초기 더미 데이터 전송 (연결 후 바로 끊어지지 않게)
        try {
            emitter.send(SseEmitter.event().name("connect").data("Connected to SSE"));
        } catch (IOException e) {
            sseEmitterRepository.deleteByUserId(userId);
        }

        return emitter;
    }

    // 해당 객체가 생성되면 자동으로 실행
    @EventListener
    @Async
    public void handlePushLikeButtonEvent(PushLikeButtonEvent event) {
        // 알림 엔티티 생성
        Notification notification = Notification.builder()
                .recipient(event.getRecipient())
                .sender(event.getSender())
                // 프론트에서 파싱
                .message(event.getSender().getName()+"님이 내 게시글을 좋아합니다.-"+event.getBoard().getTitle())
                .notificationType(NotificationType.PushLikeButtonAtBoard)
                .relatedEntityId(event.getBoard().getId())
                .relatedUrl("/board/view/" + event.getBoard().getId())
                .isRead(false)
                .build();

        this.send(notification);
    }

    // 게시글에 댓글이 달렸을 때 이벤트
    @EventListener
    @Async
    public void handleAddCommentEvent(AddCommentEvent event) {
        // 1. 알림 엔티티 생성
        Notification notification = Notification.builder()
                .recipient(event.getBoardAuthor()) // 게시글 작성자
                .sender(event.getCommentAuthor()) // 댓글 작성자
                .message(event.getCommentAuthor().getName()+"님이 댓글을 남겼습니다.-"+
                        event.getCommentContent())
                .notificationType(NotificationType.AddCommentAtBoard)
                .relatedEntityId(event.getBoardId())
                // 게시글 url
                .relatedUrl("/board/view/" + event.getBoardId())
                .isRead(false)
                .build();

        // 2. 공통 send 메서드 호출 (DB 저장 및 SSE 전송)
        this.send(notification);
    }

    @EventListener
    @Async
    public void handleCommentLikeEvent(CommentLikeEvent event) {
        // 1. 알림 엔티티 생성
        Notification notification = Notification.builder()
                .recipient(event.getCommentAuthor()) // 댓글 작성자
                .sender(event.getLikeUser()) // 좋아요 누른 유저
                .message(event.getLikeUser().getName()+"님이 내 댓글을 좋아합니다.-"+ event.getCommentContent())
                .notificationType(NotificationType.PushLikeButtonAtComment)
                .relatedEntityId(event.getCommentId())
                // url은 수정해야함
                .relatedUrl("/board/view/" + event.getBoardId())
                .isRead(false)
                .build();

        // 2. 공통 send 메서드 호출
        this.send(notification);
    }

    @EventListener
    @Async
    public void handleAddChildCommentEvent(AddChildCommentEvent event) {
        String message = event.getChildCommentAuthor().getNickname() +
                "님이 회원님의 댓글에 답글을 남겼습니다.";

        Notification notification = Notification.builder()
                .recipient(event.getParentsCommentAuthor())
                .sender(event.getChildCommentAuthor())
                .notificationType(NotificationType.AddChildComment)
                .createdAt(LocalDateTime.now())
                .expiredAt(LocalDateTime.now().plusDays(15))
                .relatedEntityId(event.getBoard().getId())
                .relatedUrl("/board/view/" + event.getBoard().getId())
                .isRead(false)
                .message(message)
                .build();

        notificationRepositroy.save(notification);

        this.send(notification);
    }

    // 공지사항 게시글 등록 시 전체 유저에게 알림 전송
    @Transactional
    public void sendNoticeToAll(Long boardId, String boardTitle, Long authorId) {
        User sender = userRepository.findById(authorId).orElse(null);
        List<User> allUsers = userRepository.findAll();

        for (User recipient : allUsers) {
            if (recipient.getId().equals(authorId)) continue;

            Notification notification = Notification.builder()
                    .recipient(recipient)
                    .sender(sender)
                    .message("새 공지사항이 등록되었습니다.-" + boardTitle)
                    .notificationType(NotificationType.NoticePost)
                    .relatedEntityId(boardId)
                    .createdAt(LocalDateTime.now())
                    .expiredAt(LocalDateTime.now().plusDays(15))
                    .relatedUrl("/board/view/" + boardId)
                    .isRead(false)
                    .build();

            notificationRepositroy.save(notification);

            NotificationResponse data = NotificationResponse.from(notification);
            sseEmitterRepository.findByUserId(recipient.getId()).ifPresent(emitter -> {
                try {
                    emitter.send(SseEmitter.event()
                            .name("notification")
                            .data(data));
                } catch (IOException e) {
                    sseEmitterRepository.deleteByUserId(recipient.getId());
                }
            });
        }
    }

    @Transactional
    public void send(Notification notification) {
        this.notificationRepositroy.save(notification);
        // 메시지랑 url 같이 전달
        NotificationResponse data = NotificationResponse.from(notification);

        Long recipientId = notification.getRecipient().getId();
        sseEmitterRepository.findByUserId(recipientId).ifPresent(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification") // 이벤트 이름을 통일하면 프론트에서 관리하기 편합니다
                        .data(data));
            } catch (IOException e) {
                sseEmitterRepository.deleteByUserId(recipientId);
            }
        });
    }
}
