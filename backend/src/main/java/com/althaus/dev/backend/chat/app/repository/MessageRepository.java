package com.althaus.dev.backend.chat.app.repository;

import com.althaus.dev.backend.chat.app.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    List<Message> findFirst10ByOrderByDateAsc();
}
