import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {PanelMenu} from 'primeng/panelmenu';
import {Menubar} from 'primeng/menubar';
import {Toolbar} from 'primeng/toolbar';
import {Button} from 'primeng/button';
import {Sidebar} from 'primeng/sidebar';
import {Menu} from 'primeng/menu';

@Component({
  selector: 'app-admin',
  imports: [
    RouterOutlet,
    Toolbar,
    Button,
    Sidebar,
    Menu
  ],
  templateUrl: './admin.component.html',
  standalone: true,
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  visibleSidebar1: boolean = false;

  menuItems = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/admin/dashboard'] },
    { label: 'Users', icon: 'pi pi-users', routerLink: ['/admin/users'] },
    { label: 'Roles', icon: 'pi pi-lock', routerLink: ['/admin/roles'] },
    { label: 'Companies', icon: 'pi pi-cog', routerLink: ['/admin/companies'] },
    { label: 'Modules', icon: 'pi pi-cog', routerLink: ['/admin/modules'] },
  ];

  toggleSidebar(): void {
    this.visibleSidebar1 = !this.visibleSidebar1;
  }
}
