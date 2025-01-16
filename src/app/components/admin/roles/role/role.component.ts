import {Component, Input, OnInit} from '@angular/core';
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
import {Role} from '../../../../core/models/Role';

@Component({
  selector: 'app-role',
  imports: [
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    MultiSelect, TextareaModule,
    Button, DatePicker,
    FloatLabel, Select, Card,
  ],
  templateUrl: './role.component.html',
  standalone: true,
  providers: [MessageService],
  styleUrl: './role.component.scss'
})
export class RoleComponent implements OnInit {
  roleForm: FormGroup;
  @Input() role: Role | undefined; // Existing role passed from parent

  constructor(
    private fb: FormBuilder,
    private apiService: RestApiService,
    private messageService: MessageService
  ) {
    // Initialize an empty form group
    this.roleForm = this.fb.group({
      roleName: ['', Validators.required],
      description: [''],
      companyAccessControl: this.fb.group({
        companyId: ['', Validators.required],
        permissions: this.fb.array([]), // Initialize empty permissions array
      }),
      accessStatus: ['', Validators.required],
      validUntil: [''],
    });
  }

  get permissions(): FormArray {
    return this.roleForm.get('companyAccessControl.permissions') as FormArray;
  }

  ngOnInit() {
    // If a role is provided, populate the form; otherwise, use default values
    if (this.role) {
      this.roleForm.patchValue({
        roleName: this.role.roleName,
        description: this.role.description || '',
        companyAccessControl: {
          companyId: this.role.companyAccessControl.companyId,
          permissions: [], // Permissions will be handled separately
        },
        accessStatus: this.role.companyAccessControl.accessStatus,
        validUntil: this.role.companyAccessControl.validUntil || '',
      });

      // Populate permissions if they exist
      if (this.role.companyAccessControl.permissions?.length) {
        const permissionsArray = this.role.companyAccessControl.permissions.map(permission =>
          this.fb.group({
            moduleId: [permission.moduleId, Validators.required],
            operationsAllowed: [permission.operationsAllowed, Validators.required],
          })
        );
        const formArray = this.fb.array(permissionsArray);
        this.roleForm.setControl('companyAccessControl.permissions', formArray);
      }
    }
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

    const payload = this.roleForm.value;

    // Call API to create or update the role
    if (this.role?.id) {
      // Update existing role
      this.apiService.updateRole(this.role.id, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Role updated successfully.',
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
      // Create a new role
      this.apiService.createRole(payload).subscribe({
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
}
