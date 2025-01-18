import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {AdminStore} from '../../../../core/stores/admin.store';
import {InputText} from 'primeng/inputtext';
import {FloatLabel} from 'primeng/floatlabel';
import {Button} from 'primeng/button';
import {Checkbox} from 'primeng/checkbox';
import {Card} from 'primeng/card';

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
  templateUrl: './product.component.html',
  standalone: true,
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  subscriptions: Subscription = new Subscription();

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
    if (this.productForm.invalid) return;

    AdminStore.setLoader(true);
    const payload = this.productForm.value;

    this.subscriptions.add(
      this.apiService.saveProduct(payload).subscribe({
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
