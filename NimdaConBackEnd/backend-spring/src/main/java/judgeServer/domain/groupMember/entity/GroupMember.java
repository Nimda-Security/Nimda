package judgeServer.domain.groupMember.entity;

import com.nimda.cite.domain.comment.entity.BaseTime;
import com.nimda.cite.user.entity.User;
import jakarta.persistence.*;
import judgeServer.domain.group.entity.Group;
import judgeServer.domain.groupMember.enums.MemberRole;
import lombok.*;

@Entity
@Table(name = "group_members", uniqueConstraints = {
        @UniqueConstraint(name = "uk_group_member", columnNames = {"group_id", "user_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupMember extends BaseTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberRole role;

    @Builder
    private GroupMember(Group group, User user, MemberRole role) {
        this.group = group;
        this.user = user;
        this.role = role;
    }

}
