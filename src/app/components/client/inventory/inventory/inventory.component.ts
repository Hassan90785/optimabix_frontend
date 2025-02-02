import {ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {catchError, of, Subscription} from 'rxjs';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {AdminStore} from '../../../../core/stores/admin.store';
import {InputText} from 'primeng/inputtext';
import {Card} from 'primeng/card';
import {FloatLabel} from 'primeng/floatlabel';
import {Button} from 'primeng/button';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../../../core/services/auth.service';
import {Product} from '../../../../core/models/Product';
import {DropdownModule} from 'primeng/dropdown';
import {Entity} from '../../../../core/models/Entity';
import {ToastrService} from '../../../../core/services/toastr.service';
import {Router} from '@angular/router';
import {DatePickerModule} from 'primeng/datepicker';
import {DataStoreService} from '../../../../core/services/data-store.service';

@Component({
  selector: 'app-inventory',
  imports: [
    CommonModule,
    InputText,
    ReactiveFormsModule,
    Card,
    FloatLabel,
    Button,
    DropdownModule,
    DatePickerModule
  ],
  templateUrl: './inventory.component.html',
  standalone: true,
  providers: [ToastrService],
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit, OnDestroy {
  inventoryForm: FormGroup;
  subscriptions: Subscription = new Subscription();
  indicator: boolean = false;
  products: Product[] = [];
  vendors: Entity[] = [];
  selectedProduct: Product | undefined = {} as Product;
  private auth = inject(AuthService)
  private toastr = inject(ToastrService)
  private router = inject(Router)
  private dataStore = inject(DataStoreService)

  constructor(private fb: FormBuilder, private apiService: RestApiService, private cdr: ChangeDetectorRef) {
    this.inventoryForm = this.fb.group({
      _id: [null],
      companyId: ['', Validators.required],
      productId: ['', Validators.required],
      vendorId: ['', Validators.required],
      batches: this.fb.group({
        quantity: [0, Validators.required],
        purchasePrice: [0, Validators.required],
        totalCost: [0, Validators.required],
        barcode: [''],
        mgf_dt: [''],
        expiry_dt: [''],
        sellingPrice: [0, Validators.required]
      })
    });
  }

  ngOnInit(): void {
    this.fetchProducts()
    this.fetchVendors();
    this.valueChanges();
    this.getInventory();
  }

  getInventory() {
    this.subscriptions.add(
      this.dataStore.selectedInventory$.subscribe((product: any) => {
        console.log('selectedInventory$: ', product);
        if (product) {
          this.indicator = true;

          const batch = product.data.batches.length > 0 ? product.data.batches[0] : null;

          const mgf = batch?.mgf_dt ? new Date(batch.mgf_dt) : null;
          const expiry = batch?.expiry_dt ? new Date(batch.expiry_dt) : null;

          if (mgf) mgf.setUTCHours(0, 0, 0, 0);
          if (expiry) expiry.setUTCHours(0, 0, 0, 0);

          this.inventoryForm.patchValue({
            _id: product.data._id,
            companyId: product.data.companyId,
            productId: product.data.productId?._id,
            vendorId: product.data.vendorId?._id,
            batches: {
              quantity: batch?.quantity || 0,
              purchasePrice: batch?.purchasePrice || 0,
              totalCost: batch ? batch.purchasePrice * batch.quantity : 0,
              barcode: batch?.barcode || '',
              mgf_dt: mgf,
              expiry_dt: expiry,
              sellingPrice: batch?.sellingPrice || 0
            }
          });
        }
      })
    );
  }


  valueChanges() {
    this.subscriptions.add(this.inventoryForm.get('productId')?.valueChanges.subscribe((value) => {
      this.selectedProduct = this.products.find(item => item._id === value);
      if (this.selectedProduct) {
        this.inventoryForm.get('batches.purchasePrice')?.patchValue(this.selectedProduct.price.unitPurchasePrice, {emitEvent: false});
        this.inventoryForm.get('batches.sellingPrice')?.patchValue(this.selectedProduct.price.retailPrice, {emitEvent: false});
      }
    }));

    this.subscriptions.add(this.inventoryForm.get('batches.purchasePrice')?.valueChanges.subscribe((value) => {
      const quantity = this.inventoryForm.get('batches.quantity')?.value;
      const totalCost = value * quantity;
      this.inventoryForm.get('batches.totalCost')?.patchValue(totalCost, {emitEvent: false});
    }));
    this.subscriptions.add(this.inventoryForm.get('batches.quantity')?.valueChanges.subscribe((value) => {
      const cost = this.inventoryForm.get('batches.purchasePrice')?.value;
      const totalCost = value * cost;
      this.inventoryForm.get('batches.totalCost')?.patchValue(totalCost, {emitEvent: false});
    }));

  }


  onSubmit(): void {

    AdminStore.setLoader(true);
    const payload = this.inventoryForm.value;
    payload.companyId = this.auth.info?.companyId || null;
    payload.createdBy = this.auth.info?.id || null;
  
    this.subscriptions.add(
      this.apiService.saveInventory(payload).pipe(
        catchError((error) => {
          AdminStore.setLoader(false);
          this.toastr.showError('Error saving inventory', 'Error');
          return of(null); // Return an observable, like `null`, to complete the stream gracefully
        })
      ).subscribe((value: any) => {
        if (value && value.success) {
          AdminStore.setLoader(false);
          this.toastr.showSuccess(value.message, 'Success');
          this.router.navigate(['/app/inventory/list']);
        } else {
          this.toastr.showError(value.message, 'Error');
        }
      })
    );
  }

  fetchProducts(page: number = 1, limit: number = 1000, sort: string = 'createdAt'): void {
    AdminStore.setLoader(true);
    this.subscriptions.add(
      this.apiService.getProducts({page, limit, sort, companyId: this.auth.info.companyId}).pipe(
        catchError((error) => {
          AdminStore.setLoader(false);
          this.toastr.showError('Error fetching products', 'Error');
          return of(null); // Return an observable, like `null`, to complete the stream gracefully
        })
      ).subscribe((value: any) => {
        AdminStore.setLoader(false);
        if (value && value.success) {
          this.products = value.data.products;
        } else {
          this.toastr.showError(value.message, 'Error');
        }
      })
    );
  }

  fetchVendors(page: number = 1, limit: number = 1000, sort: string = 'createdAt'): void {
    AdminStore.setLoader(true);
    this.subscriptions.add(
      this.apiService.getEntities({page, limit, sort, companyId: this.auth.info.companyId}).pipe(
        catchError((error) => {
          AdminStore.setLoader(false);
          this.toastr.showError('Error fetching vendors', 'Error');
          return of(null); // Return an observable, like `null`, to complete the stream gracefully
        })
      ).subscribe((value: any) => {
        AdminStore.setLoader(false);
        if (value && value.success) {
          this.vendors = value.data.entities.filter((value: Entity) => (value.entityType).toLowerCase() ===
            'vendor');
        } else {
          this.toastr.showError(value.message, 'Error');
        }
      })
    );
  }

  onCancel() {
    this.dataStore.setSelectedInventory(null);
    this.router.navigate(['/app/inventory/list']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
