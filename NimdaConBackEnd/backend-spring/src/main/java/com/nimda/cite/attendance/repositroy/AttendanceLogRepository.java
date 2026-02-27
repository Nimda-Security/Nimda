package com.nimda.cite.attendance.repositroy;

import com.nimda.cite.attendance.entity.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {
        List<AttendanceLog> findByAttendanceDateOrderByAttendanceDateDesc(LocalDate date);
        List<AttendanceLog> findByUserIdOrderByAttendanceDateDesc(Long userId);
}
