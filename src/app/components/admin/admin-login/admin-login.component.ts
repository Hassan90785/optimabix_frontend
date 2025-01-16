import {Component, OnInit} from '@angular/core';
import {Card} from 'primeng/card';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Password} from 'primeng/password';
import {Button} from 'primeng/button';
import {RestApiService} from '../../../core/services/rest-api.service';
import {Router} from '@angular/router';
import {AdminStore} from '../../../core/stores/admin.store';
import {CommonModule} from '@angular/common';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {Subscription} from 'rxjs';
import {MessageService} from 'primeng/api';
import {Toast} from 'primeng/toast';

@Component({
  selector: 'app-admin-login',
  imports: [
    CommonModule,
    Card,
    ReactiveFormsModule,
    Password,
    Button,
    FloatLabel,
    InputText,
    Toast
  ],
  providers: [RestApiService, MessageService],
  templateUrl: './admin-login.component.html',
  standalone: true,
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements OnInit {
  subscription: Subscription = new Subscription();
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: RestApiService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  loginAdmin() {
    if (this.loginForm.invalid) return;

    AdminStore.setLoader(true);
    this.subscription.add(this.apiService.loginAdmin(this.loginForm.value).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        AdminStore.setLoader(false);
        this.router.navigate(['/admin/companies']);
      },
      error: (error) => {
        AdminStore.setLoader(false);
        this.messageService.add({severity: 'error', summary: 'Error', detail: error.message});
        console.error('Login Failed:', error);
      }
    }));
  }
}
