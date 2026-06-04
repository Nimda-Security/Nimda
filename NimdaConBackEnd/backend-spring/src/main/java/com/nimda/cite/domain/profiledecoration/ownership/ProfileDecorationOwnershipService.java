package com.nimda.cite.domain.profiledecoration.ownership;

import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileDecorationOwnershipService {

    private final UserProfileDecorationRepository repository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public boolean owns(Long userId, Long profileDecorationId) {
        return repository.existsByUserIdAndProfileDecorationId(userId, profileDecorationId);
    }

    @Transactional
    public void grant(Long userId, ProfileDecoration profileDecoration) {
        if (profileDecoration == null || !profileDecoration.isActive()) {
            throw new IllegalArgumentException("사용할 수 없는 프로필 배지입니다.");
        }
        if (owns(userId, profileDecoration.getId())) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        repository.save(new UserProfileDecoration(user, profileDecoration));
    }

    @Transactional
    public void grantByStudentNum(String studentNum, ProfileDecoration profileDecoration) {
        User user = userRepository.findByStudentNum(studentNum)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 학번입니다."));
        grant(user.getId(), profileDecoration);
    }

    @Transactional
    public void revokeByStudentNum(String studentNum, ProfileDecoration profileDecoration) {
        User user = userRepository.findByStudentNum(studentNum)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 학번입니다."));
        if (profileDecoration == null) {
            throw new IllegalArgumentException("존재하지 않는 프로필 배지입니다.");
        }
        repository.deleteByUserIdAndProfileDecorationId(user.getId(), profileDecoration.getId());
        if (profileDecoration.getKey().equals(user.getProfileDecoration())) {
            user.setProfileDecoration(null);
        }
    }

    @Transactional(readOnly = true)
    public List<ProfileDecoration> getOwnedDecorations(Long userId) {
        return repository.findDecorationsByUserId(userId);
    }
}
