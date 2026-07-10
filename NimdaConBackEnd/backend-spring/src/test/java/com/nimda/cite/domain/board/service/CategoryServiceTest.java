package com.nimda.cite.domain.board.service;

import com.nimda.cite.domain.board.dto.CategoryResponseDTO;
import com.nimda.cite.domain.board.dto.CategoryUpdateDTO;
import com.nimda.cite.domain.board.entity.Category;
import com.nimda.cite.domain.board.enums.BoardStatus;
import com.nimda.cite.domain.board.repository.BoardRepository;
import com.nimda.cite.domain.board.repository.CategoryRepository;
import com.nimda.cite.user.entity.Authority;
import com.nimda.cite.user.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private BoardRepository boardRepository;
    @InjectMocks
    private CategoryService categoryService;

    @Test
    void groupedActiveCountsLeaveAbsentCategoriesAtZeroInTheResponseDto() {
        Category counted = category(1L, 99);
        Category absent = category(2L, 77);
        when(boardRepository.countByCategoryIdsAndStatus(List.of(1L, 2L), BoardStatus.ACTIVE))
                .thenReturn(List.<Object[]>of(new Object[]{1L, 3L}));

        Map<Long, Integer> counts = categoryService.getActiveBoardCountsByCategoryIds(List.of(counted, absent));

        assertEquals(Map.of(1L, 3), counts);
        assertEquals(3, CategoryResponseDTO.from(counted, counts.get(counted.getId())).getPostCount());
        assertEquals(0, CategoryResponseDTO.from(absent, counts.get(absent.getId())).getPostCount());
    }

    @Test
    void deletionChecksPersistedActiveAndHiddenBoardsRatherThanCachedPostCount() {
        Category category = category(8L, 0);
        when(categoryRepository.findById(8L)).thenReturn(Optional.of(category));
        when(categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(8L)).thenReturn(List.of());
        when(boardRepository.existsByCategoryIdAndStatusIn(8L, List.of(BoardStatus.ACTIVE, BoardStatus.HIDDEN)))
                .thenReturn(true);

        assertThrows(RuntimeException.class, () -> categoryService.deleteCategory(8L, administrator()));

        assertTrue(category.getIsActive());
        verify(boardRepository).existsByCategoryIdAndStatusIn(8L, List.of(BoardStatus.ACTIVE, BoardStatus.HIDDEN));
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void updateCannotBypassCategoryDeactivationChecks() {
        Category category = category(8L, 0);
        CategoryUpdateDTO update = new CategoryUpdateDTO();
        update.setIsActive(false);
        when(categoryRepository.findById(8L)).thenReturn(Optional.of(category));
        when(categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(8L))
                .thenReturn(List.of());
        when(boardRepository.existsByCategoryIdAndStatusIn(
                8L, List.of(BoardStatus.ACTIVE, BoardStatus.HIDDEN)))
                .thenReturn(true);

        assertThrows(
                RuntimeException.class,
                () -> categoryService.updateCategory(8L, update, administrator()));

        assertTrue(category.getIsActive());
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void rootParentSentinelClearsParentWithoutLookingUpAParent() {
        Category category = category(9L, 0);
        category.setParentId(3L);
        CategoryUpdateDTO update = new CategoryUpdateDTO();
        update.setParentId(-1L);
        when(categoryRepository.findById(9L)).thenReturn(Optional.of(category));
        when(categoryRepository.save(category)).thenReturn(category);

        Category result = categoryService.updateCategory(9L, update, administrator());

        assertEquals(category, result);
        assertEquals(null, category.getParentId());
        verify(categoryRepository, never()).findById(-1L);
        verify(categoryRepository).save(category);
    }

    @Test
    void reparentingCategoryWithChildrenIsRejectedEvenWhenChildrenAreInactive() {
        Category category = category(10L, 0);
        CategoryUpdateDTO update = new CategoryUpdateDTO();
        update.setParentId(3L);
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(categoryRepository.existsByParentId(10L)).thenReturn(true);

        assertThrows(RuntimeException.class, () -> categoryService.updateCategory(10L, update, administrator()));

        assertEquals(null, category.getParentId());
        verify(categoryRepository, never()).findById(3L);
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void reparentingCategoryWithoutChildrenToActiveTopLevelParentSucceeds() {
        Category category = category(10L, 0);
        Category parent = category(3L, 0);
        CategoryUpdateDTO update = new CategoryUpdateDTO();
        update.setParentId(3L);
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(categoryRepository.existsByParentId(10L)).thenReturn(false);
        when(categoryRepository.findById(3L)).thenReturn(Optional.of(parent));
        when(categoryRepository.save(category)).thenReturn(category);

        Category result = categoryService.updateCategory(10L, update, administrator());

        assertEquals(category, result);
        assertEquals(Long.valueOf(3L), category.getParentId());
        verify(categoryRepository).save(category);
    }

    @Test
    void reactivatingChildWithInactiveParentIsRejected() {
        Category category = category(11L, 0);
        category.setIsActive(false);
        category.setParentId(4L);
        Category parent = category(4L, 0);
        parent.setIsActive(false);
        CategoryUpdateDTO update = new CategoryUpdateDTO();
        update.setIsActive(true);
        when(categoryRepository.findById(11L)).thenReturn(Optional.of(category));
        when(categoryRepository.findById(4L)).thenReturn(Optional.of(parent));

        assertThrows(RuntimeException.class, () -> categoryService.updateCategory(11L, update, administrator()));

        assertTrue(!category.getIsActive());
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void reactivatingChildWithActiveTopLevelParentSucceeds() {
        Category category = category(11L, 0);
        category.setIsActive(false);
        category.setParentId(4L);
        Category parent = category(4L, 0);
        CategoryUpdateDTO update = new CategoryUpdateDTO();
        update.setIsActive(true);
        when(categoryRepository.findById(11L)).thenReturn(Optional.of(category));
        when(categoryRepository.findById(4L)).thenReturn(Optional.of(parent));
        when(categoryRepository.save(category)).thenReturn(category);

        Category result = categoryService.updateCategory(11L, update, administrator());

        assertEquals(category, result);
        assertTrue(category.getIsActive());
        verify(categoryRepository).save(category);
    }

    private Category category(Long id, int postCount) {
        Category category = new Category();
        category.setId(id);
        category.setPostCount(postCount);
        category.setIsActive(true);
        return category;
    }

    private User administrator() {
        User user = new User();
        user.getAuthorities().add(new Authority(1L, "ROLE_ADMIN"));
        return user;
    }
}
