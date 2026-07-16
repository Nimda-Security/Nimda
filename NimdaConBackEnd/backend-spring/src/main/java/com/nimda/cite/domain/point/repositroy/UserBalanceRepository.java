package com.nimda.cite.domain.point.repositroy;

import com.nimda.cite.domain.point.entity.UserBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserBalanceRepository extends JpaRepository<UserBalance, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select balance from UserBalance balance where balance.id = :id")
    Optional<UserBalance> findByIdForUpdate(@Param("id") Long id);
}
