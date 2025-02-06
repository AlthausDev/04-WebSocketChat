package com.althaus.dev.chatbackend.service;

import com.althaus.dev.chatbackend.domain.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public interface MessageService {
    /**
     * Obtiene los mensajes más recientes con paginación.
     */
    Page<Message> getMessages(Pageable pageable);

    /**
     * Guarda un mensaje en la base de datos.
     */
    void saveMessage(Message message);
}
