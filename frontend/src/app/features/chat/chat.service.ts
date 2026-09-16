import { Injectable, signal } from '@angular/core';
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

interface ChatMessageRequest {
    username: string;
    text?: string;
    type: 'MESSAGE' | 'NEW_USER';
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private client?: Client;
    private username = '';
    private typingResetTimeout?: ReturnType<typeof setTimeout>;
    private lastTypingSentAt = 0;
    private readonly clientId = crypto.randomUUID();

    private readonly connectedState = signal(false);
    private readonly typingState = signal('');
    private readonly messagesState = signal<Message[]>([]);

    readonly connected = this.connectedState.asReadonly();
    readonly typing = this.typingState.asReadonly();
    readonly messages = this.messagesState.asReadonly();

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
                this.connectedState.set(true);
                this.subscribeToMessages();
                this.subscribeToTyping();
                this.subscribeToHistory();
                this.requestHistory();
                this.announceUser();
            },
            onDisconnect: () => this.connectedState.set(false),
            onWebSocketClose: () => this.connectedState.set(false),
            onStompError: frame => {
                console.error('STOMP error:', frame.headers['message'] ?? frame.body);
            }
        });

        this.client.activate();
    }

    disconnect(): void {
        const client = this.client;
        if (!client) {
            return;
        }

        this.clearTypingState();
        this.connectedState.set(false);
        this.username = '';
        this.client = undefined;
        void client.deactivate();
    }

    sendMessage(text: string): void {
        const normalizedText = text.trim();
        if (!this.client?.connected || !normalizedText || !this.username) {
            return;
        }

        this.publishJson(SEND_MESSAGE_DESTINATION, {
            username: this.username,
            text: normalizedText,
            type: 'MESSAGE'
        });
    }

    sendTyping(): void {
        if (!this.client?.connected || !this.username) {
            return;
        }

        const now = Date.now();
        if (now - this.lastTypingSentAt < 750) {
            return;
        }
        this.lastTypingSentAt = now;

        this.client.publish({
            destination: SEND_TYPING_DESTINATION,
            body: this.username
        });
    }

    private announceUser(): void {
        if (!this.client?.connected || !this.username) {
            return;
        }

        this.publishJson(SEND_MESSAGE_DESTINATION, {
            username: this.username,
            type: 'NEW_USER'
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
                const received = this.toMessage(JSON.parse(event.body));
                const current = this.messagesState();

                if (received.id && current.some(message => message.id === received.id)) {
                    return;
                }

                this.messagesState.set([...current, received]);
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

            this.typingState.set(`${typingUser} está escribiendo...`);
            if (this.typingResetTimeout) {
                clearTimeout(this.typingResetTimeout);
            }

            this.typingResetTimeout = setTimeout(() => this.typingState.set(''), 1500);
        });
    }

    private subscribeToHistory(): void {
        this.client?.subscribe(`${HISTORY_TOPIC}${this.clientId}`, (event: IMessage) => {
            try {
                const history = (JSON.parse(event.body) as unknown[]).map(message => this.toMessage(message));
                const historyIds = new Set(history.flatMap(message => message.id ? [message.id] : []));
                const liveMessages = this.messagesState().filter(
                    message => !message.id || !historyIds.has(message.id)
                );

                this.messagesState.set([...history, ...liveMessages]);
            } catch (error) {
                console.error('Invalid history received:', error);
            }
        });
    }

    private publishJson(destination: string, body: ChatMessageRequest): void {
        this.client?.publish({
            destination,
            body: JSON.stringify(body)
        });
    }

    private clearTypingState(): void {
        if (this.typingResetTimeout) {
            clearTimeout(this.typingResetTimeout);
            this.typingResetTimeout = undefined;
        }
        this.typingState.set('');
        this.lastTypingSentAt = 0;
    }

    private toMessage(value: unknown): Message {
        if (!value || typeof value !== 'object') {
            throw new Error('Message payload is not an object');
        }

        const candidate = value as Partial<Record<keyof Message, unknown>>;
        if (
            typeof candidate.text !== 'string' ||
            typeof candidate.username !== 'string' ||
            (candidate.type !== 'MESSAGE' && candidate.type !== 'NEW_USER') ||
            typeof candidate.color !== 'string'
        ) {
            throw new Error('Message payload has an invalid shape');
        }

        const date = candidate.date instanceof Date
            ? new Date(candidate.date.getTime())
            : new Date(candidate.date as string | number);

        if (Number.isNaN(date.getTime())) {
            throw new Error('Message payload has an invalid date');
        }

        return {
            id: typeof candidate.id === 'string' ? candidate.id : undefined,
            text: candidate.text,
            date,
            username: candidate.username,
            type: candidate.type,
            color: candidate.color
        };
    }
}
