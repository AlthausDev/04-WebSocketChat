package com.althaus.dev.chatbackend.service;

import com.althaus.dev.chatbackend.domain.model.Message;
import com.althaus.dev.chatbackend.domain.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageServiceMongo implements MessageService {

    private final MessageRepository messageRepository;

    public MessageServiceMongo(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Override
    public List<Message> getMessages() {
        return messageRepository.findFirst10ByOrderByDateAsc();
    }

    @Override
    public void saveMessage(Message message) {
        messageRepository.save(message);
    }
}
