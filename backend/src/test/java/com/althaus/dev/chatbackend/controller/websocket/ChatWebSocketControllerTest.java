package com.althaus.dev.chatbackend.controller.websocket;

import com.althaus.dev.chatbackend.domain.model.Message;
import com.althaus.dev.chatbackend.service.MessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ChatWebSocketControllerTest {

    private MessageService service;
    private ChatWebSocketController controller;

    @BeforeEach
    void setUp() {
        service = mock(MessageService.class);
        controller = new ChatWebSocketController(service, mock(SimpMessagingTemplate.class));
    }

    @Test
    void newUserIsBroadcastWithoutPersisting() {
        ChatMessageRequest incoming = new ChatMessageRequest(" sam ", "ignored", "NEW_USER");

        Message result = controller.receiveMessage(incoming);

        assertEquals("sam", result.getUsername());
        assertEquals("NEW_USER", result.getType());
        assertEquals("Nuevo usuario conectado", result.getText());
        assertNotNull(result.getDate());
        assertNotNull(result.getColor());
        verify(service, never()).saveMessage(any());
    }

    @Test
    void normalMessageIsNormalizedAndPersisted() {
        when(service.saveMessage(any())).thenAnswer(invocation -> invocation.getArgument(0));
        ChatMessageRequest incoming = new ChatMessageRequest("sam", "  hola  ", "MESSAGE");

        Message result = controller.receiveMessage(incoming);

        assertEquals("hola", result.getText());
        assertEquals("sam", result.getUsername());
        assertEquals("MESSAGE", result.getType());
        assertNotNull(result.getColor());
        verify(service).saveMessage(any());
    }

    @Test
    void colorIsStableForTheSameUser() {
        ChatMessageRequest first = new ChatMessageRequest("Sam", null, "NEW_USER");
        ChatMessageRequest second = new ChatMessageRequest("sam", null, "NEW_USER");

        assertEquals(
                controller.receiveMessage(first).getColor(),
                controller.receiveMessage(second).getColor()
        );
    }

    @Test
    void blankMessagesAreRejected() {
        ChatMessageRequest incoming = new ChatMessageRequest("sam", "   ", "MESSAGE");

        assertThrows(IllegalArgumentException.class, () -> controller.receiveMessage(incoming));
    }

    @Test
    void unsupportedTypesAreRejected() {
        ChatMessageRequest incoming = new ChatMessageRequest("sam", "hola", "SYSTEM");

        assertThrows(IllegalArgumentException.class, () -> controller.receiveMessage(incoming));
    }
}
