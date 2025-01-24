import {Component, inject, OnInit} from '@angular/core';
import {TableModule} from 'primeng/table';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {Card} from 'primeng/card';
import {DropdownModule} from 'primeng/dropdown';
import {Calendar} from 'primeng/calendar';
import {FormsModule} from '@angular/forms';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {AuthService} from '../../../../core/services/auth.service';

@Component({
  selector: 'app-client-ledger',
  imports: [
    TableModule,
    DatePipe,
    CurrencyPipe,
    Card,
    DropdownModule,
    Calendar,
    FormsModule
  ],
  templateUrl: './client-ledger.component.html',
  standalone: true,
  styleUrl: './client-ledger.component.scss'
})
export class ClientLedgerComponent  implements OnInit {
  ledgerEntries: any[] = [];
  totalRecords: number = 0;
  loading: boolean = false;

  transactionTypes = [
    { label: 'All', value: null },
    { label: 'Sale', value: 'Sale' },
    { label: 'Purchase', value: 'Purchase' },
    { label: 'Return', value: 'Return' },
    { label: 'Refund', value: 'Refund' },
    { label: 'Discount', value: 'Discount' },
    { label: 'Payment', value: 'Payment' },
    { label: 'Expense', value: 'Expense' },
    { label: 'Tax', value: 'Tax' },
    { label: 'Subscription', value: 'Subscription' },
  ];

  selectedTransactionType: string | null = null;
  selectedDate: Date | null = null;
  private apiService= inject(RestApiService)
  private auth = inject(AuthService)
  constructor() {}

  ngOnInit(): void {
    this.loadLedger();
  }

  loadLedger(event: any = {}): void {
    this.loading = true;

    const queryParams = {
      page: event.first / event.rows + 1 || 1,
      limit: event.rows || 10,
      sortField: event.sortField || 'date',
      sortOrder: event.sortOrder === 1 ? 'asc' : 'desc',
      transactionType: this.selectedTransactionType,
      date: this.selectedDate,
      companyId: this.auth.info.companyId
    };

    this.apiService.getLedger(queryParams).subscribe({
      next: (response: any) => {
        this.ledgerEntries = response.data.ledgerEntries;
        this.totalRecords = response.data.totalRecords;
        this.loading = false;
      },
      error: (error:any) => {
        console.error('Failed to load ledger entries:', error);
        this.loading = false;
      },
    });
  }

  filterLedger(): void {
    this.loadLedger();
  }

  resetFilters(): void {
    this.selectedTransactionType = null;
    this.selectedDate = null;
    this.loadLedger();
  }

  viewDetails(entry: any): void {
    console.log('Viewing details for:', entry);
    // Implement view details logic here
  }
}
