import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from './chat.service';
import { Message } from '../../model/message';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit {
  
  connected: boolean = false;
  messages: Message[] = [];
  message: Message = new Message();
  typing: string = '';
  typingTimeout!: ReturnType<typeof setTimeout>;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.connected = this.chatService.isConnected(); // ✅ `connected` ya no es un Observable
    this.messages = this.chatService.getMessages(); // ✅ `messages` ya no es un Observable
  }

  connect(): void {
    if (!this.message.username.trim()) {
        console.error("❌ Debes escribir un nombre de usuario antes de conectarte.");
        return;
    }

    this.chatService.connect();
    this.connected = true; // ✅ Se actualiza el estado `connected`
}


  disconnect(): void {
    this.chatService.disconnect();
    this.connected = false; // ✅ Actualiza `connected` en el componente
  }

  onSendMessage(): void {
    if (!this.message.text?.trim()) return;
    this.message.type = 'MESSAGE';
    this.chatService.sendMessage(this.message);
    this.message.text = '';
  }

  onTypingEvent(): void {
    if (!this.message.username) return;

    if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
    }

    if (!this.typing) {
        this.typing = `${this.message.username} está escribiendo...`;
        this.chatService.sendMessage({
          type: 'TYPING',
          username: this.message.username,
          date: new Date(),
          text: '',
          color: ''
        });
    }

    this.typingTimeout = setTimeout(() => {
        this.typing = ''; 
    }, 3000);
  }
}
