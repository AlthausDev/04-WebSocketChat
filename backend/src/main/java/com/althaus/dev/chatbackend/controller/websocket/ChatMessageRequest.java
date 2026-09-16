package com.althaus.dev.chatbackend.controller.websocket;

public record ChatMessageRequest(
        String username,
        String text,
        String type
) {
}
