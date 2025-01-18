import {ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
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

@Component({
  selector: 'app-inventory',
  imports: [
    CommonModule,
    InputText,
    ReactiveFormsModule,
    Card,
    FloatLabel,
    Button,
    DropdownModule
  ],
  templateUrl: './inventory.component.html',
  standalone: true,
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit, OnDestroy {
  inventoryForm: FormGroup;
  subscriptions: Subscription = new Subscription();
  auth = inject(AuthService);
  products: Product[] = [];
  vendors: Entity[] = [];
  selectedProduct: Product | undefined = {} as Product;

  constructor(private fb: FormBuilder, private apiService: RestApiService, private cdr: ChangeDetectorRef) {
    this.inventoryForm = this.fb.group({
      companyId: ['', Validators.required],
      productId: ['', Validators.required],
      vendorId: ['', Validators.required],
      barcode: ['', Validators.required],
      batches: this.fb.group({
        quantity: [0, Validators.required],
        purchasePrice: [0, Validators.required],
        totalCost: [0, Validators.required],
        sellingPrice: [0, Validators.required]
      })
    });
  }

  ngOnInit(): void {
    this.fetchProducts()
    this.fetchVendors();
    this.valueChanges();
  }

  valueChanges() {
    this.inventoryForm.get('productId')?.valueChanges.subscribe((value) => {
      this.selectedProduct = this.products.find(item => item._id === value);
      if(this.selectedProduct){
        this.inventoryForm.get('batches.purchasePrice')?.patchValue(this.selectedProduct.price.unitPurchasePrice,{emitEvent: false});
        this.inventoryForm.get('batches.sellingPrice')?.patchValue(this.selectedProduct.price.retailPrice,{emitEvent: false});
      }
      console.log(`Product ID changed to:`, value);
      console.log(`Selected Product:`, this.selectedProduct);
    });

    this.inventoryForm.get('batches.purchasePrice')?.valueChanges.subscribe((value) => {
      const quantity = this.inventoryForm.get('batches.quantity')?.value;
      const totalCost = value * quantity;
      this.inventoryForm.get('batches.totalCost')?.patchValue(totalCost,{emitEvent: false});
    });
    this.inventoryForm.get('batches.quantity')?.valueChanges.subscribe((value) => {
      const cost = this.inventoryForm.get('batches.purchasePrice')?.value;
      const totalCost = value * cost;
      this.inventoryForm.get('batches.totalCost')?.patchValue(totalCost,{emitEvent: false});
    });

  }


  onSubmit(): void {

    AdminStore.setLoader(true);
    const payload = this.inventoryForm.value;
    payload.companyId = this.auth.info?.companyId || null;
    payload.createdBy = this.auth.info?.id || null;
    this.subscriptions.add(
      this.apiService.saveInventory(payload).subscribe({
        next: () => {
          AdminStore.setLoader(false);
        },
        error: () => {
          AdminStore.setLoader(false);
        }
      })
    );
  }

  fetchProducts(page: number = 1, limit: number = 1000, sort: string = 'createdAt'): void {
    AdminStore.setLoader(true);
    this.subscriptions.add(
      this.apiService.getProducts({page, limit, sort, companyId: this.auth.info.companyId}).subscribe({
        next: (response: any) => {
          this.products = response.data.products;
          AdminStore.setLoader(false);
        },
        error: () => {
          AdminStore.setLoader(false);
        }
      })
    );
  }

  fetchVendors(page: number = 1, limit: number = 1000, sort: string = 'createdAt'): void {
    AdminStore.setLoader(true);
    this.subscriptions.add(
      this.apiService.getEntities({page, limit, sort, companyId: this.auth.info.companyId}).subscribe({
        next: (response: any) => {
          this.vendors = response.data.entities.filter((value: Entity) => (value.entityType).toLowerCase() ===
            'vendor');
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
