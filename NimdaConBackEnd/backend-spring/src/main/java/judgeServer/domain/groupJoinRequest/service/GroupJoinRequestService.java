package judgeServer.domain.groupJoinRequest.service;

import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import judgeServer.domain.group.entity.Group;
import judgeServer.domain.group.repository.GroupRepository;
import judgeServer.domain.groupJoinRequest.dto.GroupJoinRequestResponse;
import judgeServer.domain.groupJoinRequest.entity.GroupJoinRequest;
import judgeServer.domain.groupJoinRequest.enums.JoinRequestStatus;
import judgeServer.domain.groupJoinRequest.enums.JoinType;
import judgeServer.domain.groupJoinRequest.repository.GroupJoinRequestRepository;
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
public class GroupJoinRequestService {

    @Autowired
    private GroupJoinRequestRepository joinRequestRepository;

    @Autowired
    private GroupRepository groupRepository;

    // @Autowired
    // private ActivityRepository activityRepository;

    @Autowired
    private GroupMemberRepository memberRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Long applyToGroup(Long groupId, Long userId) {
        validateNotAlreadyMember(groupId, userId);
        validateNoPendingRequest(groupId, userId);

        Group group = getGroup(groupId);
        User user = getUser(userId);

        GroupJoinRequest request = GroupJoinRequest.builder()
                .group(group)
                .user(user)
                .joinType(JoinType.APPLY)
                .status(JoinRequestStatus.PENDING)
                .build();

        return joinRequestRepository.save(request).getId();
    }

    // 그룹장이 특정 사용자를 초대
    @Transactional
    public Long inviteToGroup(Long groupId, Long inviterId, Long inviteeId) {
        validateLeader(groupId, inviterId);
        validateNotAlreadyMember(groupId, inviteeId);
        validateNoPendingRequest(groupId, inviteeId);

        Group group = getGroup(groupId);
        User invitee = getUser(inviteeId);

        GroupJoinRequest request = GroupJoinRequest.builder()
                .group(group)
                .user(invitee)
                .joinType(JoinType.INVITE)
                .status(JoinRequestStatus.PENDING)
                .build();

        return joinRequestRepository.save(request).getId();
    }

    // 요청 수락 (신청 -> 그룹장이 수락 / 초대 -> 초대받은 사람이 수락)
    @Transactional
    public void accept(Long requestId, Long actorId) {
        GroupJoinRequest request = getRequest(requestId);
        validateActor(request, actorId);
        validatePending(request);

        Long groupId = request.getGroup().getId();
        validateCapacity(groupId);

        request.updateStatus(JoinRequestStatus.ACCEPTED);

        GroupMember member = GroupMember.builder()
                .group(request.getGroup())
                .user(request.getUser())
                .role(MemberRole.MEMBER)
                .build();
        memberRepository.save(member);
    }

    // 요청 거절
    @Transactional
    public void reject(Long requestId, Long actorId) {
        GroupJoinRequest request = getRequest(requestId);
        validateActor(request, actorId);
        validatePending(request);

        request.updateStatus(JoinRequestStatus.REJECTED);
    }

    // 요청 취소 (신청자 본인 or 초대한 사람이 취소하는 케이스는 별도 확장 가능)
    @Transactional
    public void cancel(Long requestId, Long userId) {
        GroupJoinRequest request = getRequest(requestId);
        if (!request.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("본인의 요청만 취소할 수 있습니다.");
        }
        validatePending(request);

        request.updateStatus(JoinRequestStatus.CANCELED);
    }

    public List<GroupJoinRequestResponse> getPendingRequestsOfGroup(Long groupId) {
        return joinRequestRepository.findByGroupIdAndStatus(groupId, JoinRequestStatus.PENDING)
                .stream()
                .map(GroupJoinRequestResponse::from)
                .toList();
    }

    public List<GroupJoinRequestResponse> getMyInvitations(Long userId) {
        return joinRequestRepository.findByUserIdAndJoinType(userId, JoinType.INVITE)
                .stream()
                .map(GroupJoinRequestResponse::from)
                .toList();
    }

    // --- private helpers ---

    private void validateActor(GroupJoinRequest request, Long actorId) {
        boolean isTargetUser = request.getUser().getId().equals(actorId);
        boolean isGroupLeader = memberRepository
                .findByGroupIdAndRole(request.getGroup().getId(), MemberRole.LEADER)
                .map(leader -> leader.getUser().getId().equals(actorId))
                .orElse(false);

        if (request.getJoinType() == JoinType.APPLY && !isGroupLeader) {
            throw new AccessDeniedException("그룹장만 신청을 수락/거절할 수 있습니다.");
        }
        if (request.getJoinType() == JoinType.INVITE && !isTargetUser) {
            throw new AccessDeniedException("초대받은 본인만 수락/거절할 수 있습니다.");
        }
    }

    private void validatePending(GroupJoinRequest request) {
        if (request.getStatus() != JoinRequestStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 요청입니다.");
        }
    }

    private void validateNotAlreadyMember(Long groupId, Long userId) {
        if (memberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new IllegalStateException("이미 그룹에 가입되어 있습니다.");
        }
    }

    private void validateNoPendingRequest(Long groupId, Long userId) {
        if (joinRequestRepository.existsByGroupIdAndUserIdAndStatus(
                groupId, userId, JoinRequestStatus.PENDING)) {
            throw new IllegalStateException("이미 진행 중인 요청이 존재합니다.");
        }
    }

    private void validateCapacity(Long groupId) {
        Group group = getGroup(groupId);
        long currentCount = memberRepository.countByGroupId(groupId);
        if (currentCount >= group.getCapacity()) {
            throw new IllegalStateException("그룹 정원이 초과되었습니다.");
        }
    }

    private void validateLeader(Long groupId, Long userId) {
        GroupMember member = memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new AccessDeniedException("그룹 멤버가 아닙니다."));
        if (member.getRole() != MemberRole.LEADER) {
            throw new AccessDeniedException("그룹장만 수행할 수 있습니다.");
        }
    }

    private Group getGroup(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 그룹입니다."));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 사용자입니다."));
    }

    private GroupJoinRequest getRequest(Long requestId) {
        return joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 요청입니다."));
    }

}
