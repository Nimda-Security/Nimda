package judgeServer.domain.challenge.mq.stream;

/**
 * Redis Stream 작업에서 나오는 예외를 해석한다.
 *
 * <p>Spring Data는 Lettuce 예외를 {@code RedisSystemException}으로 감싸고, 그 메시지는
 * "Error in execution"이다. Redis가 실제로 뭐라고 했는지는 cause에만 남는다. 그래서 최상위
 * 메시지만 봐서는 "그룹이 이미 있다"(정상)와 "정말 실패했다"(문제)를 구분할 수 없다.
 */
public final class RedisStreamErrors {

    /** 이미 있는 컨슈머 그룹을 다시 만들려 할 때 Redis가 돌려주는 코드. */
    private static final String BUSY_GROUP = "BUSYGROUP";

    private RedisStreamErrors() {
    }

    /**
     * "컨슈머 그룹이 이미 존재한다"는 응답인가.
     *
     * <p>기동할 때마다 그룹 생성을 시도하므로 두 번째 기동부터는 항상 이 예외가 난다. 실패가 아니다.
     */
    public static boolean isBusyGroup(Throwable e) {
        for (Throwable t = e; t != null; t = t.getCause()) {
            if (t.getMessage() != null && t.getMessage().contains(BUSY_GROUP)) {
                return true;
            }
        }
        return false;
    }
}
