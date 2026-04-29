package com.nimda.cite.domain.attendance.repositroy;

import com.nimda.cite.domain.attendance.entity.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {
                // 1. Fetch Join으로 User 정보를 한 번에 가져옴 (성능 최적화)
                // 2. LocalDateTime의 시작점(00:00:00)부터 끝점(23:59:59)까지 검색
                @Query("SELECT a FROM AttendanceLog a " +
                        "JOIN FETCH a.user " +
                        "WHERE a.id IN (" +
                        "    SELECT MAX(l.id) FROM AttendanceLog l " +
                        "    WHERE l.attendanceDate >= :start AND l.attendanceDate <= :end " +
                        "    GROUP BY l.user.id" +
                        ") " +
                        "ORDER BY a.id DESC")
                List<AttendanceLog> findTodayVisitorsWithUser(
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end
                );

        boolean existsByUserIdAndAttendanceDateBetween(Long userId, LocalDateTime start, LocalDateTime end);
        List<AttendanceLog> findByUserIdOrderByAttendanceDateDesc(Long userId);
}
