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

  typing!: string;
  clientId!: string;

  constructor(){
    this.clientId = 'id-' + new Date().getTime() + '-' + Math.random().toString(36).substring(2);
  }

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

      this.client.subscribe('/topic/typing', event => {
        this.typing = event.body;
        setTimeout(() => this.typing = '', 3000)
      });

      console.log('clientId' + this.clientId)
      this.client.subscribe(`/topic/history/${this.clientId}`, event =>{
          const histories = JSON.parse(event.body) as Message[];
          this.messages = histories;
      });

      this.client.publish({
        destination: '/app/history', 
        body: this.clientId
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
    if (!this.message.text?.trim()) return; 
    this.message.type = 'MESSAGE';
    
    this.client.publish({
      destination: '/app/message',
      body: JSON.stringify(this.message)
    });

    this.message.text = ''; 
  }

  onTypingEvent(): void {
    this.client.publish({
      destination: '/app/typing',
      body: this.message.username
    })
  }
}
