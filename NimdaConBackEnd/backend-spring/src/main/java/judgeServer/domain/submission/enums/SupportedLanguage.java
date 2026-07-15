package judgeServer.domain.submission.enums;

import lombok.Getter;

@Getter
public enum SupportedLanguage {
    JAVA("Java"),
    PYTHON3("Python"),
    CPP("C++17"),
    C("C99");

    private final String value;

    SupportedLanguage(String value) {
        this.value = value;
    }

    // 화이트리스트 검증 메서드
    public static boolean isValid(String language) {
        for (SupportedLanguage lang : values()) {
            if (lang.getValue().equalsIgnoreCase(language)) {
                return true;
            }
        }
        return false;
    }
}