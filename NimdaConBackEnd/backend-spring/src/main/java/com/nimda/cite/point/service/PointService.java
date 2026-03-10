package com.nimda.cite.point.service;

import com.nimda.cite.point.entity.PointDetail;
import com.nimda.cite.point.entity.UserBalance;
import com.nimda.cite.point.enums.PointTypes;
import com.nimda.cite.point.repositroy.PointDetailRepository;
import com.nimda.cite.point.repositroy.UserBalanceRepository;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PointService {

    private final UserBalanceRepository userBalanceRepository;
    private final PointDetailRepository pointDetailRepository;
    private final UserRepository userRepository;

    // 계좌 삭제 시 cascade를 직접 하는 것이 좀 더 나은 선택임
    // softDelete를 할 수 있기 때문
    @Transactional
    public void deleteBalance(Long userId) {

    }

    // 자동 적립 - 출석, 알고리즘 풀이, 스터디 참여
    @Transactional
    public void updateBalance(Long userId, PointTypes type) {
        // 최초 출석 시 계좌가 존재하지 않기 때문에 생성해야 함
        User user = userRepository.findById(userId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 유저입니다.")
        );

        // 유저의 계좌가 존재하지 않음
        if(userBalanceRepository.existsById(user.getId())) {
            UserBalance newUserBalance = UserBalance.builder()
                    .totalAmount(0L)
                    .updatedAt(LocalDateTime.now())
                    .build();
            userBalanceRepository.save(newUserBalance);
        }
    }

    // 수동 적립 - 행사 참여 같이 내용이 변동되거나 포인트 지급이 다 다른 경우
    @Transactional
    public void updateBalance(Long balanceId,String description ,Long point) {

    }

}
