package com.nimda.cite.domain.point.usage.service;

import com.nimda.cite.domain.board.entity.Board;
import com.nimda.cite.domain.board.enums.BoardStatus;
import com.nimda.cite.domain.board.enums.ShopItemType;
import com.nimda.cite.domain.board.repository.BoardRepository;
import com.nimda.cite.domain.point.entity.PointDetail;
import com.nimda.cite.domain.point.entity.UserBalance;
import com.nimda.cite.domain.point.repositroy.PointDetailRepository;
import com.nimda.cite.domain.point.repositroy.UserBalanceRepository;
import com.nimda.cite.domain.point.usage.dto.PointUsageResponse;
import com.nimda.cite.domain.profiledecoration.entity.ProfileDecoration;
import com.nimda.cite.domain.profiledecoration.ownership.ProfileDecorationOwnershipService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PointUsageService {

    private static final Logger log = LoggerFactory.getLogger(PointUsageService.class);

    private final BoardRepository boardRepository;
    private final UserBalanceRepository userBalanceRepository;
    private final PointDetailRepository pointDetailRepository;
    private final ProfileDecorationOwnershipService profileDecorationOwnershipService;

    @Transactional
    public PointUsageResponse purchaseBoardItem(Long userId, Long boardId) {
        try {
            Board board = boardRepository.findById(boardId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "게시글을 찾을 수 없습니다: " + boardId
                    ));

            validatePurchasable(board);
            validateNotAlreadyOwned(userId, board);
            ShopItemType itemType = resolveItemType(board);

            UserBalance balance = spendBalance(
                    userId,
                    "아이템 구매: " + board.getTitle(),
                    board.getItemPrice()
            );

            return PointUsageResponse.builder()
                    .boardId(board.getId())
                    .itemName(board.getTitle())
                    .price(board.getItemPrice())
                    .remainingAmount(balance.getTotalAmount())
                    .itemType(itemType.name())
                    .profileDecorationKey(grantPurchasedItem(userId, board))
                    .build();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (RuntimeException e) {
            log.error("상품 구매 처리 오류", e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (Exception e) {
            log.error("상품 구매 오류", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "상품 구매 중 오류가 발생했습니다.", e);
        }
    }

    private void validatePurchasable(Board board) {
        if (board.getStatus() != BoardStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "구매할 수 없는 상품입니다.");
        }
        if (board.getCategory() == null || !Boolean.TRUE.equals(board.getCategory().getShopEnabled())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "마일리지 구매 상품이 아닙니다.");
        }
        if (board.getItemPrice() == null || board.getItemPrice() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "상품 가격이 설정되지 않았습니다.");
        }
        if (resolveItemType(board) == ShopItemType.BADGE && board.getProfileDecoration() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "상품에 연결된 배지가 없습니다.");
        }
    }

    private void validateNotAlreadyOwned(Long userId, Board board) {
        if (resolveItemType(board) != ShopItemType.BADGE) {
            return;
        }

        ProfileDecoration decoration = board.getProfileDecoration();
        if (profileDecorationOwnershipService.owns(userId, decoration.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 보유한 배지입니다.");
        }
    }

    private String grantPurchasedItem(Long userId, Board board) {
        if (resolveItemType(board) != ShopItemType.BADGE) {
            return null;
        }

        ProfileDecoration decoration = board.getProfileDecoration();
        profileDecorationOwnershipService.grant(userId, decoration);
        return decoration.getKey();
    }

    private ShopItemType resolveItemType(Board board) {
        return board.getItemType() == null ? ShopItemType.GENERAL : board.getItemType();
    }

    private UserBalance spendBalance(Long userId, String description, Long pointAmount) {
        if (pointAmount == null || pointAmount <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "차감할 마일리지가 올바르지 않습니다.");
        }

        UserBalance balance = userBalanceRepository.findByIdForUpdate(userId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "포인트 계좌가 존재하지 않습니다.")
        );

        if (balance.getTotalAmount() < pointAmount) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "보유 마일리지가 부족합니다.");
        }

        balance.setUpdatedAt(LocalDateTime.now());
        balance.setTotalAmount(balance.getTotalAmount() - pointAmount);

        PointDetail pointDetail = PointDetail.builder()
                .userBalance(balance)
                .amount(-pointAmount)
                .description(description)
                .createdAt(LocalDateTime.now())
                .expiredAt(LocalDateTime.now().plusYears(1L))
                .remainingAmount(balance.getTotalAmount())
                .build();

        pointDetailRepository.save(pointDetail);
        return balance;
    }
}
