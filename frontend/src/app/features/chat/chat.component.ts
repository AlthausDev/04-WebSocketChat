import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Message } from '../../model/message';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {

  connected = false;
  readonly messages = this.chatService.messages;
  message: Message = new Message();
  typing = '';

  private readonly subscriptions = new Subscription();

  constructor(private readonly chatService: ChatService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.chatService.connected$.subscribe(connected => this.connected = connected)
    );
    this.subscriptions.add(
      this.chatService.typing$.subscribe(typing => this.typing = typing)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.chatService.disconnect();
  }

  connect(): void {
    const username = this.message.username.trim();
    if (!username) {
      return;
    }

    this.message.username = username;
    this.chatService.connect(username);
  }

  disconnect(): void {
    this.chatService.disconnect();
  }

  onSendMessage(): void {
    if (!this.message.text?.trim()) {
      return;
    }

    this.chatService.sendMessage(this.message);
    this.message.text = '';
  }

  onTypingEvent(): void {
    this.chatService.sendTyping();
  }
}
