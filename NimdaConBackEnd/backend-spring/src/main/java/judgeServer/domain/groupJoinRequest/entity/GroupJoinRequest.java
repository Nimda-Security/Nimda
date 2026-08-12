package judgeServer.domain.groupJoinRequest.entity;

import com.nimda.cite.common.entity.BaseTimeEntity;
import com.nimda.cite.user.entity.User;
import jakarta.persistence.*;
import judgeServer.domain.group.entity.Group;
import judgeServer.domain.groupJoinRequest.enums.JoinRequestStatus;
import judgeServer.domain.groupJoinRequest.enums.JoinType;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "group_join_requests", uniqueConstraints = {
        @UniqueConstraint(name = "uk_group_join_request", columnNames = {"group_id", "user_id"})
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupJoinRequest extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 신청/초대를 받은 그룹
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    // 신청하거나 초대받은 사용자
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 신청인지 초대인지
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JoinType joinType;

    // 현재 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JoinRequestStatus status;

    @Builder
    private GroupJoinRequest(
            Group group,
            User user,
            JoinType joinType,
            JoinRequestStatus status,
            String message
    ) {
        this.group = group;
        this.user = user;
        this.joinType = joinType;
        this.status = status;
    }

    public void updateStatus(JoinRequestStatus status) {
        this.status = status;
    }

}
