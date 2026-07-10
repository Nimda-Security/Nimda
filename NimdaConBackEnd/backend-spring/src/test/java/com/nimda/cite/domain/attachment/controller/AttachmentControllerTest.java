package com.nimda.cite.domain.attachment.controller;

import com.nimda.cite.domain.attachment.service.AttachmentService;
import com.nimda.cite.domain.attachment.store.FileStore;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.security.CustomUserDetails;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

@ExtendWith(MockitoExtension.class)
class AttachmentControllerTest {

    @Mock
    private AttachmentService attachmentService;

    @Mock
    private FileStore localFileStore;

    @Test
    void unavailableDirectStorageReturnsStableLocalFallbackCode() {
        AttachmentController controller =
                new AttachmentController(attachmentService, localFileStore);
        User user = new User();
        user.setId(7L);

        ResponseEntity<?> response = controller.createPresignedUpload(
                new CustomUserDetails(user), "board", "safe.png", 128L);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        Map<?, ?> body = assertInstanceOf(Map.class, response.getBody());
        assertEquals(false, body.get("success"));
        assertEquals("UPLOAD_STORAGE_UNAVAILABLE", body.get("code"));
    }
}
