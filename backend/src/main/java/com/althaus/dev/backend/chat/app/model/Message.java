package com.althaus.dev.backend.chat.app.model;

public class Message {

    private String text;
    private Long Date;

    public String getText() {
        return text;
    }
    public void setText(String text) {
        this.text = text;
    }
    public Long getDate() {
        return Date;
    }
    public void setDate(Long date) {
        Date = date;
    }
}
