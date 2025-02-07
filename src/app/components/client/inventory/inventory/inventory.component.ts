import {ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormArray, Validators} from '@angular/forms';
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
import {AutoComplete} from 'primeng/autocomplete';

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
    DatePickerModule,
    AutoComplete
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
  filteredProducts: any[] = [];
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
      batches: this.fb.array([]) // Change to FormArray instead of FormGroup
    });
  }

  get batchesFormArray() {
    return this.inventoryForm.get('batches') as UntypedFormArray;
  }
  ngOnInit(): void {
    this.fetchProducts()
    this.fetchVendors();
    this.valueChanges();
    this.getInventory();
  }
  private createBatchFormGroup(batch: any = {}): FormGroup {
    return this.fb.group({
      quantity: [batch.quantity || 0, Validators.required],
      purchasePrice: [batch.purchasePrice || 0, Validators.required],
      totalCost: [batch.quantity && batch.purchasePrice ? batch.quantity * batch.purchasePrice : 0, Validators.required],
      barcode: [batch.barcode || ''],
      mgf_dt: [batch.mgf_dt ? new Date(batch.mgf_dt) : null],
      expiry_dt: [batch.expiry_dt ? new Date(batch.expiry_dt) : null],
      sellingPrice: [batch.sellingPrice || 0, Validators.required]
    });
  }

  getInventory() {
    this.subscriptions.add(
      this.dataStore.selectedInventory$.subscribe((product: any) => {
        if (product) {
          this.indicator = true;
          this.inventoryForm.patchValue({
            _id: product.data._id,
            companyId: product.data.companyId,
            productId: product.data.productId,
            vendorId: product.data.vendorId?._id
          });

          // Clear the existing FormArray before adding new batches
          this.batchesFormArray.clear();

          // Add each batch dynamically
          if (product.data.batches?.length > 0) {
            product.data.batches.forEach((batch: any) => {
              this.batchesFormArray.push(this.createBatchFormGroup(batch));
            });
          }
        }
      })
    );
  }



  valueChanges() {
    // Update purchase and selling prices when a product is selected
    this.subscriptions.add(
      this.inventoryForm.get('productId')?.valueChanges.subscribe((value) => {
        if (value) {
          this.selectedProduct = this.products.find((item) => item._id === value);
          if (this.selectedProduct) {
            // Update all batch purchase & selling prices
            this.batchesFormArray.controls.forEach((batchGroup) => {
              batchGroup.get('purchasePrice')?.patchValue(this.selectedProduct?.price?.unitPurchasePrice || 0, { emitEvent: false });
              batchGroup.get('sellingPrice')?.patchValue(this.selectedProduct?.price?.retailPrice || 0, { emitEvent: false });
            });
          }
        }
      })
    );

    // Subscribe to changes in batches (purchase price, quantity)
    this.subscriptions.add(
      this.batchesFormArray.valueChanges.subscribe(() => {
        this.batchesFormArray.controls.forEach((batchGroup) => {
          const quantity = batchGroup.get('quantity')?.value || 0;
          const purchasePrice = batchGroup.get('purchasePrice')?.value || 0;
          const totalCost = quantity * purchasePrice;
          batchGroup.get('totalCost')?.patchValue(totalCost, { emitEvent: false });
        });
      })
    );
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
          this.products.sort((a, b) => {
            const nameA = a.productName?.toLowerCase() || ''; // Handle null/undefined
            const nameB = b.productName?.toLowerCase() || '';

            return nameA.localeCompare(nameB);
          });

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
          if(this.vendors && this.vendors.length === 1){
            this.inventoryForm.get('vendorId')?.patchValue(this.vendors[0]._id);
          }
        } else {
          this.toastr.showError(value.message, 'Error');
        }
      })
    );
  }
  filterProducts(event: any): void {
    const query = event.query.toLowerCase();
    this.filteredProducts = this.products.filter((product:any) => {
      return   product.productName.toLowerCase().includes(query)
      }
    );
  }

  onCancel() {
    this.dataStore.setSelectedInventory(null);
    this.router.navigate(['/app/inventory/list']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  addBatch() {
    this.batchesFormArray.push(this.createBatchFormGroup());
  }

  removeBatch(index: number) {
    this.batchesFormArray.removeAt(index);
  }

}
