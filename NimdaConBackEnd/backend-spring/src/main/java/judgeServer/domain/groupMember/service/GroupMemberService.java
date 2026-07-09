package judgeServer.domain.groupMember.service;

import jakarta.persistence.EntityNotFoundException;
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

    private void validateLeader(Long groupId, Long userId) {
        GroupMember member = getMember(groupId, userId);
        if (member.getRole() != MemberRole.LEADER) {
            throw new AccessDeniedException("그룹장만 수행할 수 있습니다.");
        }
    }


}
