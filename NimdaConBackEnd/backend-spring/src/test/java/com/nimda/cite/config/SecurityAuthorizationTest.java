package com.nimda.cite.config;

import com.nimda.cite.user.entity.Authority;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.enums.ApprovalStatus;
import com.nimda.cite.user.security.CustomUserDetails;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void categoryAllRejectsAnonymousAndOrdinaryUsers() throws Exception {
        mockMvc.perform(get("/api/cite/category/all"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/cite/category/all").with(user(details("ROLE_USER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void categoryAllAllowsAnAdministratorThroughTheSecurityMatcher() throws Exception {
        mockMvc.perform(get("/api/cite/category/all").with(user(details("ROLE_ADMIN"))))
                .andExpect(status().isOk());
    }

    @Test
    void attachmentDownloadUrlRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/cite/attachments/1/download-url"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/cite/attachments/1/download-url").with(user(details("ROLE_USER"))))
                .andExpect(status().isForbidden())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @WithMockUser(roles = "USER")
    void nonHealthActuatorPathsRequireAdministratorRole() throws Exception {
        mockMvc.perform(get("/api/actuator"))
                .andExpect(status().isForbidden());
    }

    private CustomUserDetails details(String role) {
        User account = new User();
        account.setId(100L);
        account.setUserId("security-test");
        account.setNickname("security-test");
        account.setPassword("unused");
        account.setStatus(ApprovalStatus.APPROVED);
        account.getAuthorities().add(new Authority(1L, role));
        return new CustomUserDetails(account);
    }
}
