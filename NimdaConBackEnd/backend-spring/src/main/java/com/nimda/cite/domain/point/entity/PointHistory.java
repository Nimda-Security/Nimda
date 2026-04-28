package com.nimda.cite.point.entity;

import jakarta.persistence.*;
import lombok.Getter;

@Table(name = "point_history")
@Entity
@Getter
public class PointHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JoinColumn(name = "point_detail_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private PointDetail pointDetail;
}
