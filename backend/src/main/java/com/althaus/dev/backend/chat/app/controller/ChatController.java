package com.althaus.dev.backend.chat.app.controller;

import com.althaus.dev.backend.chat.app.model.Message;
import com.althaus.dev.backend.chat.app.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.time.Instant;
import java.util.List;
import java.util.Random;

import static java.util.stream.DoubleStream.concat;

@Controller
public class ChatController {

    private final String[] colors = {"red", "blue", "green", "orange", "purple", "yellow", "black"};
    private final MessageService service;

    @Autowired
    private SimpMessagingTemplate webSocket;

    public ChatController(@Qualifier("messageServiceMongo") MessageService service) {
        this.service = service;
    }


    @MessageMapping("/message")
    @SendTo("/topic/message")
    public Message receiveMessage(Message message) {
        if ("NEW_USER".equals(message.getType())) {
            message.setColor(this.colors[new Random().nextInt(this.colors.length)]);
            message.setText("Nuevo usuario conectado");
        } else{
            service.saveMessage(message);
        }

        return new Message(
                message.getId(),
                message.getText(),
                Instant.now(),
                message.getUsername(),
                message.getType(),
                message.getColor()
        );
    }

    @MessageMapping("/typing")
    @SendTo("/topic/typing")
    public String isTyping(String username) {
        return username.concat(" está escribiendo ...");
    }

    @MessageMapping("/history")
    public void getHistory(String clientId) {
        webSocket.convertAndSend("/topic/history/".concat(clientId), service.getMessages());
    }
}
