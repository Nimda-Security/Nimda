package com.nimda.cite.attendance.service;

import com.nimda.cite.attendance.entity.Attendance;
import com.nimda.cite.attendance.repositroy.AttendanceRepositroy;
import com.nimda.cite.attendance.entity.AttendanceLog;
import com.nimda.cite.attendance.repositroy.AttendanceLogRepository;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepositroy attendanceRepository;
    private final UserRepository userRepository;
    private final AttendanceLogRepository logRepository;

    // 출석 체크
    @Transactional
    public void markAttendance(Long userId) {

        Attendance attendance = attendanceRepository.findById(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."));

                    // 새로운 출석부 생성 및 저장
                    Attendance newAttendance = new Attendance(user);
                    return attendanceRepository.save(newAttendance);
                });

        LocalDate today = LocalDate.now();

        // 중복 체크
        if (attendance.getLastDate() != null && attendance.getLastDate().equals(today)) {
            throw new IllegalStateException("이미 오늘 출석을 완료했습니다.");
        }

        // 상태 업데이트 (totalCount 증가, lastDate 갱신 등)
        attendance.updateStatus(today);

        // 출석 로그 기록
        AttendanceLog log = AttendanceLog.builder()
                .user(attendance.getUser())
                .attendanceDate(LocalDateTime.now()) // LocalDateTime 타입 확인 필요
                .build();

        logRepository.save(log);
    }

    // 오늘 출석자 전체 조회 (최신순)
    public List<AttendanceLog> getTodayVisitors() {
        return logRepository.findByAttendanceDateOrderByAttendanceDateDesc(LocalDate.now());
    }

    // 연속 출석(Streak) 상위 5명 조회
    public List<Attendance> getTop5ByConsecutive() {
        return attendanceRepository.findTop5ByOrderByConsecutiveCountDesc();
    }

    /**
     * 누적 출석 상위 5명 조회
     */
    public List<Attendance> getTop5ByTotal() {
        return attendanceRepository.findTop5ByOrderByTotalCountDesc();
    }

    public Attendance getUserAttendance(Long userId) {
        return attendanceRepository.findById(userId).orElseThrow();
    }

    // 사용자별 상세 출석 로그 조회 (최근순)
    public List<AttendanceLog> getUserLogs(Long userId) {
        return logRepository.findByUserIdOrderByAttendanceDateDesc(userId);
    }
}