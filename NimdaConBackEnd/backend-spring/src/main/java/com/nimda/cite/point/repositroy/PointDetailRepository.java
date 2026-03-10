package com.nimda.cite.point.repositroy;

import com.nimda.cite.point.entity.PointDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PointDetailRepository extends JpaRepository<PointDetail, Long> {
}
