import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {AdminStore} from '../../../../core/stores/admin.store';
import {Subscription} from 'rxjs';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {PrimeTemplate} from 'primeng/api';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {Card} from 'primeng/card';
import {AuthService} from '../../../../core/services/auth.service';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-entities-list',
  imports: [
    PrimeTemplate,
    Button,
    TableModule,
    Card,
    DatePipe
  ],
  templateUrl: './entities-list.component.html',
  standalone: true,
  styleUrl: './entities-list.component.scss'
})
export class EntitiesListComponent  implements OnInit, OnDestroy {
  entities: any[] = [];
  totalRecords: number = 0;
  subscriptions: Subscription = new Subscription();
  auth = inject(AuthService);
  router = inject(Router);
  constructor(private apiService: RestApiService) {}

  ngOnInit(): void {
    this.fetchEntities();
  }

  fetchEntities(page: number = 1, limit: number = 10, sort: string = 'entityName'): void {
    console.log('fetchEntities')
    AdminStore.setLoader(true);
    this.subscriptions.add(
      this.apiService.getEntities({ page, limit, sort, companyId:this.auth.info.companyId }).subscribe({
        next: (response: any) => {
          this.entities = response.data.entities;
          this.totalRecords = response.data.totalRecords;
          AdminStore.setLoader(false);
        },
        error: () => {
          AdminStore.setLoader(false);
        }
      })
    );
  }

  onEdit(entity: any): void {
    // Navigate to CRUD form for editing
  }

  onDelete(entity: any): void {
    // Call delete entity API
  }
  onAdd(): void {
    this.router.navigate(['app/entity/add']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
