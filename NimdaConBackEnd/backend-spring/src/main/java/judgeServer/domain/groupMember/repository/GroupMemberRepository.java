package judgeServer.domain.groupMember.repository;

import judgeServer.domain.groupMember.entity.GroupMember;
import judgeServer.domain.groupMember.enums.MemberRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    // 특정 그룹의 멤버 전체 조회
    List<GroupMember> findByGroupId(Long groupId);

    // 특정 유저가 속한 그룹 멤버십 전체 조회 (내가 가입한 그룹 목록 등)
    List<GroupMember> findByUserId(Long userId);

    // 그룹-유저로 특정 멤버십 조회 (권한 체크, role 확인 등)
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    // 이미 가입되어 있는지 여부 확인 (가입 신청/초대 승인 시 중복 체크)
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    // 그룹 인원 수 카운트 (capacity 체크용)
    long countByGroupId(Long groupId);

    // 특정 role을 가진 멤버 조회 (예: 그룹장 조회)
    Optional<GroupMember> findByGroupIdAndRole(Long groupId, MemberRole role);

    // 탈퇴 처리 (그룹-유저 조합으로 삭제)
    void deleteByGroupIdAndUserId(Long groupId, Long userId);

}

