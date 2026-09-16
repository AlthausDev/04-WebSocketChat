package com.althaus.dev.chatbackend.domain.repository;

import com.althaus.dev.chatbackend.domain.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MessageRepository extends MongoRepository<Message, String> {

    Page<Message> findAllByOrderByDateDesc(Pageable pageable);
}
