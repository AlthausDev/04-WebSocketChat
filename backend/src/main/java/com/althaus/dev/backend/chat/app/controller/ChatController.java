package com.althaus.dev.backend.chat.app.controller;

import com.althaus.dev.backend.chat.app.model.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.time.Instant;

@Controller
public class ChatController {

    @MessageMapping("/message")
    @SendTo("/topic/message")
    public Message receiveMessage(Message message) {
        if ("NEW_USER".equals(message.getType())) {
            message.setText("Nuevo usuario");
        }

        return new Message(
                message.getText(),
                Instant.now(),
                message.getUsername(),
                message.getType()
        );
    }
}
