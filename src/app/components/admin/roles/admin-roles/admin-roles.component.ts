import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-admin-roles',
  imports: [
    RouterOutlet
  ],
  templateUrl: './admin-roles.component.html',
  standalone: true,
  styleUrl: './admin-roles.component.css'
})
export class AdminRolesComponent {
}
