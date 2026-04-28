package com.nimda.cite.domain.alarm.Event;

import lombok.Builder;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.time.LocalDateTime;

@Getter
public class RegisterUserEvent extends ApplicationEvent {

    private Long userId;
    private LocalDateTime createdAt;

    public RegisterUserEvent(Object source, Long userId) {
        super(source);
        this.userId = userId;
        this.createdAt = LocalDateTime.now();
    }
}
