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
    this.messages = this.chatService.messages; // ✅ Carga el historial y mensajes en tiempo real
  }

  connect(): void {
    if (!this.message.username.trim()) {
        console.error("❌ Debes escribir un nombre de usuario antes de conectarte.");
        return;
    }

    this.chatService.connect(this.message.username);
    this.connected = true;
  }

  disconnect(): void {
    this.chatService.disconnect();
    this.connected = false;
  }

  onSendMessage(): void {
    if (!this.message.text?.trim()) return;

    const newMessage: Message = {
        type: 'MESSAGE',
        username: this.message.username,
        text: this.message.text,
        date: new Date(),
        color: this.chatService.userColors.get(this.message.username) || "black"
    };

    this.chatService.sendMessage(newMessage);
    this.message.text = ''; // ✅ Limpia el input después de enviar
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
