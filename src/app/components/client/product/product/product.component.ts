import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {catchError, of, Subscription} from 'rxjs';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {AdminStore} from '../../../../core/stores/admin.store';
import {InputText} from 'primeng/inputtext';
import {FloatLabel} from 'primeng/floatlabel';
import {Button} from 'primeng/button';
import {Checkbox} from 'primeng/checkbox';
import {Card} from 'primeng/card';
import {Product} from '../../../../core/models/Product';
import {AuthService} from '../../../../core/services/auth.service';
import {Router} from '@angular/router';
import {ToastrService} from '../../../../core/services/toastr.service';

@Component({
  selector: 'app-product',
  imports: [
    ReactiveFormsModule,
    InputText,
    FloatLabel,
    Button,
    Checkbox,
    Card
  ],
  providers: [ToastrService],
  templateUrl: './product.component.html',
  standalone: true,
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  subscriptions: Subscription = new Subscription();
  private auth = inject(AuthService)
  private toastr = inject(ToastrService)
  private router = inject(Router)

  constructor(
    private fb: FormBuilder,
    private apiService: RestApiService,
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      sku: [''],
      description: [''],
      category: [''],
      brandName: [''],
      modelNumber: [''],
      price: this.fb.group({
        unitPurchasePrice: [0, Validators.required],
        retailPrice: [0, Validators.required],
        taxInclusive: [false],
        taxPercentage: [0],
        discountPercentage: [0]
      }),
      soldPrice: [null],
      soldDate: [null],
      vendorId: [''],
      companyId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load product data if editing
  }

  onSubmit(): void {

    AdminStore.setLoader(true);
    const payload: Product = this.productForm.value;
    payload.companyId = this.auth.info.companyId;
    payload.createdBy = this.auth.info.id;
    this.subscriptions.add(
      this.apiService.saveProduct(payload).pipe(
        catchError((error) => {
          AdminStore.setLoader(false);
          this.toastr.showError('Error saving entity', 'Error');
          return of(null); // Return an observable, like `null`, to complete the stream gracefully
        })
      ).subscribe((value: any) => {
        if (value && value.success) {
          AdminStore.setLoader(false);
          this.toastr.showSuccess(value.message, 'Success');
          this.router.navigate(['/app/product/list']);
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
