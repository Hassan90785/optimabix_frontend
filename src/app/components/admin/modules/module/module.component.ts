import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Module} from '../../../../core/models/Module';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {MessageService} from 'primeng/api';
import {DropdownModule} from 'primeng/dropdown';
import {Button} from 'primeng/button';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {TextareaModule} from 'primeng/textarea';
import {Card} from 'primeng/card';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-module',
  imports: [
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    Button,TextareaModule,
    FloatLabel,
    InputText,Card
  ],
  templateUrl: './module.component.html',
  standalone: true,
  providers: [MessageService],
  styleUrl: './module.component.scss'
})
export class ModuleComponent implements OnInit {
  moduleForm: FormGroup;
  @Input() module: Module | undefined;

  constructor(
    private fb: FormBuilder,
    private apiService: RestApiService,
    private messageService: MessageService
  ) {
    this.moduleForm = this.fb.group({
      moduleName: ['', Validators.required],
      description: [''],
      icon: [''],
      operations: this.fb.array([]),
      accessStatus: ['', Validators.required],
    });
  }

  get operations(): FormArray {
    return this.moduleForm.get('operations') as FormArray;
  }

  ngOnInit(): void {
    if (this.module) {
      this.moduleForm.patchValue({
        ...this.module,
      });

      if (this.module.operations?.length) {
        const operationsArray = this.module.operations.map((operation) =>
          this.fb.group({
            name: [operation.name, Validators.required],
            isEnabled: [operation.isEnabled],
            routePath: [operation.routePath],
          })
        );
        this.moduleForm.setControl('operations', this.fb.array(operationsArray));
      }
    }
  }

  createOperation(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      isEnabled: [true],
      routePath: [''],
    });
  }

  addOperation(): void {
    this.operations.push(this.createOperation());
  }

  removeOperation(index: number): void {
    this.operations.removeAt(index);
  }

  onSubmit(): void {
    if (this.moduleForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly.',
      });
      return;
    }

    const payload = this.moduleForm.value;

    if (this.module?.id) {
      this.apiService.updateModule(this.module.id, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Module updated successfully.',
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
      this.apiService.createModule(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Module created successfully.',
          });
          this.moduleForm.reset();
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
