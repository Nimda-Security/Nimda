package com.nimda.cite.point.repositroy;

import com.nimda.cite.point.entity.UserBalance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBalanceRepository extends JpaRepository<UserBalance, Long> {
}
