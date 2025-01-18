import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {AdminStore} from '../../../../core/stores/admin.store';
import {InputText} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {FloatLabel} from 'primeng/floatlabel';
import {Button} from 'primeng/button';
import {Card} from 'primeng/card';
import {Product} from '../../../../core/models/Product';
import {AuthService} from '../../../../core/services/auth.service';

@Component({
  selector: 'app-entity',
  imports: [
    InputText,
    ReactiveFormsModule,
    DropdownModule,
    FloatLabel,
    Button,
    Card
  ],
  templateUrl: './entity.component.html',
  standalone: true,
  styleUrl: './entity.component.scss'
})
export class EntityComponent  implements OnInit, OnDestroy {
  entityForm: FormGroup;
  subscriptions: Subscription = new Subscription();
  private auth = inject(AuthService)

  constructor(private fb: FormBuilder, private apiService: RestApiService) {
    this.entityForm = this.fb.group({
      companyId: ['', Validators.required],
      entityType: ['', Validators.required],
      entityName: ['', Validators.required],
      contactPerson: this.fb.group({
        fullName: [''],
        email: [''],
        phone: ['']
      }),
      billingAddress: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        postalCode: [''],
        country: ['']
      }),
      shippingAddress: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        postalCode: [''],
        country: ['']
      }),
      taxInformation: this.fb.group({
        taxId: [''],
        taxExempt: [false]
      }),
      accessStatus: ['Active', Validators.required],
      paymentHistory: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Load entity data if editing
  }

  get paymentHistory(): FormArray {
    return this.entityForm.get('paymentHistory') as FormArray;
  }

  addPayment(): void {
    this.paymentHistory.push(
      this.fb.group({
        invoiceId: [''],
        amountPaid: [0, Validators.required],
        paymentDate: ['']
      })
    );
  }

  removePayment(index: number): void {
    this.paymentHistory.removeAt(index);
  }

  onSubmit(): void {

    AdminStore.setLoader(true);
    const payload = this.entityForm.value;
    console.log('this.auth.info()', this.auth.info);
    payload.companyId = this.auth.info?.companyId || null;
    payload.createdBy = this.auth.info?.id || null;
    this.subscriptions.add(
      this.apiService.saveEntity(payload).subscribe({
        next: () => {
          AdminStore.setLoader(false);
        },
        error: () => {
          AdminStore.setLoader(false);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
