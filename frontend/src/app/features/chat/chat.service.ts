import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import {
    HISTORY_TOPIC,
    MESSAGE_TOPIC,
    REQUEST_HISTORY_DESTINATION,
    SEND_MESSAGE_DESTINATION,
    SEND_TYPING_DESTINATION,
    TYPING_TOPIC,
    WEBSOCKET_URL
} from '../../core/websocket.config';
import { Message } from '../../model/message';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private client?: Client;
    private username = '';
    private typingTimeout?: ReturnType<typeof setTimeout>;
    private readonly clientId = crypto.randomUUID();

    readonly connected$ = new BehaviorSubject<boolean>(false);
    readonly typing$ = new BehaviorSubject<string>('');
    readonly messages: Message[] = [];

    connect(username: string): void {
        const normalizedUsername = username.trim();
        if (!normalizedUsername || this.client?.active) {
            return;
        }

        this.username = normalizedUsername;
        this.client = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            reconnectDelay: 5000,
            onConnect: () => {
                this.connected$.next(true);
                this.subscribeToMessages();
                this.subscribeToTyping();
                this.subscribeToHistory();
                this.requestHistory();
                this.announceUser();
            },
            onDisconnect: () => this.connected$.next(false),
            onWebSocketClose: () => this.connected$.next(false),
            onStompError: (frame) => {
                console.error('STOMP error:', frame.headers['message'] ?? frame.body);
            }
        });

        this.client.activate();
    }

    disconnect(): void {
        if (!this.client) {
            return;
        }

        void this.client.deactivate();
        this.connected$.next(false);
        this.typing$.next('');
    }

    sendMessage(message: Message): void {
        if (!this.client?.connected) {
            return;
        }

        const text = message.text?.trim();
        if (!text) {
            return;
        }

        const outgoing: Message = {
            ...message,
            id: undefined,
            username: this.username,
            type: 'MESSAGE',
            text,
            date: new Date()
        };

        this.client.publish({
            destination: SEND_MESSAGE_DESTINATION,
            body: JSON.stringify(outgoing)
        });
    }

    sendTyping(): void {
        if (!this.client?.connected || !this.username) {
            return;
        }

        this.client.publish({
            destination: SEND_TYPING_DESTINATION,
            body: this.username
        });
    }

    private announceUser(): void {
        if (!this.client?.connected) {
            return;
        }

        const message: Message = {
            type: 'NEW_USER',
            username: this.username,
            text: 'Nuevo usuario conectado',
            date: new Date(),
            color: ''
        };

        this.client.publish({
            destination: SEND_MESSAGE_DESTINATION,
            body: JSON.stringify(message)
        });
    }

    private requestHistory(): void {
        this.client?.publish({
            destination: REQUEST_HISTORY_DESTINATION,
            body: this.clientId
        });
    }

    private subscribeToMessages(): void {
        this.client?.subscribe(MESSAGE_TOPIC, (event: IMessage) => {
            try {
                const received = this.toMessage(JSON.parse(event.body) as Message);

                if (received.id && this.messages.some(message => message.id === received.id)) {
                    return;
                }

                this.messages.push(received);
            } catch (error) {
                console.error('Invalid message received:', error);
            }
        });
    }

    private subscribeToTyping(): void {
        this.client?.subscribe(TYPING_TOPIC, (event: IMessage) => {
            const typingUser = event.body.trim();
            if (!typingUser || typingUser === this.username) {
                return;
            }

            this.typing$.next(`${typingUser} está escribiendo...`);
            if (this.typingTimeout) {
                clearTimeout(this.typingTimeout);
            }

            this.typingTimeout = setTimeout(() => this.typing$.next(''), 1500);
        });
    }

    private subscribeToHistory(): void {
        this.client?.subscribe(`${HISTORY_TOPIC}${this.clientId}`, (event: IMessage) => {
            try {
                const history = (JSON.parse(event.body) as Message[]).map(message => this.toMessage(message));
                const historyIds = new Set(history.map(message => message.id).filter(Boolean));
                const liveMessages = this.messages.filter(
                    message => !message.id || !historyIds.has(message.id)
                );

                this.messages.splice(0, this.messages.length, ...history, ...liveMessages);
            } catch (error) {
                console.error('Invalid history received:', error);
            }
        });
    }

    private toMessage(message: Message): Message {
        return {
            ...message,
            date: new Date(message.date)
        };
    }
}
