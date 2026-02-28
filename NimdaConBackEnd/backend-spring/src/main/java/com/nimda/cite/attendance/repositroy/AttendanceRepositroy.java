package com.nimda.cite.attendance.repositroy;

import com.nimda.cite.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface AttendanceRepositroy extends JpaRepository<Attendance, Long> {
    List<Attendance> findTop5ByOrderByConsecutiveCountDesc(); // 연속 출석 랭킹
    List<Attendance> findTop5ByOrderByTotalCountDesc();
}
