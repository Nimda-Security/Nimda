package judgeServer.domain.challenge.instance;

import java.util.Optional;

// 도메인을 보고 호스트를 판단하는 모듈 분리할 필요 있음
public final class ChallengeHost {

    private ChallengeHost() {
    }

    /**
     * host가 인스턴스 서브도메인이면 token을, 아니면 empty를 돌려준다.
     * baseDomain이 비어 있으면(기능 off) 항상 empty.
     */
    public static Optional<String> token(String host, String prefix, String baseDomain) {
        if (host == null || baseDomain == null || baseDomain.isBlank()) {
            return Optional.empty();
        }

        // 포트가 붙어 있으면 떼어낸다: "inst-x.dev:8080" -> "inst-x.dev"
        int colon = host.indexOf(':');
        if (colon >= 0) {
            host = host.substring(0, colon);
        }
        host = host.toLowerCase();

        String suffix = "." + baseDomain.toLowerCase();
        if (!host.startsWith(prefix) || !host.endsWith(suffix)) {
            return Optional.empty();
        }

        String token = host.substring(prefix.length(), host.length() - suffix.length());
        // token은 점 없는 한 라벨이어야 한다(중첩 서브도메인/빈 토큰 방지).
        if (token.isEmpty() || token.contains(".")) {
            return Optional.empty();
        }
        return Optional.of(token);
    }
}
