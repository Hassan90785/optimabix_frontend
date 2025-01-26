import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {RestApiService} from '../../../core/services/rest-api.service';
import {MessageService} from 'primeng/api';
import {Router} from '@angular/router';
import {AdminStore} from '../../../core/stores/admin.store';
import {Button} from 'primeng/button';
import {Card} from 'primeng/card';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {Password} from 'primeng/password';
import {Toast} from 'primeng/toast';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    Button,
    Card,
    FloatLabel,
    FormsModule,
    InputText,
    ReactiveFormsModule,
    Toast
  ],
  providers: [RestApiService, MessageService],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  subscription: Subscription = new Subscription();
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: RestApiService,
    private messageService: MessageService,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  login() {
    if (this.loginForm.invalid) return;

    AdminStore.setLoader(true);
    this.subscription.add(this.apiService.login(this.loginForm.value).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        AdminStore.setLoader(false);
        this.auth.user = res.data.user
        this.router.navigate(['/app/dashboard']);
        // this.router.navigate(['/admin/companies']);
      },
      error: (error) => {
        AdminStore.setLoader(false);
        this.messageService.add({severity: 'error', summary: 'Error', detail: error.message});
        console.error('Login Failed:', error);
      }
    }));
  }
}
