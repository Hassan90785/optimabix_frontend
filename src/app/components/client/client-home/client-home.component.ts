import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Button} from 'primeng/button';
import {Menu} from 'primeng/menu';
import {Sidebar} from 'primeng/sidebar';
import {Toolbar} from 'primeng/toolbar';

@Component({
  selector: 'app-client-home',
  imports: [
    RouterOutlet,
    Button,
    Menu,
    Sidebar,
    Toolbar
  ],
  templateUrl: './client-home.component.html',
  standalone: true,
  styleUrl: './client-home.component.scss'
})
export class ClientHomeComponent {
  visibleSidebar1: boolean = false;

  menuItems = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/app/dashboard'] },
    { label: 'Product', icon: 'pi pi-users', routerLink: ['/app/product'] },
    { label: 'Entity', icon: 'pi pi-lock', routerLink: ['/app/entity'] },
    { label: 'Inventory', icon: 'pi pi-cog', routerLink: ['/app/inventory'] },
    { label: 'POS', icon: 'pi pi-cog', routerLink: ['/app/pos'] },
  ];

  toggleSidebar(): void {
    this.visibleSidebar1 = !this.visibleSidebar1;
  }
}
