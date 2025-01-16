import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from '../../../core/models/User';
import {Subscription} from 'rxjs';
import {RestApiService} from '../../../core/services/rest-api.service';
import {MessageService} from 'primeng/api';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';

@Component({
  selector: 'app-admin-users',
  imports: [
    Button,
    TableModule
  ],
  providers: [MessageService],
  templateUrl: './admin-users.component.html',
  standalone: true,
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  totalRecords: number = 0;
  loading: boolean = true;
  subscriptions: Subscription = new Subscription();

  constructor(
    private apiService: RestApiService,
    private messageService: MessageService
) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(page: number = 1, limit: number = 10, sort: string = 'fullName'): void {
    this.loading = true;
    this.subscriptions.add(
      this.apiService.getAllUsers({ page, limit, sort }).subscribe({
        next: (response) => {
          this.users = response.data.users;
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

  onPageChange(event: any): void {
    const { first, rows } = event;
    const page = first / rows + 1;
    this.fetchUsers(page, rows);
  }

  onEdit(user: User): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Edit User',
      detail: `Editing user: ${user.fullName}`
    });
    // Implement edit logic here
  }

  onDelete(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
    this.loading = true;
    this.subscriptions.add(
      this.apiService.deleteUser(user.id!).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: `${user.fullName} has been deleted successfully.`
          });
          this.fetchUsers();
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onView(user: any) {

  }
}

