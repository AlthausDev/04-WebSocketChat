package com.althaus.dev.backend.chat.app.controller;

import com.althaus.dev.backend.chat.app.model.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.time.Instant;
import java.util.Random;

@Controller
public class ChatController {

    private final String[] colors = {"red", "blue", "green", "orange", "purple", "yellow", "black"};

    @MessageMapping("/message")
    @SendTo("/topic/message")
    public Message receiveMessage(Message message) {
        if ("NEW_USER".equals(message.getType())) {
            message.setColor(this.colors[new Random().nextInt(this.colors.length)]);
            message.setText("Nuevo usuario conectado");
        }

        return new Message(
                message.getText(),
                Instant.now(),
                message.getUsername(),
                message.getType(),
                message.getColor()
        );
    }
}
