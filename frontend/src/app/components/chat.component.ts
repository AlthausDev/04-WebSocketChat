import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit{
  
  client!: Stomp.Client;
  connected: boolean = false;

  ngOnInit(): void {
    this.client = new Stomp.Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS('http//:localhost:8080/chat'),
      debug: str => console.log(str),
      reconnectDelay: 5000
    });

    this.client.onConnect = (frame) => {
      this.connected = true;
      console.log(`Conectados: ${this.client.connected} : ${frame}`)
    }

    this.client.onDisconnect = (frame) => {
      this.connected = false;
      console.log(`Desconectados: ${this.client.connected} : ${frame}`)    
    }

    this.client.activate();
 }
} 
