import { Injectable } from "@angular/core";
import { Client, Frame } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WEBSOCKET_URL } from "../../core/websocket.config";
import { Message } from "../../model/message";

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private client!: Client;
    connected: boolean = false;  // ✅ Ahora es un booleano normal
    messages: Message[] = [];  // ✅ Ahora es un array normal de mensajes

    constructor() {
    }

    connect(): void {
        if (this.client && this.client.active) {
            console.log("WebSocket ya está conectado.");
            return;
        }
    
        this.client = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            reconnectDelay: 5000, // ✅ Intenta reconectar cada 5s si la conexión se pierde
            onConnect: () => {
                console.log("✅ Conexión establecida");
                this.connected = true;
                this.subscribeToMessages();
            },
            onDisconnect: () => {
                console.log("❌ Desconectado");
                this.connected = false;
            },
            onStompError: (frame) => {
                console.error("🚨 Error en WebSocket:", frame);
            }
        });
    
        this.client.activate();
    }
    
    disconnect(): void {
        if (this.client) {
            this.client.deactivate();
            this.connected = false; // ✅ Se actualiza `connected`
        }
    }

    private subscribeToMessages(): void {
        if (!this.client || !this.client.connected) {
            console.error("❌ Intentando suscribirse sin conexión WebSocket.");
            return;
        }
    
        this.client.subscribe("/topic/message", (event: Frame) => {
            console.log("📩 Mensaje recibido:", event.body);
            this.handleIncomingMessage(event);
        });
    }
    

    private handleIncomingMessage(event: Frame): void {
        let receivedMessage: Message = JSON.parse(event.body) as Message;
        receivedMessage.date = new Date(receivedMessage.date);
    
        if (receivedMessage.type === 'MESSAGE') { // ✅ Solo agregar mensajes normales
            this.messages.push(receivedMessage);
            console.log("📌 Mensaje agregado:", receivedMessage);
        } else {
            console.log(`📝 Evento recibido (${receivedMessage.type}):`, receivedMessage);
        }
    }
    

    
    sendMessage(message: Message): void {
        if (!this.client || !this.client.connected) {
            console.error("❌ No se pudo enviar el mensaje. WebSocket desconectado.");
            return;
        }
    
        if (message.type !== 'MESSAGE') {
            console.warn("⚠️ Solo se permiten mensajes de chat. Ignorando:", message);
            return;
        }
    
        if (!message.text.trim()) {
            console.warn("⚠️ No se puede enviar un mensaje vacío.");
            return;
        }
    
        this.client.publish({
            destination: "/app/message",
            body: JSON.stringify(message)
        });
    }
    
}
