package com.nimda.cup.user.profiledecoration;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProfileDecorationService {

    private final ProfileDecorationRepository repository;

    @Transactional(readOnly = true)
    public List<ProfileDecoration> getActiveDecorations() {
        return repository.findByActiveTrueOrderByIdAsc();
    }

    @Transactional(readOnly = true)
    public List<ProfileDecoration> getAllDecorations() {
        return repository.findAllByOrderByIdAsc();
    }

    @Transactional(readOnly = true)
    public ProfileDecoration getByKey(String key) {
        return repository.findByKey(key)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로필 장식입니다."));
    }

    @Transactional
    public ProfileDecoration create(ProfileDecorationCreateRequest request) {
        String key = normalizeKey(request.getKey());
        String label = request.getLabel() == null ? "" : request.getLabel().trim();
        String filePath = request.getFilePath() == null ? "" : request.getFilePath().trim();
        String requiredRole = normalizeRole(request.getRequiredRole());

        if (key.isBlank()) {
            throw new IllegalArgumentException("배지 키를 입력해주세요.");
        }
        if (!key.matches("^[a-z0-9][a-z0-9-]{1,98}$")) {
            throw new IllegalArgumentException("배지 키는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.");
        }
        if (label.isBlank()) {
            throw new IllegalArgumentException("배지 이름을 입력해주세요.");
        }
        if (filePath.isBlank()) {
            throw new IllegalArgumentException("배지 이미지 경로가 필요합니다.");
        }
        if (repository.existsByKey(key)) {
            throw new IllegalArgumentException("이미 존재하는 배지 키입니다.");
        }

        ProfileDecoration decoration = new ProfileDecoration(key, label, filePath);
        decoration.update(label, filePath, requiredRole, true);
        return repository.save(decoration);
    }

    private String normalizeKey(String key) {
        return key == null ? "" : key.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) return null;
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        return normalized.startsWith("ROLE_") ? normalized : "ROLE_" + normalized;
    }
}
