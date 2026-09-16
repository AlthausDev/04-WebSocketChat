# WebSocket Chat

Chat full-stack en tiempo real construido con **Angular**, **STOMP/SockJS**, **Spring Boot** y **MongoDB**.

El objetivo del proyecto es mostrar de forma compacta el flujo completo de una aplicación bidireccional: conexión del cliente, publicación STOMP, difusión de eventos, persistencia de mensajes e historial reciente.

## Stack

### Backend
- Java 23
- Spring Boot 3.4
- Spring WebSocket / STOMP
- Spring Data MongoDB
- Maven

### Frontend
- Angular 22
- `@stomp/stompjs`
- SockJS
- RxJS
- Bootstrap 5

## Arquitectura

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

El servidor es la fuente de verdad para los mensajes: asigna la fecha, normaliza los datos recibidos y controla el color asociado a cada usuario. Los identificadores enviados por el cliente no se reutilizan al persistir mensajes.

## Comportamiento

- Los mensajes normales se guardan en MongoDB y se difunden a los clientes conectados.
- Los eventos de conexión (`NEW_USER`) se publican en tiempo real, pero no se persisten.
- El indicador de escritura usa un canal STOMP independiente.
- Al conectarse, cada cliente solicita los últimos 50 mensajes mediante un canal de historial específico para su `clientId`.
- El frontend evita duplicar mensajes ya recibidos cuando llega el historial.
- La reconexión automática de STOMP está configurada a 5 segundos.

## Puesta en marcha

### Requisitos

- JDK 23
- Node.js y npm
- MongoDB en `localhost:27017`

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

### Frontend

```bash
cd frontend
npm ci
npm start
```

Después abre `http://localhost:4200`.

La URL WebSocket por defecto es `http://localhost:8080/chat` y se define en `frontend/src/app/core/websocket.config.ts`.

## Estructura

```text
backend/
  src/main/java/.../config        configuración WebSocket
  src/main/java/.../controller    endpoints STOMP
  src/main/java/.../domain        modelo y repositorio MongoDB
  src/main/java/.../service       lógica de persistencia

frontend/
  src/app/core                    configuración y destinos STOMP
  src/app/features/chat           UI y cliente WebSocket
  src/app/model                   modelo compartido en el frontend
```

## Alcance

Es un proyecto formativo deliberadamente pequeño. No implementa autenticación, salas privadas ni presencia distribuida; el broker es el broker simple en memoria de Spring. El foco está en la comunicación en tiempo real y en mantener claro el recorrido de un mensaje de extremo a extremo.

## Licencia

El código original puede reutilizarse bajo la [licencia de atribución](LICENSE). Si lo usas como base o referencia, cita a **Sam Althaus / AlthausDev** y, cuando sea práctico, enlaza este repositorio.

Las dependencias y componentes de terceros conservan sus propias licencias.
