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
import {DataStoreService} from '../../../../core/services/data-store.service';

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
export class EntitiesListComponent implements OnInit, OnDestroy {
  entities: any[] = [];
  totalRecords: number = 0;
  subscriptions: Subscription = new Subscription();
  auth = inject(AuthService);
  router = inject(Router);
  private dataStore = inject(DataStoreService);

  constructor(private apiService: RestApiService) {
  }

  ngOnInit(): void {
    this.fetchEntities();
  }

  fetchEntities(page: number = 1, limit: number = 10, sort: string = 'entityName'): void {
    AdminStore.setLoader(true);
    this.subscriptions.add(
      this.apiService.getEntities({page, limit, sort, companyId: this.auth.info.companyId}).subscribe({
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

  onAdd() {
    this.router.navigate(['app/entity/add']);
  }

  onEdit(product: any): void {
    console.log('Setting Entity: ', product);
    this.dataStore.setSelectedEntity({type: 'E', data: product});
    this.router.navigate(['/app/entity/update']);
  }

  onDelete(product: any): void {
    // Call delete product API
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
