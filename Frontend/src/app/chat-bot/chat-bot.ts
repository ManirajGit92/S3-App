import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../api';
import { SettingsService } from '../services/settings.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot.html',
  styleUrl: './chat-bot.css',
})
export class ChatBot implements OnInit {
  private api = inject(Api);
  settings = inject(SettingsService);

  isOpen = signal(false);
  isTyping = signal(false);
  messages = signal<Message[]>([]);
  userInput = signal('');
  sessionId = signal('');

  // User details collection
  showDetailsForm = signal(false);
  userName = signal('');
  userContact = signal('');
  pendingQuery = signal('');

  ngOnInit() {
    this.sessionId.set(this.getOrCreateSessionId());
    this.addBotMessage('Hello! How can I help you today?');
  }

  toggleChat() {
    this.isOpen.set(!this.isOpen());
  }

  sendMessage() {
    const msg = this.userInput().trim();
    if (!msg) return;

    this.messages.update(m => [...m, { text: msg, sender: 'user', timestamp: new Date() }]);
    this.userInput.set('');
    this.isTyping.set(true);

    this.api.sendChatMessage({
      sessionId: this.sessionId(),
      message: msg
    }).subscribe({
      next: (res: any) => {
        this.isTyping.set(false);
        this.addBotMessage(res.message);
        
        if (!res.isFAQ) {
          this.pendingQuery.set(msg);
          setTimeout(() => this.showDetailsForm.set(true), 1000);
        }
      },
      error: () => this.isTyping.set(false)
    });
  }

  submitDetails() {
    if (!this.userName() || !this.userContact()) return;

    // Store details in DB along with a follow-up message
    this.api.sendChatMessage({
      sessionId: this.sessionId(),
      message: `User Details: ${this.userName()} (${this.userContact()}). Query: ${this.pendingQuery()}`,
      userName: this.userName(),
      userContact: this.userContact()
    }).subscribe();

    const adminPhone = '+919876543210';
    const text = encodeURIComponent(`Hi Admin, I have a query.\n\nName: ${this.userName()}\nContact: ${this.userContact()}\nQuery: ${this.pendingQuery()}`);
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${text}`;
    
    this.addBotMessage(`Thank you ${this.userName()}! I've shared your query with our admin. You can also message them directly on WhatsApp:`);
    this.messages.update(m => [...m, { 
      text: `<a href="${whatsappUrl}" target="_blank" class="wa-link">Connect on WhatsApp</a>`, 
      sender: 'bot', 
      timestamp: new Date() 
    }]);

    this.showDetailsForm.set(false);
    this.userName.set('');
    this.userContact.set('');
  }

  private addBotMessage(text: string) {
    this.messages.update(m => [...m, { text, sender: 'bot', timestamp: new Date() }]);
  }

  private getOrCreateSessionId(): string {
    let id = localStorage.getItem('chat_session_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 11);
      localStorage.setItem('chat_session_id', id);
    }
    return id;
  }
}
