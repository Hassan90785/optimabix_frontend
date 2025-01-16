import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {MessageService, PrimeTemplate} from 'primeng/api';
import {Role} from '../../../../core/models/Role';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';

@Component({
  selector: 'app-role-listing',
  imports: [
    Button,
    PrimeTemplate,
    TableModule
  ],
  templateUrl: './role-listing.component.html',
  providers: [MessageService],
  standalone: true,
  styleUrl: './role-listing.component.scss'
})
export class RoleListingComponent implements OnInit, OnDestroy {
  roles: Role[] = [];
  totalRecords: number = 0;
  loading: boolean = true;
  subscriptions: Subscription = new Subscription();

  constructor(
    private apiService: RestApiService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.fetchRoles();
  }

  fetchRoles(page: number = 1, limit: number = 10, sort: string = 'roleName'): void {
    this.loading = true;
    this.subscriptions.add(
      this.apiService.getAllRoles({ page, limit, sort }).subscribe({
        next: (response) => {
          this.roles = response.data.roles;
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
    this.fetchRoles(page, rows);
  }

  onEdit(role: Role): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Edit Role',
      detail: `Editing role: ${role.roleName}`,
    });
    // Implement edit logic
  }

  onDelete(role: Role): void {
    if (confirm(`Are you sure you want to delete ${role.roleName}?`)) {
      this.loading = true;
      this.subscriptions.add(
        this.apiService.deleteRole(role.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `${role.roleName} has been deleted successfully.`,
            });
            this.fetchRoles();
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

  onAddRole() {
    this.router.navigate(['/admin/roles/add']);
  }
}
