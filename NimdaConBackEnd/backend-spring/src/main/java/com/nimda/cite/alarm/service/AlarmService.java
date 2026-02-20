package com.nimda.cite.alarm.service;

import com.nimda.cite.alarm.Event.PushLikeButtonEvent;
import com.nimda.cite.alarm.Repository.SseEmitterRepository;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

// 추가해야 하는 것들
// 비동기 Configuration 설정 및 메인에 @EnableAsync 붙이기

@Service
public class AlarmService {
    private final SseEmitterRepository sseEmitterRepository;

    public AlarmService(SseEmitterRepository sseEmitterRepository) {
        this.sseEmitterRepository = sseEmitterRepository;
    }

    // 클라이언트가 SSE 구독을 요청할 때 호출
    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(60 * 1000L); // 타임아웃 1분
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
    public void sendPushLikeButtonEvent(Long userId ,PushLikeButtonEvent event) {
        String message = event.getBoard().getTitle() + "에 " +
                event.getUser().getNickname()+"님이 좋아요를 눌렀습니다.";
        this.sseEmitterRepository.findByUserId(userId).ifPresent(emitter ->
        {
            try {
                emitter.send(SseEmitter.event()
                        .name("Push Like Button")
                        .data(message));
            }
            catch (IOException e) {
                sseEmitterRepository.deleteByUserId(userId);
            }
        });
    }
}
