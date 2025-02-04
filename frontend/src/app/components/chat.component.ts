import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as Stomp from '@stomp/stompjs';
import { Message } from '../model/message';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit {
  
  client!: Stomp.Client;
  connected: boolean = false;

  messages: Message[] = [];
  message: Message = new Message();

  ngOnInit(): void {
    this.client = new Stomp.Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS('http://localhost:8080/chat'),
      debug: (str) => console.log(str),
      reconnectDelay: 5000
    });

    this.client.onConnect = (frame) => {
      this.connected = true;
      console.log(`Conectados: ${this.client.connected} : ${frame}`);

      this.client.subscribe('/topic/message', (e) => {
        console.log(e.body);
        let receivedMessage: Message = JSON.parse(e.body) as Message;
        receivedMessage.date = new Date(receivedMessage.date);
        this.messages.push(receivedMessage);

        // Si el usuario recién conectado aún no tiene color, asignarlo
        if (
          this.message.username === receivedMessage.username &&
          !this.message.color &&
          receivedMessage.type === 'NEW_USER'
        ) {
          this.message.color = receivedMessage.color;
        }
      });

      this.message.type = 'NEW_USER';
      this.client.publish({
        destination: '/app/message',
        body: JSON.stringify(this.message)
      });
    };

    this.client.onDisconnect = (frame) => {
      this.connected = false;
      this.message = new Message();
      this.messages = [];
      console.log(`Desconectados: ${!this.client.connected} : ${frame}`);
    };
  }

  connect(): void {
    this.client.activate();
  }

  disconnect(): void {
    this.client.deactivate();
  }

  onSendMessage(): void {    
    if (!this.message.text?.trim()) return; // Evita mensajes vacíos
    this.message.type = 'MESSAGE';
    
    this.client.publish({
      destination: '/app/message',
      body: JSON.stringify(this.message)
    });

    this.message.text = ''; // Limpiar el campo de texto
  }
}
