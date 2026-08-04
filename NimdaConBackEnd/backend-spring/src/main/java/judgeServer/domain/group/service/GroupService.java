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
import judgeServer.domain.groupMember.enums.MemberRole;
import judgeServer.domain.groupMember.service.GroupMemberService;
import org.springframework.beans.factory.annotation.Autowired;
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
    private GroupMemberService groupMemberService;

    @Autowired
    private UserRepository userRepository;


    @Transactional
    public GroupDetailResponse createGroup(Long userId, GroupCreateRequest request) {
        User user = getUser(userId);
        validateUniqueName(request.getName(), null);

        Group group = Group.builder()
                .name(request.getName())
                .capacity(request.getCapacity())
                .description(request.getDescription())
                .build();
        groupRepository.save(group);

        // 그룹 생성자는 자동으로 LEADER 권한의 멤버가 됨
        groupMemberService.addMember(group, user, MemberRole.LEADER);

        return GroupDetailResponse.from(group);
    }

    @Transactional
    public void updateGroup(Long groupId, Long userId, GroupUpdateRequest request) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 그룹입니다."));
        validateLeader(groupId, userId);
        validateUniqueName(request.getName(), groupId);

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
        groupMemberService.validateLeader(groupId, userId);
    }

    // excludeGroupId가 null이면 생성 시 체크, 값이 있으면 본인 그룹은 제외하고 수정 시 체크
    private void validateUniqueName(String name, Long excludeGroupId) {
        boolean duplicated = (excludeGroupId == null)
                ? groupRepository.existsByName(name)
                : groupRepository.existsByNameAndIdNot(name, excludeGroupId);
        if (duplicated) {
            throw new IllegalStateException("이미 사용 중인 그룹 이름입니다.");
        }
    }



}
