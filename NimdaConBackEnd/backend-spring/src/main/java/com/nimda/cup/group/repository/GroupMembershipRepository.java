package com.nimda.cup.group.repository;

import com.nimda.cup.group.entity.GroupMembership;
import com.nimda.cup.group.entity.StudyGroup;
import com.nimda.cup.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMembershipRepository extends JpaRepository<GroupMembership, Long> {

    boolean existsByGroupAndUserAndLeftAtIsNull(StudyGroup group, User user); // 특정 그룹에 사용자가 현재 멤버로 있는지 혹인한다.

    Optional<GroupMembership> findByGroupAndUserAndLeftAtIsNull(StudyGroup group, User user); // 활성된 멤버십을 조회한다.

    List<GroupMembership> findAllByGroupAndLeftAtIsNull(StudyGroup group); // 그룹의 활성 멤버 전체를 조회한다.
}

// leftAt 이 null인 경우는 활성 멤버십을 의미한다.
