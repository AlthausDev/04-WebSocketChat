package com.althaus.dev.chatbackend.service;

import com.althaus.dev.chatbackend.domain.model.Message;
import com.althaus.dev.chatbackend.domain.repository.MessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Page<Message> getMessages(Pageable pageable) {
        return messageRepository.findAllByOrderByDateDesc(pageable);
    }

    public Message saveMessage(Message message) {
        return messageRepository.save(Objects.requireNonNull(message, "message"));
    }
}
