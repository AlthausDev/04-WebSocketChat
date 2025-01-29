package com.althaus.dev.backend.chat.app.controller;

import com.althaus.dev.backend.chat.app.model.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Date;

@Controller
public class ChatController {

    @MessageMapping("/message")
    @SendTo("/topic/message")
    public Message receiveMessage(Message message) {
        message.setTimestamp(new Date().getTime());
        message.setText("Received: " + message.getText());

        return message;
    }
}
