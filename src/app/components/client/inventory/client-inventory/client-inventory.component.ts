import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-client-inventory',
  imports: [
    RouterOutlet
  ],
  templateUrl: './client-inventory.component.html',
  standalone: true,
  styleUrl: './client-inventory.component.scss'
})
export class ClientInventoryComponent {

}
