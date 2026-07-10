package com.nimda.cite.domain.profiledecoration.service;

import com.nimda.cite.domain.attachment.service.AttachmentService;
import com.nimda.cite.domain.profiledecoration.dto.ProfileDecorationCreateRequest;
import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import com.nimda.cite.domain.profiledecoration.repository.ProfileDecorationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileDecorationServiceTest {

    @Mock
    private ProfileDecorationRepository repository;
    @Mock
    private AttachmentService attachmentService;

    @InjectMocks
    private ProfileDecorationService service;

    @Test
    void reactivatingWithASharedPreviousImageDoesNotQueueDeletion() {
        ProfileDecoration existing = inactiveDecoration(
                3L,
                "badge",
                "users/7/active/decorations/shared.png");
        when(repository.findByKey("badge")).thenReturn(java.util.Optional.of(existing));
        when(repository.existsByFilePathAndIdNot(existing.getFilePath(), existing.getId()))
                .thenReturn(true);

        ProfileDecoration updated = service.create(
                request("badge", "users/7/active/decorations/new.png"),
                7L);

        assertEquals("users/7/active/decorations/new.png", updated.getFilePath());
        verify(attachmentService, never()).enqueueProfileDecorationDeletion(any());
    }

    @Test
    void reactivatingWithAnUnsharedCanonicalImageQueuesDeletion() {
        ProfileDecoration existing = inactiveDecoration(
                3L,
                "badge",
                "users/7/active/decorations/old.png");
        when(repository.findByKey("badge")).thenReturn(java.util.Optional.of(existing));
        when(repository.existsByFilePathAndIdNot(existing.getFilePath(), existing.getId()))
                .thenReturn(false);

        service.create(request("badge", "users/7/active/decorations/new.png"), 7L);

        verify(attachmentService)
                .enqueueProfileDecorationDeletion("users/7/active/decorations/old.png");
    }

    @Test
    void newPendingImageIsFinalizedForTheActingAdministrator() {
        String pendingKey = "pending/users/7/profile-decoration/audit.png";
        String activeKey = "users/7/active/decorations/audit.png";
        when(repository.findByKey("badge")).thenReturn(java.util.Optional.empty());
        when(attachmentService.finalizeProfileDecorationImage(pendingKey, 7L))
                .thenReturn(activeKey);
        when(repository.save(any(ProfileDecoration.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProfileDecoration created = service.create(request("badge", pendingKey), 7L);

        assertEquals(activeKey, created.getFilePath());
        verify(attachmentService).finalizeProfileDecorationImage(pendingKey, 7L);
    }

    private ProfileDecoration inactiveDecoration(Long id, String key, String filePath) {
        ProfileDecoration decoration = new ProfileDecoration(key, "Audit badge", filePath);
        ReflectionTestUtils.setField(decoration, "id", id);
        decoration.deactivate();
        return decoration;
    }

    private ProfileDecorationCreateRequest request(String key, String filePath) {
        ProfileDecorationCreateRequest request = new ProfileDecorationCreateRequest();
        request.setKey(key);
        request.setLabel("Audit badge");
        request.setFilePath(filePath);
        return request;
    }
}
