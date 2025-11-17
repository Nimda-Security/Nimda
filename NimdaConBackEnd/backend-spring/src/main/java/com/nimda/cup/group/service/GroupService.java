package com.nimda.cup.group.service;

import com.nimda.cup.group.dto.GroupCreateRequest;
import com.nimda.cup.group.dto.GroupMemberAddRequest;
import com.nimda.cup.group.dto.GroupMemberResponse;
import com.nimda.cup.group.dto.GroupResponse;
import com.nimda.cup.group.entity.GroupMembership;
import com.nimda.cup.group.entity.StudyGroup;
import com.nimda.cup.group.repository.GroupMembershipRepository;
import com.nimda.cup.group.repository.StudyGroupRepository;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.service.UserService;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class GroupService {

        @Autowired
        private StudyGroupRepository studyGroupRepository; // CRUD 작업을 위한 리포지토리
        @Autowired
        private GroupMembershipRepository groupMembershipRepository;
        @Autowired
        private UserService userService;

        @Transactional
        public GroupResponse createGroup(GroupCreateRequest request) {

                // * [Exception] 실제로 존재하는 사용자인지 체크 *
                User creator = userService.findById(request.getCreatorUserId())
                                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

                // * [Exception] 참여 코드가 이미 사용 중인지 체크 *
                if (StringUtils.hasText(request.getParticipationCode())
                                && studyGroupRepository.existsByParticipationCode(request.getParticipationCode())) {
                        throw new IllegalStateException("이미 사용 중인 참여 코드입니다.");
                }

                // * [Entity] StudyGroup - 스터디 그룹 엔터티 생성 *
                StudyGroup group = new StudyGroup(
                                request.getGroupName(),
                                request.getMaxMembers(),
                                request.getParticipationCode(),
                                Boolean.TRUE.equals(request.getIsPublic()),
                                creator);

                StudyGroup saved = studyGroupRepository.save(group);

                return GroupResponse.builder()
                                .groupId(saved.getId())
                                .groupName(saved.getGroupName())
                                .maxMembers(saved.getMaxMembers())
                                .isPublic(saved.getIsPublic())
                                .participationCode(saved.getParticipationCode())
                                .creatorUserId(saved.getCreatedBy().getId())
                                .createdAt(saved.getCreatedAt())
                                .updatedAt(saved.getUpdatedAt())
                                .build();
        }

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
                                .username(user.getNickname())
                                .role(saved.getRole())
                                .active(saved.isActive())
                                .joinedAt(saved.getJoinedAt())
                                .leftAt(saved.getLeftAt())
                                .build();
        }

        // * 모든 스터디 그룹 조회 API *
        // * DB에 젖아된 모든 스터디그룹을 조회해서 GroupResponse 객체로 변환해 리턴한다.
        @Transactional(readOnly = true)
        public List<GroupResponse> getAllGroups() {
                return studyGroupRepository.findAll().stream()
                                .map(group -> GroupResponse.builder()
                                                .groupId(group.getId())
                                                .groupName(group.getGroupName())
                                                .maxMembers(group.getMaxMembers())
                                                .isPublic(group.getIsPublic())
                                                .participationCode(group.getParticipationCode())
                                                .creatorUserId(group.getCreatedBy().getId())
                                                .createdAt(group.getCreatedAt())
                                                .updatedAt(group.getUpdatedAt())
                                                .build())
                                .collect(Collectors.toList());
        }

        // * 스터디 그룹 멤버 조회 API *
        // * 특정 그룹의 활성 멤버들을 조회해서 GroupMemberResponse 리스트로 반환한다.
        @Transactional(readOnly = true)
        public List<GroupMemberResponse> getGroupMembers(Long groupId) {

                // * [Exception] 그룹을 찾을 수 없는 경우 *
                StudyGroup group = studyGroupRepository.findById(groupId)
                                .orElseThrow(() -> new IllegalArgumentException("스터디 그룹을 찾을 수 없습니다."));

                // * 활성 멤버 조회 (leftAt이 null인 멤버들) *
                List<GroupMembership> activeMembers = groupMembershipRepository.findAllByGroupAndLeftAtIsNull(group);

                // * GroupMemberResponse로 변환하여 반환 *
                return activeMembers.stream()
                                .map(membership -> GroupMemberResponse.builder()
                                                .membershipId(membership.getId())
                                                .groupId(group.getId())
                                                .userId(membership.getUser().getId())
                                                .username(membership.getUser().getNickname())
                                                .role(membership.getRole())
                                                .active(membership.isActive())
                                                .joinedAt(membership.getJoinedAt())
                                                .leftAt(membership.getLeftAt())
                                                .build())
                                .collect(Collectors.toList());
        }
}
