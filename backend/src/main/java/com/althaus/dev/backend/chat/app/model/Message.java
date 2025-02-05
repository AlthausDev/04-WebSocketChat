package com.althaus.dev.backend.chat.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "messages")
public class Message {

    @Id
    private String id;
    private String text;
    private Instant date;
    private String username;
    private String type;
    private String color;

    public Message() {}

    public Message(String id, String text, Instant date, String username, String type, String color) {
        this.id = id;
        this.text = text;
        this.date = date;
        this.username = username;
        this.type = type;
        this.color = color;
    }

    public String getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Instant getDate() {
        return date;
    }

    public String getType() {
        return type;
    }

    public String getColor() {
        return color;
    }
    public void setDate(Instant date) {
        this.date = date;
    }

    public String getUsername() {
        return username;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setColor(String color) {
        this.color = color;
    }

    @Override
    public String toString() {
        return "Message{" +
                "text='" + text + '\'' +
                ", date=" + date +
                ", username='" + username + '\'' +
                '}';
    }
}
