import {Component, OnDestroy, OnInit} from '@angular/core';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {Role} from '../../../core/models/Role';
import {Subscription} from 'rxjs';
import {RestApiService} from '../../../core/services/rest-api.service';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-admin-roles',
  imports: [
    Button,
    TableModule
  ],
  providers: [MessageService],
  templateUrl: './admin-roles.component.html',
  standalone: true,
  styleUrl: './admin-roles.component.css'
})
export class AdminRolesComponent  implements OnInit, OnDestroy {
  roles: Role[] = [];
  totalRecords: number = 0;
  loading: boolean = true;
  subscriptions: Subscription = new Subscription();

  constructor(
    private apiService: RestApiService,
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
}
