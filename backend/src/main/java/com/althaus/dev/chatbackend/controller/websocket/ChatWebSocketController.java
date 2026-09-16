package com.althaus.dev.chatbackend.controller.websocket;

import com.althaus.dev.chatbackend.domain.model.Message;
import com.althaus.dev.chatbackend.service.MessageService;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Controller
public class ChatWebSocketController {

    private static final String TYPE_MESSAGE = "MESSAGE";
    private static final String TYPE_NEW_USER = "NEW_USER";
    private static final String[] COLORS = {"#0d6efd", "#198754", "#6f42c1", "#fd7e14", "#d63384", "#0f766e", "#495057"};
    private static final Pattern CLIENT_ID_PATTERN = Pattern.compile("^[A-Za-z0-9_-]{1,64}$");
    private static final int HISTORY_SIZE = 50;

    private final MessageService service;
    private final SimpMessagingTemplate webSocket;

    public ChatWebSocketController(MessageService service, SimpMessagingTemplate webSocket) {
        this.service = service;
        this.webSocket = webSocket;
    }

    @MessageMapping("/message")
    @SendTo("/topic/message")
    public Message receiveMessage(ChatMessageRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("El mensaje no puede ser nulo");
        }

        String username = requireText(request.username(), "username", 40);
        String type = requireText(request.type(), "type", 20);
        Instant timestamp = Instant.now();
        String color = colorFor(username);

        if (TYPE_NEW_USER.equals(type)) {
            return new Message(
                    null,
                    "Nuevo usuario conectado",
                    timestamp,
                    username,
                    TYPE_NEW_USER,
                    color
            );
        }

        if (!TYPE_MESSAGE.equals(type)) {
            throw new IllegalArgumentException("Tipo de mensaje no soportado");
        }

        Message messageToSave = new Message(
                null,
                requireText(request.text(), "text", 1000),
                timestamp,
                username,
                TYPE_MESSAGE,
                color
        );

        return service.saveMessage(messageToSave);
    }

    @MessageMapping("/typing")
    @SendTo("/topic/typing")
    public String isTyping(String username) {
        return requireText(username, "username", 40);
    }

    @MessageMapping("/history")
    public void getHistory(String clientId) {
        if (clientId == null || !CLIENT_ID_PATTERN.matcher(clientId).matches()) {
            return;
        }

        List<Message> messages = new ArrayList<>(
                service.getMessages(PageRequest.of(0, HISTORY_SIZE)).getContent()
        );
        Collections.reverse(messages);
        webSocket.convertAndSend("/topic/history/" + clientId, messages);
    }

    private static String colorFor(String username) {
        int index = Math.floorMod(username.toLowerCase(Locale.ROOT).hashCode(), COLORS.length);
        return COLORS[index];
    }

    private static String requireText(String value, String field, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " no puede estar vacío");
        }

        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new IllegalArgumentException(field + " supera la longitud máxima permitida");
        }
        return normalized;
    }
}
