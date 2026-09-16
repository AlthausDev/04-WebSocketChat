import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnDestroy {

  private readonly chatService = inject(ChatService);

  readonly connected = this.chatService.connected;
  readonly messages = this.chatService.messages;
  readonly typing = this.chatService.typing;

  username = '';
  text = '';

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }

  connect(): void {
    const username = this.username.trim();
    if (!username) {
      return;
    }

    this.username = username;
    this.chatService.connect(username);
  }

  disconnect(): void {
    this.chatService.disconnect();
  }

  onSendMessage(): void {
    const text = this.text.trim();
    if (!text) {
      return;
    }

    this.chatService.sendMessage(text);
    this.text = '';
  }

  onTypingEvent(): void {
    if (this.text.trim()) {
      this.chatService.sendTyping();
    }
  }
}
