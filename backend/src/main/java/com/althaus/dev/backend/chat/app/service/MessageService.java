package com.althaus.dev.backend.chat.app.service;

import com.althaus.dev.backend.chat.app.model.Message;

import java.util.List;

public interface MessageService {

    List<Message> getMessages();
    void saveMessage(Message message);
}
