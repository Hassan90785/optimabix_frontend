import {Component, Input, OnInit} from '@angular/core';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {User} from '../../../../core/models/User';
import {MessageService} from 'primeng/api';
import {CommonModule} from '@angular/common';
import {DropdownModule} from 'primeng/dropdown';
import {TextareaModule} from 'primeng/textarea';
import {Button} from 'primeng/button';
import {FloatLabel} from 'primeng/floatlabel';
import {Card} from 'primeng/card';
import {InputText} from 'primeng/inputtext';

@Component({
  selector: 'app-user',
  imports: [CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    TextareaModule,
    Button,
    FloatLabel, Card, InputText,],
  templateUrl: './user.component.html',
  standalone: true,
  providers: [MessageService],
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {
  userForm: FormGroup;
  @Input() user: User | undefined;
  companies: any[] | undefined;
  roles: any[] | undefined;

  constructor(
    private fb: FormBuilder,
    private apiService: RestApiService,
    private messageService: MessageService
  ) {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      role: [null, Validators.required], // Dropdown for Role
      companyId: [null, Validators.required], // Dropdown for Company
      accessStatus: ['', Validators.required],
      accessStatusReason: [''],
      lastLogin: [''], // Display only, not editable
      createdBy: [''], // Display only, not editable
      isDeleted: [false],
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.userForm.patchValue({
        ...this.user,
      });

      // Remove password field if editing an existing user
      if (this.user._id) {
        this.userForm.removeControl('password');
      }
    }
  }

  onSubmit(): void {


    const payload = this.userForm.value;

    if (this.user?._id) {
      this.apiService.updateUser(this.user._id, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User updated successfully.',
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
          });
        },
      });
    } else {
      this.apiService.createUser(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User created successfully.',
          });
          this.userForm.reset();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
          });
        },
      });
    }
  }
}
