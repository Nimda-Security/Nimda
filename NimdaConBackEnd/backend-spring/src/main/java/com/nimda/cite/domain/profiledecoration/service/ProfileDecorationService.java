package com.nimda.cite.domain.profiledecoration.service;

import com.nimda.cite.domain.profiledecoration.dto.ProfileDecorationCreateRequest;
import com.nimda.cite.domain.profiledecoration.dto.ProfileDecorationDto;
import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import com.nimda.cite.domain.profiledecoration.entity.ProfileDecorationRole;
import com.nimda.cite.domain.profiledecoration.repository.ProfileDecorationRepository;
import com.nimda.cite.domain.profiledecoration.repository.ProfileDecorationRoleRepository;
import com.nimda.cite.domain.profiledecoration.repository.UserProfileDecorationRepository;
import com.nimda.cite.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProfileDecorationService {

    private static final String EMPTY_AUTHORITY_SENTINEL = "__NO_AUTHORITY__";

    private final ProfileDecorationRepository profileDecorationRepository;
    private final ProfileDecorationRoleRepository profileDecorationRoleRepository;
    private final UserProfileDecorationRepository userProfileDecorationRepository;

    @Transactional(readOnly = true)
    public List<ProfileDecorationDto> getAvailableDecorations(User user) {
        if (user == null) {
            return toDtos(profileDecorationRepository.findPublicActiveDecorations());
        }

        List<String> authorityNames = getAuthorityNames(user);
        List<ProfileDecoration> decorations = profileDecorationRepository.findAvailableDecorations(
                user.getId(),
                authorityNames.isEmpty() ? List.of(EMPTY_AUTHORITY_SENTINEL) : authorityNames
        );
        return toDtos(decorations);
    }

    @Transactional(readOnly = true)
    public List<ProfileDecorationDto> getAllDecorations() {
        return toDtos(profileDecorationRepository.findAllByOrderByIdAsc());
    }

    @Transactional(readOnly = true)
    public ProfileDecoration getByKey(String key) {
        return profileDecorationRepository.findByKey(key)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로필 장식입니다."));
    }

    @Transactional(readOnly = true)
    public void validateUsableDecoration(User user, String key) {
        ProfileDecoration decoration = getByKey(key);
        if (!decoration.isActive()) {
            throw new IllegalArgumentException("사용할 수 없는 프로필 장식입니다.");
        }

        List<String> authorityNames = getAuthorityNames(user);
        boolean hasRoleRestriction = profileDecorationRoleRepository.existsByDecoration(decoration);
        boolean allowedByRole = !hasRoleRestriction
                || profileDecorationRoleRepository.existsByDecorationAndAuthorityNameIn(decoration, authorityNames);
        boolean ownedByUser = userProfileDecorationRepository.existsByUserIdAndDecoration(user.getId(), decoration);

        if (!allowedByRole && !ownedByUser) {
            throw new SecurityException("이 프로필 장식을 사용할 권한이 없습니다.");
        }
    }

    @Transactional
    public ProfileDecorationDto create(ProfileDecorationCreateRequest request) {
        String key = normalizeKey(request.getKey());
        String label = request.getLabel() == null ? "" : request.getLabel().trim();
        String filePath = request.getFilePath() == null ? "" : request.getFilePath().trim();
        List<String> requiredRoles = normalizeRoles(request);

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
        if (profileDecorationRepository.existsByKey(key)) {
            throw new IllegalArgumentException("이미 존재하는 배지 키입니다.");
        }

        ProfileDecoration decoration = profileDecorationRepository.save(new ProfileDecoration(key, label, filePath));
        List<ProfileDecorationRole> roles = requiredRoles.stream()
                .map(role -> new ProfileDecorationRole(decoration, role))
                .toList();
        profileDecorationRoleRepository.saveAll(roles);

        return ProfileDecorationDto.from(decoration, requiredRoles);
    }

    private List<ProfileDecorationDto> toDtos(List<ProfileDecoration> decorations) {
        if (decorations.isEmpty()) {
            return List.of();
        }

        Map<Long, List<String>> roleMap = new LinkedHashMap<>();
        decorations.forEach(decoration -> roleMap.put(decoration.getId(), List.of()));

        profileDecorationRoleRepository.findByDecorationIn(decorations).stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        role -> role.getDecoration().getId(),
                        LinkedHashMap::new,
                        java.util.stream.Collectors.mapping(ProfileDecorationRole::getAuthorityName, java.util.stream.Collectors.toList())
                ))
                .forEach(roleMap::put);

        return decorations.stream()
                .map(decoration -> ProfileDecorationDto.from(decoration, roleMap.getOrDefault(decoration.getId(), List.of())))
                .toList();
    }

    private List<String> getAuthorityNames(User user) {
        if (user == null || user.getAuthorities() == null) {
            return List.of();
        }
        return user.getAuthorities().stream()
                .map(authority -> authority.getAuthorityName())
                .filter(authority -> authority != null && !authority.isBlank())
                .toList();
    }

    private List<String> normalizeRoles(ProfileDecorationCreateRequest request) {
        Set<String> roles = new LinkedHashSet<>();
        addRole(roles, request.getRequiredRole());
        if (request.getRequiredRoles() != null) {
            request.getRequiredRoles().forEach(role -> addRole(roles, role));
        }
        return List.copyOf(roles);
    }

    private void addRole(Collection<String> roles, String role) {
        if (role == null || role.isBlank()) {
            return;
        }
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        roles.add(normalized.startsWith("ROLE_") ? normalized : "ROLE_" + normalized);
    }

    private String normalizeKey(String key) {
        return key == null ? "" : key.trim().toLowerCase(Locale.ROOT);
    }
}
