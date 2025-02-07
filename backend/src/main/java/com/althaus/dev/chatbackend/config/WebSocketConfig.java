package com.althaus.dev.chatbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final String CHAT_ENDPOINT = "/chat";
    private static final String FRONTEND_ORIGIN = "http://localhost:4200";
    private static final String MESSAGE_PREFIX = "/app";
    private static final String SUBSCRIPTION_PREFIX = "/topic/";

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint(CHAT_ENDPOINT)
                .setAllowedOrigins(FRONTEND_ORIGIN)
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker(SUBSCRIPTION_PREFIX);
        registry.setApplicationDestinationPrefixes(MESSAGE_PREFIX);
    }
}
