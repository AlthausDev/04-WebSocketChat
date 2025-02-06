package com.althaus.dev.chatbackend.domain.repository;

import com.althaus.dev.chatbackend.domain.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    List<Message> findFirst10ByOrderByDateAsc();
}
