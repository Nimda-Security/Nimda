package judgeServer.domain.group.repository;

import judgeServer.domain.group.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    // 단건 조회 - 멤버까지 함께 (상세 조회용)
    @Query("select g from Group g left join fetch g.members where g.id = :id")
    Optional<Group> findByIdWithMembers(@Param("id") Long id);

    // 목록 조회 - 멤버까지 함께 (currentMemberCount 계산용)
    @Query("select distinct g from Group g left join fetch g.members where g.name like %:keyword%")
    List<Group> findByNameContainingWithMembers(@Param("keyword") String keyword);

    // 전체 목록 조회 - 멤버까지 함께
    @Query("select distinct g from Group g left join fetch g.members")
    List<Group> findAllWithMembers();

}