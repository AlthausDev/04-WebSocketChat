package com.althaus.dev.chatbackend.domain.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

/**
 * Representa un mensaje dentro del sistema de chat.
 * Esta entidad se almacena en una colección de MongoDB.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Document(collection = "messages")
public class Message {

    /**
     * Identificador único del mensaje en MongoDB.
     */
    @Id
    private String id;

    /**
     * Contenido del mensaje enviado por el usuario.
     */
    private String text;

    /**
     * Marca de tiempo indicando cuándo se envió el mensaje.
     * Se indexa para mejorar el rendimiento en consultas basadas en fecha.
     */
    @Indexed
    private Instant date;

    /**
     * Nombre de usuario del remitente del mensaje.
     */
    private String username;

    /**
     * Tipo de mensaje, que puede indicar un mensaje estándar o una notificación especial.
     */
    private String type;

    /**
     * Color asignado al usuario dentro del chat.
     * Solo se asigna a los mensajes de tipo "NEW_USER".
     */
    private String color;
}
