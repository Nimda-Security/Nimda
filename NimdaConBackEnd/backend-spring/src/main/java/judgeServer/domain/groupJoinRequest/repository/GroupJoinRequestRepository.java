package judgeServer.domain.groupJoinRequest.repository;

import judgeServer.domain.groupJoinRequest.entity.GroupJoinRequest;
import judgeServer.domain.groupJoinRequest.enums.JoinRequestStatus;
import judgeServer.domain.groupJoinRequest.enums.JoinType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupJoinRequestRepository extends JpaRepository<GroupJoinRequest, Long> {

    // 특정 그룹으로 들어온 요청/초대 목록 (상태별 조회, 예: 관리자가 신청 목록 확인)
    List<GroupJoinRequest> findByGroupIdAndStatus(Long groupId, JoinRequestStatus status);

    // 특정 유저가 보낸/받은 요청 목록 (내 신청 내역, 내가 받은 초대 목록)
    List<GroupJoinRequest> findByUserIdAndJoinType(Long userId, JoinType joinType);

    // 유저가 받은 요청/초대 상태별 조회
    List<GroupJoinRequest> findByUserIdAndStatus(Long userId, JoinRequestStatus status);

    // 특정 그룹-유저 조합의 진행중인(PENDING) 요청이 있는지 확인 (중복 신청 방지)
    Optional<GroupJoinRequest> findByGroupIdAndUserIdAndStatus(
            Long groupId, Long userId, JoinRequestStatus status
    );

    boolean existsByGroupIdAndUserIdAndStatus(
            Long groupId, Long userId, JoinRequestStatus status
    );


}
