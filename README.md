# WebSocket Chat

Chat full-stack en tiempo real construido con **Angular**, **STOMP/SockJS**, **Spring Boot** y **MongoDB**.

Es un ejercicio formativo pequeño centrado en una sola idea: seguir el recorrido completo de un mensaje desde el navegador hasta el backend, difundirlo por WebSocket y persistirlo sin esconder el flujo detrás de capas innecesarias.

## Stack

### Backend
- Java 21
- Spring Boot 3.4
- Spring WebSocket / STOMP
- Spring Data MongoDB
- Maven

### Frontend
- Angular 22
- Angular Signals
- `@stomp/stompjs`
- SockJS
- Bootstrap 5

## Flujo

```text
Angular client
    │
    │ SockJS + STOMP
    ▼
Spring WebSocket endpoint  /chat
    │
    ├── /app/message  ─────► /topic/message
    ├── /app/typing   ─────► /topic/typing
    └── /app/history  ─────► /topic/history/{clientId}
                              │
                              ▼
                           MongoDB
```

El cliente solo envía los datos necesarios. El backend normaliza usuario y texto, asigna la fecha, decide el color de forma determinista y genera el identificador al persistir el mensaje.

## Comportamiento

- Los mensajes normales se guardan en MongoDB y se difunden a los clientes conectados.
- Los eventos `NEW_USER` se publican en tiempo real, pero no se persisten.
- El indicador de escritura usa un destino STOMP independiente y el cliente limita la frecuencia de publicación.
- Al conectarse, cada cliente solicita los últimos 50 mensajes mediante un canal de historial asociado a su `clientId`.
- El frontend valida los payloads recibidos y evita duplicar mensajes cuando se mezcla historial con tráfico en vivo.
- STOMP intenta reconectar automáticamente cada 5 segundos.

## Puesta en marcha

### Requisitos

- JDK 21
- Node.js y npm
- MongoDB

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

En Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Por defecto el backend usa:

```text
mongodb://localhost:27017/websocket_chat
```

Puede sobrescribirse con `MONGODB_URI`. El origen permitido para el frontend es `http://localhost:4200` y puede cambiarse con `CHAT_ALLOWED_ORIGIN`.

### Frontend

```bash
cd frontend
npm ci
npm start
```

Después abre `http://localhost:4200`.

La URL WebSocket se mantiene en `frontend/src/app/core/websocket.config.ts` y por defecto apunta a `http://localhost:8080/chat`.

## Estructura

```text
backend/
  src/main/java/com/althaus/dev/chatbackend/
    config/                 configuración STOMP/WebSocket
    controller/websocket/   entrada y salida del protocolo
    domain/                 documento y repositorio MongoDB
    service/                persistencia de mensajes

frontend/
  src/app/core/             configuración y destinos STOMP
  src/app/features/chat/    UI y cliente WebSocket
  src/app/model/            tipos del frontend
```

## Decisiones de diseño

El proyecto evita varias capas que no aportan nada para este tamaño: no hay interfaz de servicio decorativa, controlador REST vacío ni DTO de persistencia reutilizado como entrada WebSocket. La entrada del protocolo tiene su propio request y el modelo de MongoDB queda del lado del dominio/persistencia.

Tampoco pretende ser un chat de producción. No incluye autenticación, salas privadas, autorización por destino, presencia distribuida ni un broker externo. El broker simple de Spring es suficiente para el objetivo del ejercicio.

## Licencia

El código original puede reutilizarse bajo la [licencia de atribución](LICENSE). Si lo usas como base o referencia, cita a **Sam Althaus / AlthausDev** y, cuando sea práctico, enlaza este repositorio.

Las dependencias y componentes de terceros conservan sus propias licencias.
