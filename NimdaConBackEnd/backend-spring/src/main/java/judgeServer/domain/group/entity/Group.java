package judgeServer.domain.group.entity;

import com.nimda.cite.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import judgeServer.domain.groupMember.entity.GroupMember;
import lombok.*;


import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@Table(name = "`groups`")
/*
, uniqueConstraints = {
        @UniqueConstraint(name = "uk_group_activity_name", columnNames = {"activity_id", "name"})
})
 */
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Group extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*

    대회나 스터디

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

     */

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private Integer capacity;

    @Column(length = 200)
    private String description;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupMember> members = new ArrayList<>();

    // 임시
    @Builder
    private Group(String name, Integer capacity, String description) {
        this.name = name;
        this.capacity = capacity;
        this.description = description;
    }

    /*
    @Builder
    private Group(Activity activity, String name, Integer capacity, String description) {
        this.activity = activity;
        this.name = name;
        this.capacity = capacity;
        this.description = description;
    }
    */

    public void update(String name, Integer capacity, String description) {
        this.name = name;
        this.capacity = capacity;
        this.description = description;
    }

}
