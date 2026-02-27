package com.nimda.cite.alarm.service;

import com.nimda.cite.alarm.Event.AddChildCommentEvent;
import com.nimda.cite.alarm.Event.AddCommentEvent;
import com.nimda.cite.alarm.Event.CommentLikeEvent;
import com.nimda.cite.alarm.Event.PushLikeButtonEvent;
import com.nimda.cite.alarm.Repository.SseEmitterRepository;
import com.nimda.cite.notification.dto.NotificationResponse;
import com.nimda.cite.notification.entity.Notification;
import com.nimda.cite.notification.enums.NotificationType;
import com.nimda.cite.notification.repositroy.NotificationRepositroy;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

// 비동기 Configuration 설정 및 메인에 @EnableAsync 붙이기
@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class AlarmService {

    private final SseEmitterRepository sseEmitterRepository;
    private final NotificationRepositroy notificationRepositroy;

    // 클라이언트가 SSE 구독을 요청할 때 호출
    @Transactional
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
                .message(event.getBoard().getTitle() + "에 " + event.getSender().getNickname() + "님이 좋아요를 눌렀습니다.")
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
                .message(event.getBoardTitle() + " 게시글에 새로운 댓글이 달렸습니다.")
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
                .message("작성하신 댓글 '" + event.getCommentContent() + "'에 좋아요가 눌렸습니다.")
                .notificationType(NotificationType.PushLikeButtonAtComment)
                .relatedEntityId(event.getCommentId())
                // url은 수정해야함
                .relatedUrl("/board/view/" + event.getBoardId() + "#comment-" + event.getCommentId())
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
                .isRead(false)
                .message(message)
                .build();

        this.send(notification);
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
