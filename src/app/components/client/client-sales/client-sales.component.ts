import {Component, inject, OnInit} from '@angular/core';
import {RestApiService} from '../../../core/services/rest-api.service';
import {Card} from 'primeng/card';
import {DropdownModule} from 'primeng/dropdown';
import {TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';
import {CommonModule, CurrencyPipe, DatePipe} from '@angular/common';
import {catchError, of} from 'rxjs';
import {AdminStore} from '../../../core/stores/admin.store';
import {ToastrService} from '../../../core/services/toastr.service';
import {AuthService} from '../../../core/services/auth.service';
import {Dialog} from 'primeng/dialog';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-client-sales',
  imports: [
    CommonModule,
    Card,
    DropdownModule,
    TableModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    Dialog,
    Button
  ],
  templateUrl: './client-sales.component.html',
  standalone: true,
  providers: [ToastrService],
  styleUrl: './client-sales.component.scss'
})
export class ClientSalesComponent implements OnInit {
  transactions: any[] = [];
  loading: boolean = false;

  filterOptions = [
    {label: 'Today', value: 'today'},
    {label: 'Last 3 Days', value: 'last3days'},
    {label: 'Last 7 Days', value: 'last7days'},
    {label: 'Custom Range', value: 'custom'},
  ];
  selectedFilter: string = 'today';
  startDate: Date | null = null;
  endDate: Date | null = null;
  auth = inject(AuthService);
  private toastr = inject(ToastrService)
  private apiService = inject(RestApiService)
  filterDialogVisible: boolean = false; // Dialog visibility
  transactionDialogVisible: boolean = false; // Dialog visibility
  selectedTransaction: any = null; // Selected transaction
  constructor() {
  }

  ngOnInit(): void {
    this.fetchTransactions();
  }

  fetchTransactions(): void {
    this.loading = true;
    const filters: any = this.getFilterDates();
    filters.companyId = this.auth.info.companyId
    this.apiService.getPOSTransactions(filters).pipe(catchError((error) => {
      console.log('error: ', error);
      AdminStore.setLoader(false);
      this.toastr.showError('Something went wrong', 'Error');
      return of(null); // Return an observable, like `null`, to complete the stream gracefully
    })).subscribe((value) => {
      if (value && value.success)
        this.transactions = value.data.transactions;
      this.filterDialogVisible = false;
      this.loading = false;
    });
  }

  applyFilter(): void {
    if (this.selectedFilter === 'custom') {
      this.openDateRangeDialog();
    } else {
      this.fetchTransactions();
    }
  }


  getFilterDates(): any {
    const today = new Date();
    const filters: any = {};
    if (this.selectedFilter === 'today') {
      filters.startDate = today.toISOString().split('T')[0];
      filters.endDate = today.toISOString().split('T')[0];
    } else if (this.selectedFilter === 'last3days') {
      const startDate = new Date();
      startDate.setDate(today.getDate() - 3);
      filters.startDate = startDate.toISOString().split('T')[0];
      filters.endDate = today.toISOString().split('T')[0];
    } else if (this.selectedFilter === 'last7days') {
      const startDate = new Date();
      startDate.setDate(today.getDate() - 7);
      filters.startDate = startDate.toISOString().split('T')[0];
      filters.endDate = today.toISOString().split('T')[0];
    } else if (this.selectedFilter === 'custom' && this.startDate && this.endDate) {
      filters.startDate = new Date(this.startDate).toISOString().split('T')[0];
      filters.endDate = new Date(this.endDate).toISOString().split('T')[0];
    }

    return filters;
  }
// In your component class
  getFormattedProducts(products: any[]): string {
    return products
      .map(product => product.productId.productName + ' (Qty: ' + product.quantity + ')')
      .join(', ');
  }

  openDateRangeDialog(): void {
   this.filterDialogVisible = true;
  }

  resetFilter(): void {
    this.startDate = null;
    this.endDate = null;
    this.fetchTransactions(); // Reload all transactions
  }

  viewTransaction(transaction: any) {
    this.transactionDialogVisible = true;
    this.selectedTransaction = transaction;
  }

  closeDialog() {
    this.transactionDialogVisible = false;
    this.selectedTransaction = null;
  }
}
