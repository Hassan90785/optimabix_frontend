import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-client-product',
  imports: [
    RouterOutlet
  ],
  templateUrl: './client-product.component.html',
  standalone: true,
  styleUrl: './client-product.component.scss'
})
export class ClientProductComponent {

}
