package com.althaus.dev.chatbackend.service;

import com.althaus.dev.chatbackend.domain.model.Message;
import com.althaus.dev.chatbackend.domain.repository.MessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    public MessageServiceImpl(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Message> getMessages(Pageable pageable) {
        return messageRepository.findAllByOrderByDateDesc(pageable);
    }

    @Override
    @Transactional
    public Message saveMessage(Message message) {
        if (message == null) {
            throw new IllegalArgumentException("El mensaje no puede ser nulo");
        }
        if (message.getUsername() == null || message.getUsername().isBlank()) {
            throw new IllegalArgumentException("El usuario no puede estar vacío");
        }
        if (message.getText() == null || message.getText().isBlank()) {
            throw new IllegalArgumentException("El mensaje no puede estar vacío");
        }
        return messageRepository.save(message);
    }
}
