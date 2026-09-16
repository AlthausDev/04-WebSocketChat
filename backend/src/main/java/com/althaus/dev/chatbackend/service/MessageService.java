package com.althaus.dev.chatbackend.service;

import com.althaus.dev.chatbackend.domain.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MessageService {

    Page<Message> getMessages(Pageable pageable);

    Message saveMessage(Message message);
}
