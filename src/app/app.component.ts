import {Component, inject, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AuthService} from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  standalone: true,
  providers: [AuthService],
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'optimabix';
  auth = inject(AuthService);
  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      this.auth.user = JSON.parse(user);
    }
  }
}
