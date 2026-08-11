package judgeServer.domain.challenge.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * 플래그를 SHA-256 해시로 바꾼다.
 * 등록할 때와 정답을 확인할 때 같은 함수를 써야 하므로 한 곳에 둔다.
 */
public final class FlagHasher {

    private FlagHasher() {
    }

    public static String hash(String flag) {
        if (flag == null || flag.isBlank()) {
            throw new IllegalArgumentException("플래그가 비어 있습니다.");
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(flag.trim().getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder(hashed.length * 2);
            for (byte b : hashed) {
                sb.append(Character.forDigit((b >> 4) & 0xF, 16));
                sb.append(Character.forDigit(b & 0xF, 16));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            // SHA-256은 표준 JDK에 반드시 포함되므로 실제로는 발생하지 않는다.
            throw new IllegalStateException("SHA-256을 사용할 수 없습니다.", e);
        }
    }
}
