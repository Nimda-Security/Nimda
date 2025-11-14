package com.nimda.cup.group.service;

import com.nimda.cup.group.dto.GroupMemberAddRequest;
import com.nimda.cup.group.dto.GroupMemberResponse;
import com.nimda.cup.group.entity.GroupMembership;
import com.nimda.cup.group.entity.StudyGroup;
import com.nimda.cup.group.repository.GroupMembershipRepository;
import com.nimda.cup.group.repository.StudyGroupRepository;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GroupService {

    @Autowired
    private StudyGroupRepository studyGroupRepository; // CRUD 작업을 위한 리포지토리
    @Autowired
    private GroupMembershipRepository groupMembershipRepository;
    @Autowired
    private UserService userService;

    @Transactional
    public GroupMemberResponse addMember(Long groupId, GroupMemberAddRequest request) {

        // * [Exception] 그룹을 찾을 수 없는 경우 *
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("스터디 그룹을 찾을 수 없습니다."));

        // * [Exception] 사용자를 찾을 수 없는 경우 *
        User user = userService.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // * [Exception] StudyGroup - 스터디 그룹 엔터티에서 정원을 초과하지 않는지 테스트 *
        if (group.isFull()) {
            throw new IllegalStateException("그룹 정원이 가득 찼습니다.");
        }

        // * [Exception] existsByGroupAndUserAndLeftAtIsNull() - 이미 그룹에 가입된 사용자인지 테스트 *
        boolean alreadyMember = groupMembershipRepository.existsByGroupAndUserAndLeftAtIsNull(group, user);
        if (alreadyMember) {
            throw new IllegalStateException("이미 그룹에 가입된 사용자입니다.");
        }

        // TODO: 비공개 그룹일 경우 participationCode 검증 로직 추가

        // * [Entity] GroupMembership - 그룹 멤버십 엔터티 생성 *
        GroupMembership membership = new GroupMembership(user, group, request.getRole());
        GroupMembership saved = groupMembershipRepository.save(membership); // DB 저장

        // * [Response] GroupMemberResponse - 그룹 멤버십 응답 객체 생성 *
        return GroupMemberResponse.builder()
                .membershipId(saved.getId())
                .groupId(group.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .role(saved.getRole())
                .active(saved.isActive())
                .joinedAt(saved.getJoinedAt())
                .leftAt(saved.getLeftAt())
                .build();
    }
}
