import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {DropdownModule} from 'primeng/dropdown';
import {InputText} from 'primeng/inputtext';
import {MultiSelect} from 'primeng/multiselect';
import {Button, ButtonDirective} from 'primeng/button';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {TextareaModule} from 'primeng/textarea';
import {FloatLabel} from 'primeng/floatlabel';
import {CommonModule} from '@angular/common';
import {Select} from 'primeng/select';
import {DatePicker} from 'primeng/datepicker';
import {Card} from 'primeng/card';
import {Fluid} from 'primeng/fluid';

@Component({
  selector: 'app-role',
  imports: [
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    InputText,
    MultiSelect, TextareaModule,
    ButtonDirective,
    Button, DatePicker,
    FloatLabel, Select, Card, Fluid
  ],
  templateUrl: './role.component.html',
  standalone: true,
  providers: [MessageService],
  styleUrl: './role.component.scss'
})
export class RoleComponent implements OnInit {
  roleForm: FormGroup;
  statusOptions: any[] | undefined;
  operationOptions: any[] | undefined;

  constructor(
    private fb: FormBuilder,
    private apiService: RestApiService,
    private messageService: MessageService
  ) {
    this.roleForm = this.fb.group({
      roleName: ['', Validators.required],
      description: [''],
      companyId: ['', Validators.required],
      permissions: this.fb.array([]), // Initialize the form array
      accessStatus: ['', Validators.required],
      validUntil: [''],
    });
  }

  get permissions(): FormArray {
    return this.roleForm.get('companyAccessControl.permissions') as FormArray;
  }

  ngOnInit() {
  }

  createPermissionGroup(): FormGroup {
    return this.fb.group({
      moduleId: ['', Validators.required],
      operationsAllowed: [[], Validators.required],
    });
  }

  addPermission(): void {
    this.permissions.push(this.createPermissionGroup());
  }

  removePermission(index: number): void {
    this.permissions.removeAt(index);
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly.',
      });
      return;
    }

    this.apiService.createRole(this.roleForm.value).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Role created successfully.',
        });
        this.roleForm.reset();
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
