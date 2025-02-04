package com.althaus.dev.backend.chat.app.controller;

import com.althaus.dev.backend.chat.app.model.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.time.Instant;

@Controller
public class ChatController {

    private final String[] colors = {"red", "blue", "green", "orange", "purple", "yellow", "black"};

    @MessageMapping("/message")
    @SendTo("/topic/message")
    public Message receiveMessage(Message message) {
        if ("NEW_USER".equals(message.getType())) {
            message.setColor(colors[(int) Math.floor(Math.random() * colors.length)]);
            message.setText("Nuevo usuario conectado");
        }

        return new Message(
                message.getText(),
                Instant.now(),
                message.getUsername(),
                message.getType()
        );
    }
}
