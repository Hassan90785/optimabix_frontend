import {Component, OnDestroy, OnInit} from '@angular/core';
import {Company} from '../../../core/models/Company';
import {Subscription} from 'rxjs';
import {RestApiService} from '../../../core/services/rest-api.service';
import {MessageService} from 'primeng/api';
import {TableModule} from 'primeng/table';
import {Button, ButtonDirective} from 'primeng/button';

@Component({
  selector: 'app-admin-companies',
  imports: [
    TableModule,
    Button
  ],
  providers:[MessageService],
  templateUrl: './admin-companies.component.html',
  standalone: true,
  styleUrl: './admin-companies.component.css'
})
export class AdminCompaniesComponent implements OnInit, OnDestroy {
  companies: Company[] = [];
  totalRecords: number = 0;
  loading: boolean = true;
  subscriptions: Subscription = new Subscription();

  constructor(
    private apiService: RestApiService,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {
    this.fetchCompanies();
  }

  fetchCompanies(): void {
    this.loading = true;
    this.subscriptions.add(
      this.apiService.getAllCompanies({page: 1, limit: 10, sort: 'name'}).subscribe({
        next: (response) => {
          this.companies = response.data.companies;
          this.totalRecords = response.data.totalRecords;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message
          });
          this.loading = false;
        }
      })
    );
  }

  onEdit(company: Company): void {
    const updatedDetails = {...company}; // Clone the existing company details
    const newName = prompt(`Edit Name for ${company.name}`, company.name); // Example input via prompt (replace with a modal for real use)
    if (newName) {
      updatedDetails.name = newName;

      this.subscriptions.add(
        this.apiService.updateCompany(company.id!, updatedDetails).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Updated',
              detail: `${company.name} has been updated successfully.`,
            });
            this.fetchCompanies(); // Refresh list after update
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message,
            });
          },
        })
      );
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Edit Cancelled',
        detail: 'No changes were made.',
      });
    }
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
              detail: `${company.name} has been deleted successfully.`
            });
            this.fetchCompanies();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message
            });
            this.loading = false;
          }
        })
      );
    }
  }

  onPageChange(event: any): void {
    this.fetchCompanies(); // Adjust fetch logic to use event data for pagination
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
