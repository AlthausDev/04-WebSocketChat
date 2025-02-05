package com.althaus.dev.backend.chat.app.service;

import com.althaus.dev.backend.chat.app.model.Message;
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
