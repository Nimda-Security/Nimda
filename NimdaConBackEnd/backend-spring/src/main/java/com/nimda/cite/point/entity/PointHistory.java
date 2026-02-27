package com.nimda.cite.point.entity;

import com.nimda.cup.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Table(name = "point_history")
@Entity
public class PointHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JoinColumn(name = "point_detail_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private PointDetail pointDetail;
}
