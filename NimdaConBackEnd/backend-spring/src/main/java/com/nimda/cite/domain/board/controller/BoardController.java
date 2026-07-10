package com.nimda.cite.domain.board.controller;

import com.nimda.cite.domain.attachment.service.AttachmentService;
import com.nimda.cite.domain.board.dto.BoardDeleteRequest;
import com.nimda.cite.domain.board.dto.BoardListResponseDTO;
import com.nimda.cite.domain.board.dto.BoardResponseDTO;
import com.nimda.cite.domain.board.dto.CategoryResponseDTO;
import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.domain.board.entity.Category;
import com.nimda.cite.domain.board.enums.BoardStatus;
import com.nimda.cite.domain.board.enums.ShopItemType;
import com.nimda.cite.domain.board.repository.CategoryRepository;
import com.nimda.cite.domain.board.service.BoardService;
import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import com.nimda.cite.domain.profiledecoration.repository.ProfileDecorationRepository;
import com.nimda.cite.domain.tag.entity.Tag;
import com.nimda.cite.domain.tag.repository.TagRepository;
import com.nimda.cite.domain.comment.enums.STATUS;
import com.nimda.cite.domain.comment.repository.CommentRepository;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.common.s3.S3Service;
import com.nimda.cite.domain.like.service.BoardLikeService;
import com.nimda.cite.user.entity.User;
import com.nimda.cite.user.repository.UserRepository;
import com.nimda.cite.user.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/cite/board")
public class BoardController {

    private static final Logger log = LoggerFactory.getLogger(BoardController.class);

    /** sort 파라미터로 허용된 Board 엔티티 필드명 화이트리스트 */
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "createdAt", "updatedAt", "title", "postView", "pinned"
    );
    private static final Set<String> PUBLIC_LEGAL_SLUGS = Set.of(
            "terms", "privacy", "youth-protection", "site-rules"
    );
    private static final int MAX_TITLE_LENGTH = 200;
    private static final int MAX_CONTENT_LENGTH = 5_000_000;

    /** 클라이언트 sort 파라미터를 화이트리스트 기준으로 정제하고 페이지 크기를 제한 */
    private Pageable sanitizedPageable(Pageable pageable, int maxSize) {
        List<Sort.Order> safeOrders = pageable.getSort().stream()
                .filter(o -> ALLOWED_SORT_FIELDS.contains(o.getProperty()))
                .collect(Collectors.toList());
        Sort safeSort = safeOrders.isEmpty()
                ? Sort.by(Sort.Direction.DESC, "createdAt")
                : Sort.by(safeOrders);
        int size = Math.min(pageable.getPageSize(), maxSize);
        return PageRequest.of(pageable.getPageNumber(), size, safeSort);
    }

    /** slug 형식 검증: 영문·숫자·하이픈·언더스코어만 허용, 최대 50자 */
    private boolean isValidSlug(String slug) {
        return slug != null && !slug.isEmpty() && slug.length() <= 50
                && slug.matches("^[a-zA-Z0-9_-]+$");
    }
    private String validateBoardInput(String title, String content) {
        if (title == null || title.isBlank()) {
            return "제목을 입력해주세요.";
        }
        if (title.length() > MAX_TITLE_LENGTH) {
            return "제목은 200자 이하여야 합니다.";
        }
        if (content == null || content.isBlank()) {
            return "내용을 입력해주세요.";
        }
        if (content.length() > MAX_CONTENT_LENGTH) {
            return "게시글 내용이 너무 깁니다.";
        }
        return null;
    }

    @Autowired
    private BoardService boardService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BoardLikeService boardLikeService;

    @Autowired
    private AttachmentService attachmentService;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ProfileDecorationRepository profileDecorationRepository;

    @Autowired(required = false)
    private S3Service s3Service;

    /** author.profileImage가 S3 키인 경우 Presigned URL로 변환 */
    private void resolveProfileImage(BoardResponseDTO dto) {
        if (s3Service == null || dto == null || dto.getAuthor() == null) return;
        String img = dto.getAuthor().getProfileImage();
        if (img != null && !img.isBlank() && !img.startsWith("http")) {
            dto.getAuthor().setProfileImage(s3Service.createPresignedGetUrl(img, 60));
        }
    }

    private void resolveProfileImages(List<BoardResponseDTO> dtos) {
        if (dtos != null) dtos.forEach(this::resolveProfileImage);
    }

    // 카테고리(자신 또는 부모)의 slug가 일치하는지 확인
    private boolean isCategoryMatch(Category category, String slug) {
        Set<Long> visited = new java.util.HashSet<>();
        Category current = category;
        while (current != null && (current.getId() == null || visited.add(current.getId()))) {
            if (slug.equalsIgnoreCase(current.getSlug())) {
                return true;
            }
            current = current.getParentId() == null
                    ? null
                    : categoryRepository.findById(current.getParentId()).orElse(null);
        }
        return false;
    }
    private boolean canViewCategory(Category category, User user) {
        return category != null
                && (!isCategoryMatch(category, "cartel")
                || hasRole(user, "ROLE_CARTEL")
                || hasRole(user, "ROLE_ADMIN"));
    }

    private List<Long> restrictedCategoryIds(User user) {
        if (hasRole(user, "ROLE_CARTEL") || hasRole(user, "ROLE_ADMIN")) {
            return List.of();
        }

        List<Category> categories = categoryRepository.findByIsActiveTrueOrderBySortOrderAsc();
        Map<Long, Category> categoriesById = categories.stream()
                .filter(category -> category.getId() != null)
                .collect(Collectors.toMap(Category::getId, category -> category));

        return categories.stream()
                .filter(category -> isCategoryMatchInMemory(category, "cartel", categoriesById))
                .map(Category::getId)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    private boolean isCategoryMatchInMemory(
            Category category,
            String slug,
            Map<Long, Category> categoriesById) {
        Set<Long> visited = new java.util.HashSet<>();
        Category current = category;
        while (current != null && (current.getId() == null || visited.add(current.getId()))) {
            if (slug.equalsIgnoreCase(current.getSlug())) {
                return true;
            }
            current = current.getParentId() == null
                    ? null
                    : categoriesById.get(current.getParentId());
        }
        return false;
    }

    private boolean canViewBoard(Board board, User user) {
        return board != null
                && board.getStatus() == BoardStatus.ACTIVE
                && canViewCategory(board.getCategory(), user);
    }

    private boolean isShopCategory(Category category) {
        if (category == null) return false;
        if (Boolean.TRUE.equals(category.getShopEnabled())) return true;
        if (category.getParentId() != null) {
            Category parent = categoryRepository.findById(category.getParentId()).orElse(null);
            return parent != null && Boolean.TRUE.equals(parent.getShopEnabled());
        }
        return false;
    }

    // 사용자가 특정 역할을 보유하는지 확인
    private boolean hasRole(User user, String role) {
        return user != null && user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthorityName().equals(role));
    }

    // 사용자가 해당 게시글을 좋아요 눌렀는지 확인
    private boolean isLiked(Board board, User user) {
        return user != null && boardLikeService.isUserLiked(user.getId(), board.getId());
    }

    private List<BoardResponseDTO> toListResponseDTOs(List<Board> boards, User user) {
        if (boards == null || boards.isEmpty()) {
            return List.of();
        }

        boards = boards.stream()
                .filter(board -> canViewBoard(board, user))
                .collect(Collectors.toList());
        if (boards.isEmpty()) {
            return List.of();
        }

        List<Long> boardIds = boards.stream()
                .map(Board::getId)
                .collect(Collectors.toList());
        Map<Long, Long> likeCounts = boardLikeService.getLikeCounts(boardIds);
        Set<Long> likedBoardIds = user == null
                ? Set.of()
                : boardLikeService.getLikedBoardIds(user.getId(), boardIds);

        Map<Long, Long> commentCounts = new HashMap<>();
        for (Object[] row : commentRepository.countNonDeletedByBoardIds(boardIds)) {
            if (row != null && row.length >= 2 && row[0] instanceof Number boardId
                    && row[1] instanceof Number count) {
                commentCounts.put(boardId.longValue(), count.longValue());
            }
        }

        return boards.stream()
                .map(board -> BoardResponseDTO.from(
                        board,
                        likeCounts.getOrDefault(board.getId(), 0L),
                        likedBoardIds.contains(board.getId()),
                        commentCounts.getOrDefault(board.getId(), 0L)))
                .collect(Collectors.toList());
    }

    private ShopItemType parseShopItemType(String itemType) {
        if (itemType == null || itemType.isBlank()) {
            return ShopItemType.GENERAL;
        }

        try {
            return ShopItemType.valueOf(itemType.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("지원하지 않는 상품 종류입니다.");
        }
    }

    private ProfileDecoration resolveShopProfileDecoration(ShopItemType itemType, Long profileDecorationId) {
        if (itemType != ShopItemType.BADGE) {
            return null;
        }
        if (profileDecorationId == null) {
            throw new IllegalArgumentException("배지 상품은 배지를 선택해야 합니다.");
        }

        ProfileDecoration decoration = profileDecorationRepository.findById(profileDecorationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 배지입니다."));
        if (!decoration.isActive()) {
            throw new IllegalArgumentException("비활성화된 배지는 상품으로 등록할 수 없습니다.");
        }
        decoration.setPurchaseRequired(true);
        profileDecorationRepository.save(decoration);
        return decoration;
    }

    @GetMapping
    public ResponseEntity<?> getPostsByCategory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "slug", required = false) String slug,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "includeChildren", required = false, defaultValue = "false") Boolean includeChildren,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            Pageable safePageable = sanitizedPageable(pageable, 100);
            Category category = null;
            if (categoryId != null) {
                category = categoryRepository.findByIdAndIsActiveTrue(categoryId)
                        .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
            } else if (slug != null) {
                if (!isValidSlug(slug)) {
                    return ApiResponse.fail("유효하지 않은 카테고리 slug입니다.").toResponse(HttpStatus.BAD_REQUEST);
                }
                category = categoryRepository.findBySlugAndIsActiveTrue(slug)
                        .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
            } else {
                return ApiResponse.fail("categoryId 또는 slug 파라미터가 필요합니다.").toResponse(HttpStatus.BAD_REQUEST);
            }

            User user = userDetails != null ? userDetails.getUser() : null;

            // "카르텔" 카테고리 접근 권한 확인
            if (isCategoryMatch(category, "cartel")) {
                if (!hasRole(user, "ROLE_CARTEL") && !hasRole(user, "ROLE_ADMIN")) {
                    return ApiResponse.fail("접근 권한이 없습니다.").toResponse(HttpStatus.FORBIDDEN);
                }
            }

            Page<Board> boards;

            // includeChildren=true 이면 하위 카테고리 게시글도 함께 조회
            if (Boolean.TRUE.equals(includeChildren)) {
                List<Category> categories = new ArrayList<>();
                categories.add(category);
                // 직계 자식 카테고리 추가
                List<Category> children = categoryRepository
                        .findByParentIdAndIsActiveTrueOrderBySortOrderAsc(category.getId());
                categories.addAll(children);
                // 손자 카테고리도 추가 (3단 지원)
                for (Category child : children) {
                    List<Category> grandChildren = categoryRepository
                            .findByParentIdAndIsActiveTrueOrderBySortOrderAsc(child.getId());
                    categories.addAll(grandChildren);
                }
                categories.removeIf(candidate -> !canViewCategory(candidate, user));

                if (searchKeyword == null || searchKeyword.isEmpty()) {
                    boards = boardService.boardListByCategories(categories, safePageable);
                } else {
                    boards = boardService.boardSearchListByCategories(categories, searchKeyword, safePageable);
                }
            } else {
                if (searchKeyword == null || searchKeyword.isEmpty()) {
                    boards = boardService.boardListByCategory(category, safePageable);
                } else {
                    boards = boardService.boardSearchListByCategory(category, searchKeyword, safePageable);
                }
            }

            // 게시글 목록에 좋아요 개수 추가하여 DTO로 변환
            List<BoardResponseDTO> postsDTO = toListResponseDTOs(boards.getContent(), user);
            resolveProfileImages(postsDTO);

            BoardListResponseDTO responseDTO = BoardListResponseDTO.builder()
                    .posts(postsDTO)
                    .totalElements(boards.getTotalElements())
                    .totalPages(boards.getTotalPages())
                    .currentPage(boards.getNumber())
                    .category(CategoryResponseDTO.from(category))
                    .build();

            return ApiResponse.ok("게시글 목록을 성공적으로 조회했습니다.", responseDTO).toResponse();

        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("게시글 목록 조회 오류", e);
            return ApiResponse.fail("게시글 목록 조회 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/pinned")
    public ResponseEntity<?> getPinnedPosts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "slug", required = false) String slug,
            @PageableDefault(size = 4, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            Pageable safePageable = sanitizedPageable(pageable, 20);
            Category category = null;
            if (categoryId != null) {
                category = categoryRepository.findByIdAndIsActiveTrue(categoryId)
                        .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
            } else if (slug != null) {
                if (!isValidSlug(slug)) {
                    return ApiResponse.fail("유효하지 않은 카테고리 slug입니다.").toResponse(HttpStatus.BAD_REQUEST);
                }
                category = categoryRepository.findBySlugAndIsActiveTrue(slug)
                        .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
            } else {
                return ApiResponse.fail("categoryId 또는 slug 파라미터가 필요합니다.").toResponse(HttpStatus.BAD_REQUEST);
            }

            User user = userDetails != null ? userDetails.getUser() : null;
            if (isCategoryMatch(category, "cartel")
                    && !hasRole(user, "ROLE_CARTEL")
                    && !hasRole(user, "ROLE_ADMIN")) {
                return ApiResponse.fail("접근 권한이 없습니다.").toResponse(HttpStatus.FORBIDDEN);
            }
            Page<Board> boards = boardService.boardListByCategoryWithPinned(category, safePageable);

            // 고정글 목록에 좋아요 개수 추가하여 DTO로 변환
            List<BoardResponseDTO> postsDTO = toListResponseDTOs(boards.getContent(), user);
            resolveProfileImages(postsDTO);

            BoardListResponseDTO responseDTO = BoardListResponseDTO.builder()
                    .posts(postsDTO)
                    .totalElements(boards.getTotalElements())
                    .totalPages(boards.getTotalPages())
                    .currentPage(boards.getNumber())
                    .category(CategoryResponseDTO.from(category))
                    .build();

            return ApiResponse.ok("고정글 목록을 성공적으로 조회했습니다.", responseDTO).toResponse();

        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("고정글 목록 조회 오류", e);
            return ApiResponse.fail("고정글 목록 조회 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<?> getPopularPosts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "slug", required = false) String slug,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            // 인기글은 최대 10개로 제한, sort 화이트리스트 적용
            Pageable limitedPageable = sanitizedPageable(pageable, 10);

            User user = userDetails != null ? userDetails.getUser() : null;
            Page<Board> boards;
            Category category = null;

            if (categoryId != null || slug != null) {
                if (categoryId != null) {
                    category = categoryRepository.findByIdAndIsActiveTrue(categoryId)
                            .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
                } else {
                    if (!isValidSlug(slug)) {
                        return ApiResponse.fail("유효하지 않은 카테고리 slug입니다.").toResponse(HttpStatus.BAD_REQUEST);
                    }
                    category = categoryRepository.findBySlugAndIsActiveTrue(slug)
                            .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
                }
                if (isCategoryMatch(category, "cartel")
                        && !hasRole(user, "ROLE_CARTEL")
                        && !hasRole(user, "ROLE_ADMIN")) {
                    return ApiResponse.fail("접근 권한이 없습니다.").toResponse(HttpStatus.FORBIDDEN);
                }
                boards = boardService.boardListPopularByCategory(category, limitedPageable);
            } else {
                boards = boardService.boardListPopularExcludingCategories(
                        restrictedCategoryIds(user), limitedPageable);
            }

            // 인기글 목록에 좋아요 개수 추가하여 DTO로 변환
            List<BoardResponseDTO> postsDTO = toListResponseDTOs(boards.getContent(), user);
            resolveProfileImages(postsDTO);

            BoardListResponseDTO responseDTO = BoardListResponseDTO.builder()
                    .posts(postsDTO)
                    .totalElements(boards.getTotalElements())
                    .totalPages(boards.getTotalPages())
                    .currentPage(boards.getNumber())
                    .category(category != null ? CategoryResponseDTO.from(category) : null)
                    .build();

            return ApiResponse.ok("인기글 목록을 성공적으로 조회했습니다.", responseDTO).toResponse();

        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("인기글 목록 조회 오류", e);
            return ApiResponse.fail("인기글 목록 조회 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<?> write(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "tagId", required = false) Long tagId,
            @RequestParam(value = "attachmentIds", required = false) List<Long> attachmentIds,
            @RequestParam(value = "pinned", required = false) Boolean pinned,
            @RequestParam(value = "itemPrice", required = false) Long itemPrice,
            @RequestParam(value = "itemType", required = false) String itemType,
            @RequestParam(value = "profileDecorationId", required = false) Long profileDecorationId,
            @RequestParam(value = "thumbnailAttachmentId", required = false) Long thumbnailAttachmentId) {
        try {
            if (userDetails == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }
            String inputError = validateBoardInput(title, content);
            if (inputError != null) {
                return ApiResponse.fail(inputError).toResponse(HttpStatus.BAD_REQUEST);
            }
            User author = userDetails.getUser();

            Category category = categoryRepository.findByIdAndIsActiveTrue(categoryId)
                    .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + categoryId));

            // validation. tagId가 있으면 해당 카테고리 소속인지 검증
            Tag tagEntity = null;
            if (tagId != null) {
                tagEntity = tagRepository.findById(tagId)
                        .orElseThrow(() -> new RuntimeException("태그를 찾을 수 없습니다: " + tagId));
                if (!tagEntity.getCategory().getId().equals(category.getId())) {
                    return ApiResponse.fail("이 태그는 해당 카테고리에 속하지 않습니다.")
                            .toResponse(HttpStatus.BAD_REQUEST);
                }
            }

            // news 권한 체크
            if (isCategoryMatch(category, "news")) {
                boolean isAdmin = hasRole(author, "ROLE_ADMIN");
                boolean isDevAllowed = false;

                // ROLE_DEV인 경우, "news - notice - #패치" 에 글을 쓸 수 있음
                if (hasRole(author, "ROLE_DEV")) {
                    boolean isNoticeCategory = "notice".equalsIgnoreCase(category.getSlug());
                    boolean isParentNews = false;
                    if (category.getParentId() != null) {
                        Category parent = categoryRepository.findById(category.getParentId()).orElse(null);
                        isParentNews = parent != null && "news".equalsIgnoreCase(parent.getSlug());
                    }
                    boolean isPatchTag = tagEntity != null && "패치".equals(tagEntity.getTagName());

                    isDevAllowed = isNoticeCategory && isParentNews && isPatchTag;
                }

                if (!isAdmin && !isDevAllowed) {
                    return ApiResponse.fail("접근 권한이 없습니다.")
                            .toResponse(HttpStatus.FORBIDDEN);
                }
            }

            // "카르텔" 카테고리 접근 권한 확인
            if (isCategoryMatch(category, "cartel")) {
                if (!hasRole(author, "ROLE_CARTEL") && !hasRole(author, "ROLE_ADMIN")) {
                    return ApiResponse.fail("접근 권한이 없습니다.").toResponse(HttpStatus.FORBIDDEN);
                }
            }

            boolean isShopCategory = isShopCategory(category);
            if (isShopCategory) {
                if (!hasRole(author, "ROLE_ADMIN")) {
                    return ApiResponse.fail("상품 등록은 관리자만 가능합니다.").toResponse(HttpStatus.FORBIDDEN);
                }
                if (itemPrice == null || itemPrice <= 0) {
                    return ApiResponse.fail("상품 가격을 1 NC 이상으로 입력해주세요.").toResponse(HttpStatus.BAD_REQUEST);
                }
            }

            ShopItemType resolvedItemType = isShopCategory
                    ? parseShopItemType(itemType)
                    : ShopItemType.GENERAL;
            ProfileDecoration shopDecoration = isShopCategory
                    ? resolveShopProfileDecoration(resolvedItemType, profileDecorationId)
                    : null;
            Long resolvedThumbnailAttachmentId = isShopCategory
                    ? attachmentService.resolveThumbnailAttachmentId(attachmentIds, thumbnailAttachmentId)
                    : null;
            if (isShopCategory && resolvedThumbnailAttachmentId == null) {
                return ApiResponse.fail("마일리지 상점 상품은 썸네일 이미지가 필요합니다.")
                        .toResponse(HttpStatus.BAD_REQUEST);
            }

            Board board = new Board();
            board.setTitle(title.trim());
            board.setContent(content);
            board.setCategory(category);
            board.setTag(tagEntity);
            board.setItemPrice(isShopCategory ? itemPrice : 0L);
            board.setItemType(resolvedItemType);
            board.setProfileDecoration(shopDecoration);
            board.setThumbnailAttachmentId(resolvedThumbnailAttachmentId);

            // 관리자만 고정 여부 설정 가능
            if (pinned != null) {
                boolean isAdmin = author.getAuthorities().stream()
                        .anyMatch(authority -> authority.getAuthorityName().equals("ROLE_ADMIN"));
                if (isAdmin) {
                    board.setPinned(pinned);
                }
            }

            boardService.write(board, author, attachmentIds);

            long likeCount = boardLikeService.getLikeCount(board.getId());
            var attachments = attachmentService.listAttachmentsForBoard(board.getId());
            BoardResponseDTO boardDto = BoardResponseDTO.from(board, likeCount, false, 0L, attachments);
            resolveProfileImage(boardDto);

            return ApiResponse.ok("게시글이 성공적으로 작성되었습니다.", Map.of("board", boardDto))
                    .toResponse(HttpStatus.CREATED);

        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("게시글 작성 오류", e);
            return ApiResponse.fail("게시글 작성 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/legal/{legalSlug}")
    public ResponseEntity<?> viewLegalDocument(@PathVariable String legalSlug) {
        if (!PUBLIC_LEGAL_SLUGS.contains(legalSlug)) {
            return ApiResponse.fail("법적 안내 문서를 찾을 수 없습니다.")
                    .toResponse(HttpStatus.NOT_FOUND);
        }

        try {
            Board board = boardService.getLegalDocument(legalSlug);
            boardService.incrementViewCount(board);
            long likeCount = boardLikeService.getLikeCount(board.getId());
            long commentCount = commentRepository.countByBoardIdAndStatusNot(
                    board.getId(), STATUS.DELETED);
            var attachments = attachmentService.listAttachmentsForBoard(board.getId());
            BoardResponseDTO boardDto = BoardResponseDTO.from(
                    board, likeCount, false, commentCount, attachments);
            resolveProfileImage(boardDto);
            return ApiResponse.ok(
                    "법적 안내 문서를 성공적으로 조회했습니다.",
                    Map.of("board", boardDto)).toResponse();
        } catch (RuntimeException exception) {
            return ApiResponse.fail("법적 안내 문서를 찾을 수 없습니다.")
                    .toResponse(HttpStatus.NOT_FOUND);
        } catch (Exception exception) {
            log.error("법적 안내 문서 조회 오류", exception);
            return ApiResponse.fail("법적 안내 문서 조회 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> view(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id) {
        try {
            Board board = boardService.getBoard(id);
            User user = userDetails != null ? userDetails.getUser() : null;
            if (!canViewBoard(board, user)) {
                return ApiResponse.fail("게시글을 찾을 수 없습니다.")
                        .toResponse(HttpStatus.NOT_FOUND);
            }
            boardService.incrementViewCount(board);

            long likeCount = boardLikeService.getLikeCount(board.getId());
            long commentCount = commentRepository.countByBoardIdAndStatusNot(board.getId(), STATUS.DELETED);
            var attachments = attachmentService.listAttachmentsForBoard(board.getId());
            BoardResponseDTO boardDto = BoardResponseDTO.from(board, likeCount, isLiked(board, user), commentCount, attachments);
            resolveProfileImage(boardDto);
            return ApiResponse.ok("게시글을 성공적으로 조회했습니다.", Map.of("board", boardDto)).toResponse();

        } catch (RuntimeException e) {
            return ApiResponse.fail("게시글을 찾을 수 없습니다.").toResponse(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            log.error("게시글 조회 오류", e);
            return ApiResponse.fail("게시글 조회 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "tagId", required = false) Long tagId,
            @RequestParam(value = "attachmentIds", required = false) List<Long> attachmentIds,
            @RequestParam(value = "syncAttachments", required = false, defaultValue = "false")
            boolean syncAttachments,
            @RequestParam(value = "pinned", required = false) Boolean pinned,
            @RequestParam(value = "itemPrice", required = false) Long itemPrice,
            @RequestParam(value = "itemType", required = false) String itemType,
            @RequestParam(value = "profileDecorationId", required = false) Long profileDecorationId,
            @RequestParam(value = "thumbnailAttachmentId", required = false) Long thumbnailAttachmentId) {
        try {
            if (userDetails == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }
            String inputError = validateBoardInput(title, content);
            if (inputError != null) {
                return ApiResponse.fail(inputError).toResponse(HttpStatus.BAD_REQUEST);
            }

            Board boardTemp = boardService.getBoard(id);
            User currentUser = userDetails.getUser();

            boolean isAdmin = hasRole(currentUser, "ROLE_ADMIN");

            if (!isAdmin && !boardTemp.getAuthor().getId().equals(currentUser.getId())) {
                return ApiResponse.fail("게시글을 수정할 권한이 없습니다.").toResponse(HttpStatus.FORBIDDEN);
            }

            Category category = categoryRepository.findByIdAndIsActiveTrue(categoryId)
                    .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + categoryId));

            // Validation. tagId가 있으면 해당 카테고리 소속인지 검증
            Tag tagEntity = null;
            if (tagId != null) {
                tagEntity = tagRepository.findById(tagId)
                        .orElseThrow(() -> new RuntimeException("태그를 찾을 수 없습니다: " + tagId));
                if (!tagEntity.getCategory().getId().equals(category.getId())) {
                    return ApiResponse.fail("이 태그는 해당 카테고리에 속하지 않습니다.").toResponse(HttpStatus.BAD_REQUEST);
                }
            }

            // news 권한 체크
            if (isCategoryMatch(category, "news")) {
                boolean isDevAllowed = false;

                if (hasRole(currentUser, "ROLE_DEV")) {
                    boolean isNoticeCategory = "notice".equalsIgnoreCase(category.getSlug());
                    boolean isParentNews = false;
                    if (category.getParentId() != null) {
                        Category parent = categoryRepository.findById(category.getParentId()).orElse(null);
                        isParentNews = parent != null && "news".equalsIgnoreCase(parent.getSlug());
                    }
                    boolean isPatchTag = tagEntity != null && "패치".equals(tagEntity.getTagName());

                    isDevAllowed = isNoticeCategory && isParentNews && isPatchTag;
                }

                if (!isAdmin && !isDevAllowed) {
                    return ApiResponse.fail("새 소식 게시판은 관리자만 수정할 수 있습니다.").toResponse(HttpStatus.FORBIDDEN);
                }
            }

            // "카르텔" 카테고리 접근 권한 확인
            if (isCategoryMatch(category, "cartel")) {
                if (!hasRole(currentUser, "ROLE_CARTEL") && !isAdmin) {
                    return ApiResponse.fail("접근 권한이 없습니다.").toResponse(HttpStatus.FORBIDDEN);
                }
            }

            boolean isShopCategory = isShopCategory(category);
            if (isShopCategory) {
                if (!isAdmin) {
                    return ApiResponse.fail("상품 수정은 관리자만 가능합니다.").toResponse(HttpStatus.FORBIDDEN);
                }
                if (itemPrice == null || itemPrice <= 0) {
                    return ApiResponse.fail("상품 가격을 1 NC 이상으로 입력해주세요.").toResponse(HttpStatus.BAD_REQUEST);
                }
            }

            ShopItemType resolvedItemType = isShopCategory
                    ? parseShopItemType(itemType)
                    : ShopItemType.GENERAL;
            ProfileDecoration shopDecoration = isShopCategory
                    ? resolveShopProfileDecoration(resolvedItemType, profileDecorationId)
                    : null;
            Long resolvedThumbnailAttachmentId = isShopCategory
                    ? attachmentService.resolveThumbnailAttachmentId(attachmentIds, thumbnailAttachmentId)
                    : null;
            if (isShopCategory && resolvedThumbnailAttachmentId == null) {
                return ApiResponse.fail("마일리지 상점 상품은 썸네일 이미지가 필요합니다.")
                        .toResponse(HttpStatus.BAD_REQUEST);
            }

            boardTemp.setTitle(title.trim());
            boardTemp.setContent(content);
            boardTemp.setCategory(category);
            boardTemp.setTag(tagEntity);
            boardTemp.setItemPrice(isShopCategory ? itemPrice : 0L);
            boardTemp.setItemType(resolvedItemType);
            boardTemp.setProfileDecoration(shopDecoration);
            boardTemp.setThumbnailAttachmentId(resolvedThumbnailAttachmentId);

            // 관리자만 고정 여부 설정 가능
            if (pinned != null && isAdmin) {
                boardTemp.setPinned(pinned);
            }

            List<Long> attachmentIdsToSync = syncAttachments && attachmentIds == null
                    ? List.of()
                    : attachmentIds;
            boardService.write(boardTemp, currentUser, attachmentIdsToSync);

            long likeCount = boardLikeService.getLikeCount(boardTemp.getId());
            long commentCount = commentRepository.countByBoardIdAndStatusNot(boardTemp.getId(), STATUS.DELETED);
            var attachments = attachmentService.listAttachmentsForBoard(boardTemp.getId());
            BoardResponseDTO boardDto = BoardResponseDTO.from(boardTemp, likeCount, isLiked(boardTemp, currentUser), commentCount, attachments);
            resolveProfileImage(boardDto);

            return ApiResponse.ok("게시글이 성공적으로 수정되었습니다.", Map.of("board", boardDto)).toResponse();

        } catch (AccessDeniedException exception) {
            return ApiResponse.fail(exception.getMessage()).toResponse(HttpStatus.FORBIDDEN);
        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.NOT_FOUND);

        } catch (Exception e) {
            log.error("게시글 수정 오류", e);
            return ApiResponse.fail("게시글 수정 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id) {
        try {
            if (userDetails == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }
            User currentUser = userDetails.getUser();

            Board board = boardService.getBoard(id);
            boolean isAdmin = hasRole(currentUser, "ROLE_ADMIN");

            if (!isAdmin && !board.getAuthor().getId().equals(currentUser.getId())) {
                return ApiResponse.fail("게시글을 삭제할 권한이 없습니다.").toResponse(HttpStatus.FORBIDDEN);
            }

            boardService.boardDelete(id, currentUser);
            return ApiResponse.ok("게시글이 성공적으로 삭제되었습니다.").toResponse();

        } catch (AccessDeniedException exception) {
            return ApiResponse.fail(exception.getMessage()).toResponse(HttpStatus.FORBIDDEN);
        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.NOT_FOUND);

        } catch (Exception e) {
            log.error("게시글 삭제 오류", e);
            return ApiResponse.fail("게시글 삭제 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/{id}/pin")
    public ResponseEntity<?> togglePin(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long id) {
        try {
            if (userDetails == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }
            User currentUser = userDetails.getUser();

            // 관리자만 고정/해제 가능
            boolean isAdmin = currentUser.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthorityName().equals("ROLE_ADMIN"));

            if (!isAdmin) {
                return ApiResponse.fail("게시글을 고정/해제할 권한이 없습니다. 관리자만 가능합니다.").toResponse(HttpStatus.FORBIDDEN);
            }

            Board board = boardService.toggleBoardPin(id);
            String message = board.getPinned() ? "게시글이 고정되었습니다." : "게시글 고정이 해제되었습니다.";

            return ApiResponse.ok(message, Map.of("board", board)).toResponse();

        } catch (RuntimeException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.NOT_FOUND);

        } catch (Exception e) {
            log.error("게시글 고정/해제 오류", e);
            return ApiResponse.fail("게시글 고정/해제 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/my/board-count")
    public ResponseEntity<?> getMyStats(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }
            User currentUser = userDetails.getUser();

            long postCount = boardService.countByAuthor(currentUser);

            return ApiResponse.ok("통계 정보를 성공적으로 조회했습니다.", Map.of(
                    "postCount", postCount
            )).toResponse();

        } catch (Exception e) {
            log.error("통계 정보 조회 오류", e);
            return ApiResponse.fail("통계 정보 조회 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 유저가 작성한 게시글 목록 조회 (공개 프로필용)
     */
    @GetMapping("/user/{nickname}")
    public ResponseEntity<?> getBoardsByNickname(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String nickname) {
        try {
            User targetUser = userRepository.findByNickname(nickname).orElse(null);
            if (targetUser == null) {
                return ApiResponse.fail("사용자를 찾을 수 없습니다.").toResponse(HttpStatus.NOT_FOUND);
            }

            User user = userDetails != null ? userDetails.getUser() : null;
            List<BoardResponseDTO> dtos = toListResponseDTOs(
                    boardService.getMyBoards(targetUser), user);
            resolveProfileImages(dtos);

            return ApiResponse.ok("게시글 목록을 조회했습니다.", dtos).toResponse();
        } catch (Exception e) {
            log.error("사용자 게시글 목록 조회 오류", e);
            return ApiResponse.fail("게시글 조회 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 내가 작성한 게시글 목록 조회
     */
    @GetMapping("/my/boards")
    public ResponseEntity<?> getMyBoards(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            User currentUser = userDetails != null ? userDetails.getUser() : null;
            if (currentUser == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }

            List<BoardResponseDTO> dtos = toListResponseDTOs(
                    boardService.getMyBoards(currentUser), currentUser);
            resolveProfileImages(dtos);

            return ApiResponse.ok("내 게시글 목록을 조회했습니다.", dtos).toResponse();
        } catch (Exception e) {
            log.error("내 게시글 목록 조회 오류", e);
            return ApiResponse.fail("내 게시글 조회 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 내가 작성한 게시글 삭제 (복수)
     */
    @DeleteMapping("/my/boards")
    public ResponseEntity<?> deleteMyBoards(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody BoardDeleteRequest request) {
        try {
            User currentUser = userDetails != null ? userDetails.getUser() : null;
            if (currentUser == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }

            List<Long> boardIds = request.getBoardIds();
            if (boardIds == null || boardIds.isEmpty()) {
                return ApiResponse.fail("삭제할 게시글을 선택해주세요.").toResponse(HttpStatus.BAD_REQUEST);
            }

            boardService.deleteMyBoards(boardIds, currentUser);
            return ApiResponse.ok("게시글이 삭제되었습니다.", null).toResponse();
        } catch (AccessDeniedException exception) {
            return ApiResponse.fail(exception.getMessage()).toResponse(HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            log.error("내 게시글 삭제 오류", e);
            return ApiResponse.fail("게시글 삭제 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 내가 댓글 단 게시글 목록 조회
     */
    @GetMapping("/my/commented-boards")
    public ResponseEntity<?> getMyCommentedBoards(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            User currentUser = userDetails != null ? userDetails.getUser() : null;
            if (currentUser == null) {
                return ApiResponse.fail("로그인이 필요합니다.").toResponse(HttpStatus.UNAUTHORIZED);
            }

            List<Long> boardIds = commentRepository.findDistinctBoardIdsByAuthor(
                    currentUser, List.of(STATUS.DELETED));

            List<Board> boards = new ArrayList<>();
            for (Long boardId : boardIds) {
                boardService.findById(boardId).ifPresent(boards::add);
            }
            List<BoardResponseDTO> dtos = toListResponseDTOs(boards, currentUser);
            resolveProfileImages(dtos);
            return ApiResponse.ok("댓글 단 게시글 목록을 조회했습니다.", dtos).toResponse();
        } catch (Exception e) {
            log.error("댓글 단 게시글 조회 오류", e);
            return ApiResponse.fail("댓글 단 게시글 조회 중 오류가 발생했습니다.")
                    .toResponse(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/recent-boards")
    public ResponseEntity<?> getRecentBoards(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getUser() == null) {
            return ApiResponse.fail("유저 정보를 찾을 수 없습니다. 다시 로그인해주세요.")
                    .toResponse(HttpStatus.BAD_REQUEST);
        }

        User user = userDetails.getUser();
        List<BoardResponseDTO> recentBoards = toListResponseDTOs(
                boardService.getRecentBoards(),
                user);
        resolveProfileImages(recentBoards);
        return ResponseEntity.ok(recentBoards);
    }

}
