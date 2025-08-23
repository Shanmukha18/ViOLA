package com.viola.server_side.entity;

public enum GenderPreference {
    ANYONE("Anyone"),
    FEMALES_ONLY("Females Only"),
    MALES_ONLY("Males Only");
    
    private final String displayName;
    
    GenderPreference(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
