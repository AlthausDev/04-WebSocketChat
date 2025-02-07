package com.althaus.dev.chatbackend.controller.websocket;

import com.althaus.dev.chatbackend.domain.model.Message;
import com.althaus.dev.chatbackend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.time.Instant;
import java.util.Random;

@Controller
public class ChatWebSocketController {

    private final String[] colors = {"red", "blue", "green", "orange", "purple", "yellow", "black"};
    private final MessageService service;

    @Autowired
    private SimpMessagingTemplate webSocket;

    public ChatWebSocketController(MessageService service) {
        this.service = service;
    }

    @MessageMapping("/message")
    @SendTo("/topic/message")
    public Message receiveMessage(Message message) {

        Instant timestamp = Instant.now();

        if ("NEW_USER".equals(message.getType())) {
            return new Message(
                    message.getId(),
                    "Nuevo usuario conectado",
                    timestamp,
                    message.getUsername(),
                    message.getType(),
                    colors[new Random().nextInt(colors.length)]
            );
        }

        Message savedMessage = new Message(
                message.getId(),
                message.getText(),
                timestamp,
                message.getUsername(),
                message.getType(),
                message.getColor()
        );

        service.saveMessage(savedMessage);
        return savedMessage;
    }


    @MessageMapping("/typing")
    @SendTo("/topic/typing")
    public String isTyping(String username) {
        return username.concat(" está escribiendo ...");
    }

    @MessageMapping("/history")
    public void getHistory(String clientId) {
        int page = 0;
        int size = 10;

        var messages = service.getMessages(PageRequest.of(page, size)).getContent();
        webSocket.convertAndSend("/topic/history/" + clientId, messages);
    }

}
