package com.althaus.dev.chatbackend.service;

import com.althaus.dev.chatbackend.domain.model.Message;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    private final List<Message> messages = new ArrayList<>();

    @Override
    public List<Message> getMessages() {
        return messages;
    }

    @Override
    public void saveMessage(Message message) {
        messages.add(message);
    }
}
