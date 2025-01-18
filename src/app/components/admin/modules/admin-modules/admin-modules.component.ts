import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-admin-modules',
  imports: [
    RouterOutlet
  ],
  templateUrl: './admin-modules.component.html',
  standalone: true,
  styleUrl: './admin-modules.component.scss'
})
export class AdminModulesComponent {

}
