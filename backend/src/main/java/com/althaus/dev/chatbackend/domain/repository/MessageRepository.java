package com.althaus.dev.chatbackend.domain.repository;

import com.althaus.dev.chatbackend.domain.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    /**
     * Obtiene los mensajes más recientes con paginación.
     */
    Page<Message> findAllByOrderByDateDesc(Pageable pageable);
}
