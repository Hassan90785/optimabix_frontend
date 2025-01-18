import {Component, OnDestroy, OnInit} from '@angular/core';
import {Module} from '../../../../core/models/Module';
import {Subscription} from 'rxjs';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {MessageService} from 'primeng/api';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {RouterLink} from '@angular/router';
import {Card} from 'primeng/card';

@Component({
  selector: 'app-module-listing',
  imports: [
    Button,
    TableModule,
    RouterLink,
    Card
  ],
  templateUrl: './module-listing.component.html',
  standalone: true,
  providers: [MessageService],
  styleUrl: './module-listing.component.scss'
})
export class ModuleListingComponent implements OnInit, OnDestroy {
  modules: Module[] = [];
  totalRecords: number = 0;
  loading: boolean = true;
  subscriptions: Subscription = new Subscription();

  constructor(
    private apiService: RestApiService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.fetchModules();
  }

  fetchModules(page: number = 1, limit: number = 10, sort: string = 'moduleName'): void {
    this.loading = true;
    this.subscriptions.add(
      this.apiService.getAllModules({ page, limit, sort }).subscribe({
        next: (response) => {
          this.modules = response.data.modules;
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
    this.fetchModules(page, rows);
  }

  onEdit(module: Module): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Edit Module',
      detail: `Editing module: ${module.moduleName}`,
    });
    // Implement navigation to edit module component
  }

  onDelete(module: Module): void {
    if (confirm(`Are you sure you want to delete ${module.moduleName}?`)) {
      this.loading = true;
      this.subscriptions.add(
        this.apiService.deleteModule(module.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `${module.moduleName} has been deleted successfully.`,
            });
            this.fetchModules();
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
