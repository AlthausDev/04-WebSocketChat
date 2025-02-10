import { Injectable } from "@angular/core";
import { Client } from "@stomp/stompjs";
import { BehaviorSubject, Observable } from "rxjs";
import SockJS from "sockjs-client";
import { WEBSOCKET_URL } from "../../core/websocket.congif";


@Injectable({
    providedIn: 'root'
})

export class ChatService{
    private client!: Client;
    private messages$ = new BehaviorSubject<any[]>([]);
    private connected$ = new BehaviorSubject<boolean>(false);

    connect(): void {
        this.client = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            onConnect: () => {
                console.log("Conexión establecida");
                this.connected$.next(true);
            },
            onDisconnect: () => {
                console.log("Desconexión exitosa");
                this.connected$.next(false);
            }
        });

        this.client.activate();
    }

    disconect(): void {
        if(this.client){
            this.client.deactivate();
            this.connected$.next(false);
        }
    }

    sendMessage(message: any): void {
        if(this.client && this.client.connected){
            this.client.publish({
                destination: '/app/message',
                body: JSON.stringify(message)
            });
        } else {
               console.error("No se pudo enviar el mensaje. Websocket desconectado.");
            }
        }
    

    getMessages(): Observable<any[]>{
        return this.messages$.asObservable();
    }

    isConnected(): Observable<boolean>{
        return this.connected$.asObservable();
    }
}