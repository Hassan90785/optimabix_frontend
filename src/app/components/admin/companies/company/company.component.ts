import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Company} from '../../../../core/models/Company';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {MessageService} from 'primeng/api';
import {Button} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {CommonModule} from '@angular/common';
import {TextareaModule} from 'primeng/textarea';
import {FloatLabel} from 'primeng/floatlabel';
import {Card} from 'primeng/card';
import {InputText} from 'primeng/inputtext';

@Component({
  selector: 'app-company',
  imports: [
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    TextareaModule,
    Button,
    FloatLabel, Card, InputText,
  ],
  templateUrl: './company.component.html',
  providers: [MessageService],
  standalone: true,
  styleUrl: './company.component.scss'
})
export class CompanyComponent implements OnInit {

  companyForm: FormGroup;
  @Input() company: Company | undefined;

  constructor(
    private fb: FormBuilder,
    private apiService: RestApiService,
    private messageService: MessageService
  ) {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      registrationNumber: [''],
      businessType: ['', Validators.required],
      contactDetails: this.fb.group({
        email: ['', [Validators.email]],
        phone: [''],
        address: this.fb.group({
          street: [''],
          city: [''],
          state: [''],
          country: [''],
          postalCode: [''],
        }),
      }),
      logo: [''],
      accessStatus: ['', Validators.required],
      suspendedReason: [''],
      revokedReason: [''],
      paymentHistory: this.fb.array([]),
      nextPaymentDue: [''],
      gracePeriod: [null],
      isDeleted: [false],
      createdBy: ['', Validators.required],
      updatedBy: [''],
      deletedBy: [''],
    });
  }

  get paymentHistory(): FormArray {
    return this.companyForm.get('paymentHistory') as FormArray;
  }

  ngOnInit(): void {
    if (this.company) {
      this.companyForm.patchValue({
        ...this.company,
        contactDetails: {
          ...this.company.contactDetails,
          address: {...this.company.contactDetails?.address},
        },
      });

      if (this.company.paymentHistory?.length) {
        const paymentArray = this.company.paymentHistory.map((payment) =>
          this.fb.group({
            date: [payment.date, Validators.required],
            amount: [payment.amount, [Validators.required, Validators.min(0)]],
            paymentMethod: [payment.paymentMethod, Validators.required],
          })
        );
        this.companyForm.setControl('paymentHistory', this.fb.array(paymentArray));
      }
    }
  }

  createPayment(): FormGroup {
    return this.fb.group({
      date: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      paymentMethod: ['', Validators.required],
    });
  }

  addPayment(): void {
    this.paymentHistory.push(this.createPayment());
  }

  removePayment(index: number): void {
    this.paymentHistory.removeAt(index);
  }

  onSubmit(): void {
    console.log('payload: ', this.companyForm.value)
    console.log('invalid: ', this.companyForm.invalid)


    const payload = this.companyForm.value;

    if (this.company?.id) {
      this.apiService.updateCompany(this.company.id, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Company updated successfully.',
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
      this.apiService.createCompany(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Company created successfully.',
          });
          this.companyForm.reset();
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
