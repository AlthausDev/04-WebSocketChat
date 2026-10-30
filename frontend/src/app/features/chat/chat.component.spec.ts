import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ChatComponent } from './chat.component';
import { ChatService } from './chat.service';
import { Message } from '../../model/message';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let service: {
    connect: jasmine.Spy;
    disconnect: jasmine.Spy;
    sendMessage: jasmine.Spy;
    sendTyping: jasmine.Spy;
  };

  beforeEach(async () => {
    service = {
      connect: jasmine.createSpy('connect'),
      disconnect: jasmine.createSpy('disconnect'),
      sendMessage: jasmine.createSpy('sendMessage'),
      sendTyping: jasmine.createSpy('sendTyping')
    };

    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [{
        provide: ChatService,
        useValue: {
          ...service,
          connected: signal(false).asReadonly(),
          messages: signal<Message[]>([]).asReadonly(),
          typing: signal('').asReadonly()
        }
      }]
    }).compileComponents();

    component = TestBed.createComponent(ChatComponent).componentInstance;
  });

  it('ignores an empty username', () => {
    component.username = '   ';
    component.connect();
    expect(service.connect).not.toHaveBeenCalled();
  });

  it('trims the username before connecting', () => {
    component.username = '  Alice  ';
    component.connect();
    expect(component.username).toBe('Alice');
    expect(service.connect).toHaveBeenCalledOnceWith('Alice');
  });

  it('does not send empty messages', () => {
    component.text = '  ';
    component.onSendMessage();
    expect(service.sendMessage).not.toHaveBeenCalled();
  });

  it('sends a trimmed message and clears the input', () => {
    component.text = '  Hola  ';
    component.onSendMessage();
    expect(service.sendMessage).toHaveBeenCalledOnceWith('Hola');
    expect(component.text).toBe('');
  });

  it('only signals typing when the input has text', () => {
    component.text = ' ';
    component.onTypingEvent();
    expect(service.sendTyping).not.toHaveBeenCalled();

    component.text = ' hola ';
    component.onTypingEvent();
    expect(service.sendTyping).toHaveBeenCalledTimes(1);
  });

  it('disconnects on demand and on destruction', () => {
    component.disconnect();
    component.ngOnDestroy();
    expect(service.disconnect).toHaveBeenCalledTimes(2);
  });
});
