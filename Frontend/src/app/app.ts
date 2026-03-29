import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeader } from './site-header/site-header';
import { ChatBot } from './chat-bot/chat-bot';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, SiteHeader, ChatBot],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'S2 Digital Solutions';
}
