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
    connected: boolean = false; 
    messages: Message[] = [];  
    userColors: Map<string, string> = new Map();

    private getRandomColor(): string {
        const colors = ["red", "blue", "green", "orange", "purple", "yellow", "black"];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    

    constructor() {
    }

    connect(username: string): void {
        if (this.client && this.client.active) {
            console.log("WebSocket ya está conectado.");
            return;
        }
    
        this.client = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("✅ Conexión establecida");
                this.connected = true;
                this.subscribeToMessages();
    
                if (!this.userColors.has(username)) {
                    this.userColors.set(username, this.getRandomColor());
                }

                this.sendMessage({
                    type: "NEW_USER",
                    username,
                    text: "Nuevo usuario conectado",
                    date: new Date(),
                    color: this.userColors.get(username) || "black"
                });
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
            this.connected = false; 
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
    
        if (receivedMessage.type === "NEW_USER") {
            this.userColors.set(receivedMessage.username, receivedMessage.color);
            console.log(`🎨 Usuario ${receivedMessage.username} conectado con color: ${receivedMessage.color}`);
            this.messages.push(receivedMessage);
        } 
    
        if (receivedMessage.type === "MESSAGE") { 
            this.messages.push(receivedMessage);
            console.log("📌 Mensaje agregado:", receivedMessage);
        }
    }
    
    

    
    sendMessage(message: Message): void {
        if (!this.client || !this.client.connected) {
            console.error("❌ No se pudo enviar el mensaje. WebSocket desconectado.");
            return;
        }
    
        if (message.type !== 'MESSAGE' && message.type !== 'NEW_USER') {
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
