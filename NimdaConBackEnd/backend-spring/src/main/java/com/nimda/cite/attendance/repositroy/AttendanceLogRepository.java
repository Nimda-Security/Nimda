package com.nimda.cite.attendance.repositroy;

import com.nimda.cite.attendance.entity.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {
                // 1. Fetch Join으로 User 정보를 한 번에 가져옴 (성능 최적화)
                // 2. LocalDateTime의 시작점(00:00:00)부터 끝점(23:59:59)까지 검색
                @Query("SELECT a FROM AttendanceLog a " +
                        "JOIN FETCH a.user " +
                        "WHERE a.attendanceDate >= :start AND a.attendanceDate <= :end " +
                        "ORDER BY a.id DESC")
                List<AttendanceLog> findTodayVisitorsWithUser(
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end
                );
        List<AttendanceLog> findByUserIdOrderByAttendanceDateDesc(Long userId);
}
