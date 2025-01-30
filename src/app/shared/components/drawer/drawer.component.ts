import {Component, EventEmitter, inject, Input, Output, ViewChild} from '@angular/core';
import {Drawer} from 'primeng/drawer';
import {Button, ButtonDirective} from 'primeng/button';
import {Ripple} from 'primeng/ripple';
import {Avatar} from 'primeng/avatar';
import {CommonModule} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {Divider} from 'primeng/divider';
import {ConfirmationDialogService} from '../../../core/services/confirmation-dialog.service';
import {AuthService} from '../../../core/services/auth.service';
import {ScrollTopModule} from 'primeng/scrolltop';

@Component({
  selector: 'app-drawer',
  imports: [
    CommonModule,
    Drawer,
    Button,
    Ripple,
    Avatar,
    RouterLink,
    RouterLinkActive,
    Divider
  ],
  templateUrl: './drawer.component.html',
  standalone: true,
  styleUrl: './drawer.component.scss'
})
export class DrawerComponent {
  @ViewChild('drawerRef') drawerRef!: Drawer;
  @Input() visible: boolean = false;
  @Input() menuItems: any[] = []
  @Output() eventEmitter: EventEmitter<boolean> = new EventEmitter()
  confirmDialog = inject(ConfirmationDialogService)
  router = inject(Router)
  constructor(public auth: AuthService) {
  }
  onClose() {
    console.log('closed')
    this.eventEmitter.emit(false)
  }

  logoutHandler() {
    console.log('logoutHandler')
    this.confirmDialog.confirm(
      'Confirmation',
      'Are you sure you want to logout?',
      () => {
        this.eventEmitter.emit(false)
        console.log('Logging out');
        this.router.navigate(['/app/login']);
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      },
      () => {
        console.log('Cancel logout');
      }
    );
  }
}
