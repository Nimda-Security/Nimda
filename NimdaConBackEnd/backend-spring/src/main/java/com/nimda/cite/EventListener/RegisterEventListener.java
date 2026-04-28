package com.nimda.cite.EventListener;

import com.nimda.cite.domain.point.service.PointService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RegisterEventListener {
    private final PointService pointService;

}

