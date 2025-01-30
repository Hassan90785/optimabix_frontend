import {Component, inject} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {Button} from 'primeng/button';
import {Toolbar} from 'primeng/toolbar';
import {CommonModule} from '@angular/common';
import {DrawerComponent} from '../../../shared/components/drawer/drawer.component';
import {AuthService} from '../../../core/services/auth.service';
import {ThemeService} from '../../../core/services/theme.service';

@Component({
  selector: 'app-client-home',
  imports: [
    CommonModule,
    RouterOutlet,
    Button,
    Toolbar,
    DrawerComponent
  ],
  templateUrl: './client-home.component.html',
  providers: [AuthService],
  standalone: true,
  styleUrl: './client-home.component.scss'
})
export class ClientHomeComponent {
  visibleSidebar1: boolean = false;
  themeService = inject(ThemeService);
  menuItems = [
    {label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/app/dashboard']},
    {label: 'Product', icon: 'pi pi-box', routerLink: ['/app/product']}, // Represents products or items
    {label: 'Entity', icon: 'pi pi-id-card', routerLink: ['/app/entity']}, // Represents users or entities
    {label: 'Inventory', icon: 'pi pi-warehouse', routerLink: ['/app/inventory']}, // Represents a warehouse or inventory
    {label: 'POS', icon: 'pi pi-shopping-cart', routerLink: ['/app/pos']}, // Represents a shopping cart for POS
    {label: 'Ledger', icon: 'pi pi-book', routerLink: ['/app/ledger']}, // Represents a ledger or accounting book
    {label: 'Sales', icon: 'pi pi-book', routerLink: ['/app/sales']}, // Represents a ledger or accounting book
  ];

  constructor(private router: Router, public auth: AuthService) {
  }

  shouldShowHeader(): boolean {
    // Hide header on login route
    return this.router.url !== '/app/login';
  }

  toggleSidebar(): void {
    this.visibleSidebar1 = !this.visibleSidebar1;
  }

  closeHandler() {
    console.log('closeHandler')
    this.visibleSidebar1 = false
  }
}
