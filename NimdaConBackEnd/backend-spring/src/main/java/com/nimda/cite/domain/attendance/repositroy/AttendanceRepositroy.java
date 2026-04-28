package com.nimda.cite.domain.attendance.repositroy;

import com.nimda.cite.domain.attendance.entity.Attendance;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface AttendanceRepositroy extends JpaRepository<Attendance, Long> {
    List<Attendance> findTop5ByOrderByConsecutiveCountDesc(); // 연속 출석 랭킹
    List<Attendance> findTop5ByOrderByTotalCountDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Attendance a WHERE a.id = :userId")
    Optional<Attendance> findByIdForUpdate(@Param("userId") Long userId);

    @Query("SELECT a.totalCount FROM Attendance a WHERE a.user.id = :userId")
    Optional<Long> findTotalCountByUserId(@Param("userId") Long userId);
}
