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
        if (owns(userId, profileDecoration.getId())) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        repository.save(new UserProfileDecoration(user, profileDecoration));
    }

    @Transactional(readOnly = true)
    public List<ProfileDecoration> getOwnedDecorations(Long userId) {
        return repository.findDecorationsByUserId(userId);
    }
}
