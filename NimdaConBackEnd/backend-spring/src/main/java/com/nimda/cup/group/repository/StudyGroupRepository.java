package com.nimda.cup.group.repository;

import com.nimda.cup.group.entity.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
}

// 기본 CURD 작업 지원 레포지토리