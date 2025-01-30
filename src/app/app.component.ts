import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthService} from './core/services/auth.service';
import {Toast} from 'primeng/toast';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ConfirmationDialogService} from './core/services/confirmation-dialog.service';
import {ScrollTop} from 'primeng/scrolltop';
import {ProgressSpinner} from 'primeng/progressspinner';
import {AdminStore} from './core/stores/admin.store';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Toast, ConfirmDialog, ScrollTop, ProgressSpinner],
  templateUrl: './app.component.html',
  standalone: true,
  providers: [AuthService, MessageService, ConfirmationService, ConfirmationDialogService],
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'optimabix';
  auth = inject(AuthService);
  protected readonly AdminStore = AdminStore;

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      console.log('user', user);
      this.auth.user = JSON.parse(user);
    }
  }
}
