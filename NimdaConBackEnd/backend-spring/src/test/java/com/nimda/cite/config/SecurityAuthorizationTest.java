package com.nimda.cite.config;

import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.domain.board.entity.Category;
import com.nimda.cite.domain.board.enums.BoardStatus;
import com.nimda.cite.domain.board.repository.BoardRepository;
import com.nimda.cite.domain.board.repository.CategoryRepository;
import com.nimda.cite.user.repository.UserRepository;
import com.nimda.cite.user.entity.Authority;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.enums.ApprovalStatus;
import com.nimda.cite.user.security.CustomUserDetails;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private BoardRepository boardRepository;

    @BeforeEach
    void ensureLegalDocumentFixtures() {
        if (boardRepository.findByLegalSlugAndStatus("terms", BoardStatus.ACTIVE).isPresent()) {
            return;
        }

        User author = new User();
        author.setUserId("legal-author");
        author.setName("Legal");
        author.setNickname("legal-author");
        author.setPassword("unused-password");
        author.setStudentNum("000000000");
        author.setEmail("legal-author@example.com");
        author.setMajor("operations");
        author.setStatus(ApprovalStatus.APPROVED);
        author = userRepository.save(author);

        Category category = Category.builder()
                .name("법적 안내")
                .slug("legal-notice")
                .isActive(true)
                .sortOrder(0)
                .postCount(4)
                .build();
        category = categoryRepository.save(category);

        saveLegalDocument(author, category, "terms", "서비스 이용약관");
        saveLegalDocument(author, category, "privacy", "개인정보보호정책");
        saveLegalDocument(author, category, "youth-protection", "청소년보호정책");
        saveLegalDocument(author, category, "site-rules", "사이트 이용규칙");
    }

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
    void anonymousLegalSlugsReachTheControllerWhileNumericBoardIdsStayProtected() throws Exception {
        for (String[] document : new String[][] {
                {"terms", "서비스 이용약관"},
                {"privacy", "개인정보보호정책"},
                {"youth-protection", "청소년보호정책"},
                {"site-rules", "사이트 이용규칙"}
        }) {
            mockMvc.perform(get("/api/cite/board/legal/{legalSlug}", document[0]))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.board.title").value(document[1]));
        }

        for (long boardId : new long[] {4L, 5L, 6L, 7L, 8L, 9L, 50L}) {
            mockMvc.perform(get("/api/cite/board/{id}", boardId))
                    .andExpect(status().isForbidden());
        }
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
    private void saveLegalDocument(
            User author, Category category, String legalSlug, String title) {
        Board board = new Board();
        board.setAuthor(author);
        board.setCategory(category);
        board.setTitle(title);
        board.setContent("<p>" + title + " 테스트 본문</p>");
        board.setLegalSlug(legalSlug);
        board.setStatus(BoardStatus.ACTIVE);
        boardRepository.save(board);
    }
}
