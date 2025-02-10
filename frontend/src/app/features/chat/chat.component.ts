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
    this.messages = this.chatService.messages; // ✅ Mensajes listos cuando el usuario se conecte
  }

  connect(): void {
    if (!this.message.username.trim()) {
        console.error("❌ Debes escribir un nombre de usuario antes de conectarte.");
        return;
    }

    this.chatService.connect();
    this.connected = true; // ✅ Se actualiza `connected` cuando el usuario presiona "Conectar"
  }

  disconnect(): void {
    this.chatService.disconnect();
    this.connected = false; // ✅ Se actualiza `connected` cuando el usuario presiona "Desconectar"
  }

  onSendMessage(): void {
    if (!this.message.text?.trim()) return; // ✅ Evita enviar mensajes vacíos

    const newMessage: Message = {
        type: 'MESSAGE',
        username: this.message.username,
        text: this.message.text,
        date: new Date(),
        color: this.message.color
    };

    this.chatService.sendMessage(newMessage); // ✅ Enviar mensaje sin modificar `messages`

    this.message.text = ''; // ✅ Limpiar input después de enviar
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
