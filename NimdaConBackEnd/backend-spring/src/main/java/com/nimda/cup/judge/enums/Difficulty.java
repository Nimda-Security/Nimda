package com.nimda.cup.judge.enums;

public enum Difficulty {

    EASY("Easy"),
    MEDIUM("Medium"),
    HARD("Hard"),
    EXPERT("Expert");
    
    private final String displayName;
    
    Difficulty(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
}
