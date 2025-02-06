package com.althaus.dev.chatbackend.service;

import com.althaus.dev.chatbackend.domain.model.Message;

import java.util.List;

public interface MessageService {

    List<Message> getMessages();
    void saveMessage(Message message);
}
