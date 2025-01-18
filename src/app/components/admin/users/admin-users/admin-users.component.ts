import {Component} from '@angular/core';
import {MessageService} from 'primeng/api';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-admin-users',
  imports: [
    RouterOutlet
  ],
  templateUrl: './admin-users.component.html',
  standalone: true,
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent {
}
