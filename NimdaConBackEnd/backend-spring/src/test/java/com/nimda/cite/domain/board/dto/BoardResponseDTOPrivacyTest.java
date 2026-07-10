package com.nimda.cite.domain.board.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.user.entity.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BoardResponseDTOPrivacyTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void mapsPublicAuthorIdentityWithoutExposingLoginIdOrEmail() throws Exception {
        User author = new User();
        author.setId(12L);
        author.setUserId("author-id");
        author.setNickname("author");
        author.setEmail("author@example.com");
        author.setProfileImage("profile.png");
        author.setProfileDecoration("gold");
        Board board = new Board();
        board.setId(34L);
        board.setAuthor(author);

        BoardResponseDTO response = BoardResponseDTO.from(board, 0, false, 0);
        JsonNode authorJson = objectMapper.readTree(objectMapper.writeValueAsString(response)).path("author");

        assertEquals(12L, response.getAuthor().getId());
        assertEquals("author", response.getAuthor().getNickname());
        assertEquals("profile.png", response.getAuthor().getProfileImage());
        assertEquals("gold", response.getAuthor().getProfileDecoration());
        assertTrue(authorJson.has("id"));
        assertFalse(authorJson.has("userId"));
        assertTrue(authorJson.has("nickname"));
        assertFalse(authorJson.has("email"));
    }
}
