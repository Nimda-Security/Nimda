package com.nimda.cup.judge.enums;

public enum Language {
    JAVA("Java"),
    CPP17("C++17"),
    PYTHON("Python"),
    C99("C99"),
    C11("C11");

    private final String displayName;

    Language(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Language fromString(String language) {
        switch (language.toLowerCase()) {
            case "java":
                return JAVA;
            case "c++17":
            case "cpp17":
                return CPP17;
            case "python":
                return PYTHON;
            case "c99":
                return C99;
            case "c":
            case "c11":
                return C11;
            default:
                throw new IllegalArgumentException("지원하지 않는 언어입니다: " + language);
        }
    }
}
