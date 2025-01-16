import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {MessageService, PrimeTemplate} from 'primeng/api';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {Company} from '../../../../core/models/Company';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-companies-listing',
  imports: [
    Button,
    PrimeTemplate,
    TableModule
  ],
  providers: [MessageService],
  templateUrl: './companies-listing.component.html',
  standalone: true,
  styleUrl: './companies-listing.component.scss'
})
export class CompaniesListingComponent implements OnInit, OnDestroy {
  companies: Company[] = [];
  totalRecords: number = 0;
  loading: boolean = true;
  subscriptions: Subscription = new Subscription();

  constructor(
    private apiService: RestApiService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.fetchCompanies();
  }

  fetchCompanies(page: number = 1, limit: number = 10, sort: string = 'name'): void {
    this.loading = true;
    this.subscriptions.add(
      this.apiService.getAllCompanies({ page, limit, sort }).subscribe({
        next: (response) => {
          this.companies = response.data.companies;
          this.totalRecords = response.data.totalRecords;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
          });
          this.loading = false;
        },
      })
    );
  }

  onPageChange(event: any): void {
    const { first, rows } = event;
    const page = first / rows + 1;
    this.fetchCompanies(page, rows);
  }

  onEdit(company: Company): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Edit Company',
      detail: `Editing company: ${company.name}`,
    });
    // Implement edit logic (use a modal for real-world scenarios)
  }

  onDelete(company: Company): void {
    if (confirm(`Are you sure you want to delete ${company.name}?`)) {
      this.loading = true;
      this.subscriptions.add(
        this.apiService.softDeleteCompany(company.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `${company.name} has been deleted successfully.`,
            });
            this.fetchCompanies();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message,
            });
            this.loading = false;
          },
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onAddCompany(): void {
    this.router.navigate(['/admin/companies/add']);
  }
}
