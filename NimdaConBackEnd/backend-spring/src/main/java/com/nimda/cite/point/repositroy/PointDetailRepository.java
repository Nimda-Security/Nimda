package com.nimda.cite.point.repositroy;

import com.nimda.cite.point.entity.PointHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PointDetailRepository extends JpaRepository<PointHistory, Long> {
}
