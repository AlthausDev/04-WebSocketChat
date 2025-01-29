package com.althaus.dev.backend.chat.app.model;

public class Message {

    private String text;
    private Long timestamp;

    public String getText() {
        return text;
    }
    public void setText(String text) {
        this.text = text;
    }
    public Long getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
}
