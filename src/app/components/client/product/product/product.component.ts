import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
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
  private auth = inject(AuthService)
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
    console.log('this.auth.info()', this.auth.info);
    payload.companyId = this.auth.info?.companyId._id || null;
    payload.createdBy = this.auth.info?.id || null;
    console.log('payload', payload);
    this.subscriptions.add(
      this.apiService.saveProduct(payload).subscribe({
        next: (resp:any) => {
          console.log('resp: ', resp);
          if(resp && resp.status) {
            this.router.navigate(['/app/product/list']);
          }
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
