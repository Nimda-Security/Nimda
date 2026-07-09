package judgeServer.domain.group.service;

import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import judgeServer.domain.group.dto.GroupCreateRequest;
import judgeServer.domain.group.dto.GroupDetailResponse;
import judgeServer.domain.group.dto.GroupListResponse;
import judgeServer.domain.group.dto.GroupUpdateRequest;
import judgeServer.domain.group.entity.Group;
import judgeServer.domain.group.repository.GroupRepository;
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
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    // @Autowired
    // private ActivityRepository activityRepository;

    @Autowired
    private GroupMemberRepository memberRepository;

    @Autowired
    private UserRepository userRepository;


    @Transactional
    public GroupDetailResponse createGroup(Long userId, GroupCreateRequest request) {
        User user = getUser(userId);

        Group group = Group.builder()
                .name(request.getName())
                .capacity(request.getCapacity())
                .description(request.getDescription())
                .build();
        groupRepository.save(group);

        // 그룹 생성자는 자동으로 LEADER 권한의 멤버가 됨
        GroupMember leader = GroupMember.builder()
                .group(group)
                .user(user)
                .role(MemberRole.LEADER)
                .build();
        memberRepository.save(leader);

        return GroupDetailResponse.from(group);
    }

    @Transactional
    public void updateGroup(Long groupId, Long userId, GroupUpdateRequest request) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 그룹입니다."));
        validateLeader(groupId, userId);

        group.update(request.getName(), request.getCapacity(), request.getDescription());
    }

    @Transactional
    public void deleteGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 그룹입니다."));
        validateLeader(groupId, userId);

        groupRepository.delete(group); // cascade로 GroupMember 함께 삭제
    }

    public GroupDetailResponse getGroup(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 그룹입니다."));
        return GroupDetailResponse.from(group);
    }

    public List<GroupListResponse> searchGroups(String keyword) {
        return groupRepository.findByNameContainingWithMembers(keyword).stream()
                .map(GroupListResponse::from)
                .toList();
    }

    public List<GroupListResponse> getAllGroups() {
        return groupRepository.findAllWithMembers().stream()
                .map(GroupListResponse::from)
                .toList();
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 사용자입니다."));
    }

    private void validateLeader(Long groupId, Long userId) {
        GroupMember member = memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new AccessDeniedException("그룹 멤버가 아닙니다."));
        if (member.getRole() != MemberRole.LEADER) {
            throw new AccessDeniedException("그룹장만 수행할 수 있습니다.");
        }
    }



}
