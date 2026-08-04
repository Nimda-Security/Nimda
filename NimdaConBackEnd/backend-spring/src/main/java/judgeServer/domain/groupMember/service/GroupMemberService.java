package judgeServer.domain.groupMember.service;

import com.nimda.cite.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import judgeServer.domain.group.entity.Group;
import judgeServer.domain.groupMember.dto.GroupMemberResponse;
import judgeServer.domain.groupMember.entity.GroupMember;
import judgeServer.domain.groupMember.enums.MemberRole;
import judgeServer.domain.groupMember.repository.GroupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class GroupMemberService {

    @Autowired
    private GroupMemberRepository memberRepository;

    public List<GroupMemberResponse> getMembers(Long groupId) {
        return memberRepository.findByGroupId(groupId).stream()
                .map(GroupMemberResponse::from)
                .toList();
    }

    // 멤버 생성 (그룹 생성 시 그룹장 등록, 가입 요청 수락 시 멤버 등록 등에서 공통으로 사용)
    @Transactional
    public GroupMember addMember(Group group, User user, MemberRole role) {
        if (memberRepository.existsByGroupIdAndUserId(group.getId(), user.getId())) {
            throw new IllegalStateException("이미 그룹에 가입되어 있습니다.");
        }
        GroupMember member = GroupMember.builder()
                .group(group)
                .user(user)
                .role(role)
                .build();
        return memberRepository.save(member);
    }

    // 그룹장 위임 (기존 그룹장 -> 다른 멤버). 위임 후에는 기존 그룹장도 leave 가능
    @Transactional
    public void transferLeadership(Long groupId, Long currentLeaderId, Long newLeaderId) {
        if (currentLeaderId.equals(newLeaderId)) {
            throw new IllegalArgumentException("본인에게 위임할 수 없습니다.");
        }
        GroupMember currentLeader = getMember(groupId, currentLeaderId);
        if (currentLeader.getRole() != MemberRole.LEADER) {
            throw new AccessDeniedException("그룹장만 위임할 수 있습니다.");
        }
        GroupMember newLeader = getMember(groupId, newLeaderId);

        currentLeader.updateRole(MemberRole.MEMBER);
        newLeader.updateRole(MemberRole.LEADER);
    }

    // 본인 탈퇴
    @Transactional
    public void leave(Long groupId, Long userId) {
        GroupMember member = getMember(groupId, userId);
        if (member.getRole() == MemberRole.LEADER) {
            throw new IllegalStateException("그룹장은 위임 후 탈퇴할 수 있습니다.");
        }
        memberRepository.delete(member);
    }

    // 강퇴
    @Transactional
    public void kick(Long groupId, Long leaderId, Long targetUserId) {
        validateLeader(groupId, leaderId);
        if (leaderId.equals(targetUserId)) {
            throw new IllegalArgumentException("본인을 강퇴할 수 없습니다.");
        }
        GroupMember target = getMember(groupId, targetUserId);
        memberRepository.delete(target);
    }

    private GroupMember getMember(Long groupId, Long userId) {
        return memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new EntityNotFoundException("그룹 멤버가 아닙니다."));
    }

    // 그룹장 여부 확인 (예외를 던지지 않는 단순 조회용, 예: 신청/초대 처리 권한 판단)
    public boolean isLeader(Long groupId, Long userId) {
        return memberRepository.findByGroupIdAndUserId(groupId, userId)
                .map(member -> member.getRole() == MemberRole.LEADER)
                .orElse(false);
    }

    // @AuthenticationPrincipal로 가져온 userId가 해당 그룹의 그룹장인지 검증.
    // 그룹장 권한은 group_members 테이블의 role(그룹별 데이터)이라 Spring Security의
    // hasRole()로는 표현할 수 없어 서비스 단에서 직접 검증한다.
    // GroupService/GroupJoinRequestService 등 다른 도메인 서비스에서도 이 메소드를 재사용한다.
    public GroupMember validateLeader(Long groupId, Long userId) {
        GroupMember member = getMember(groupId, userId);
        if (member.getRole() != MemberRole.LEADER) {
            throw new AccessDeniedException("그룹장만 수행할 수 있습니다.");
        }
        return member;
    }

}
