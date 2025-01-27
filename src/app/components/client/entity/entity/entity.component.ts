import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {catchError, of, Subscription} from 'rxjs';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {AdminStore} from '../../../../core/stores/admin.store';
import {InputText} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {FloatLabel} from 'primeng/floatlabel';
import {Button} from 'primeng/button';
import {Card} from 'primeng/card';
import {AuthService} from '../../../../core/services/auth.service';
import {ToastrService} from '../../../../core/services/toastr.service';
import {Router} from '@angular/router';

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
  providers: [ToastrService],
  templateUrl: './entity.component.html',
  standalone: true,
  styleUrl: './entity.component.scss'
})
export class EntityComponent implements OnInit, OnDestroy {
  entityForm: FormGroup;
  subscriptions: Subscription = new Subscription();
  private auth = inject(AuthService)
  private toastr = inject(ToastrService)
  private router = inject(Router)

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


  onSubmit(): void {

    AdminStore.setLoader(true);
    const payload = this.entityForm.value;
    console.log('this.auth.info()', this.auth.info);
    payload.companyId = this.auth.info?.companyId || null;
    payload.createdBy = this.auth.info?.id || null;

    this.subscriptions.add(
      this.apiService.saveEntity(payload).pipe(
        catchError((error) => {
          AdminStore.setLoader(false);
          this.toastr.showError('Error saving entity', 'Error');
          return of(null); // Return an observable, like `null`, to complete the stream gracefully
        })
      ).subscribe((value: any) => {
        if (value && value.success) {
          AdminStore.setLoader(false);
          this.toastr.showSuccess(value.message, 'Success');
          this.router.navigate(['/app/entity/list']);
        } else {
          this.toastr.showError(value.message, 'Error');
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
