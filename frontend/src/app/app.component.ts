import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ChatComponent } from "./features/chat/chat.component";

@Component({
  selector: 'app-root',
  imports: [ChatComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './app.component.html' 
})

export class AppComponent { 
}