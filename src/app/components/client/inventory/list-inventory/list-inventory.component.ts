import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {AdminStore} from '../../../../core/stores/admin.store';
import {Subscription} from 'rxjs';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {PrimeTemplate} from 'primeng/api';
import {TableModule} from 'primeng/table';
import {Button} from 'primeng/button';
import {Card} from 'primeng/card';
import {AuthService} from '../../../../core/services/auth.service';
import {Router} from '@angular/router';
import {BarcodeDirective} from '../../../../shared/directives/barcode.directive';
import {Ripple} from 'primeng/ripple';
import {DatePipe} from '@angular/common';
import {ToastrService} from '../../../../core/services/toastr.service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-list-inventory',
  imports: [
    PrimeTemplate,
    TableModule,
    Button,
    Card,
    BarcodeDirective,
    Ripple,
    DatePipe,
  ],
  providers: [ToastrService],
  templateUrl: './list-inventory.component.html',
  standalone: true,
  styleUrl: './list-inventory.component.scss'
})
export class ListInventoryComponent implements OnInit, OnDestroy {
  inventories: any[] = [];
  totalRecords: number = 0;
  subscriptions: Subscription = new Subscription();
  auth = inject(AuthService);
  router = inject(Router);
  expandedRows = {};
  private toastr = inject(ToastrService)

  constructor(private apiService: RestApiService) {
  }

  ngOnInit(): void {
    this.fetchInventories();
  }

  fetchInventories(page: number = 1, limit: number = 10, sort: string = 'createdBy'): void {
    AdminStore.setLoader(true);
    this.subscriptions.add(
      this.apiService.getInventories({page, limit, sort, companyId: this.auth.info.companyId}).subscribe({
        next: (response: any) => {
          this.inventories = response.data.inventoryItems;
          this.totalRecords = response.data.totalRecords;
          AdminStore.setLoader(false);
        },
        error: () => {
          AdminStore.setLoader(false);
        }
      })
    );
  }

  onEdit(inventory: any): void {
    // Navigate to CRUD form for editing
  }

  onAdd(): void {
    this.router.navigate(['/app/inventory/add']);
  }

  onDelete(inventory: any): void {
    // Call delete inventory API
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  expandAll() {
    this.expandedRows = this.inventories.reduce((acc, p) => (acc[p._id] = true) && acc, {});
  }

  collapseAll() {
    this.expandedRows = {};
  }


  printBarcode(batch: any, productName: string): void {
    console.log('Printing barcode for batch', batch);
    console.log('Product Name', productName);
    this.apiService.createInventoryBarcode({...batch, productName}).subscribe(value => {
      if (value && value.success && value.data && value.data.pdfPath) {
        this.toastr.showSuccess('BarCode Generated successfully.', 'Success');
        const receiptUrl =  environment.uploadUrl + value.data.pdfPath;
        window.open(receiptUrl, '_blank'); // Open the PDF in a new browser tab
      } else {
        this.toastr.showError('Failed to generate barcode.', 'Error');
      }
    });
  }
}
