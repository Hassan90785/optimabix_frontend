import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {AdminStore} from '../../../../core/stores/admin.store';
import {Button} from 'primeng/button';
import {Table, TableModule} from 'primeng/table';
import {Router} from '@angular/router';
import {AuthService} from '../../../../core/services/auth.service';
import {DataStoreService} from '../../../../core/services/data-store.service';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-list-products',
  imports: [
    Button,
    TableModule,
    IconField,
    InputIcon,
    InputText,
    FormsModule
  ],
  templateUrl: './list-products.component.html',
  standalone: true,
  styleUrl: './list-products.component.scss'
})
export class ListProductsComponent implements OnInit, OnDestroy {
  products: any[] = [];
  totalRecords: number = 0;
  subscriptions: Subscription = new Subscription();
  searchValue: string = '';

  constructor(private apiService: RestApiService, private router: Router,
              private dataStore: DataStoreService,
              private auth: AuthService) {
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(page: number = 1, limit: number = 100, sort: string = 'createdAt'): void {
    AdminStore.setLoader(true);
    this.subscriptions.add(
      this.apiService.getProducts({page, limit, sort, companyId: this.auth.info.companyId}).subscribe({
        next: (response: any) => {
          this.products = response.data.products;
          this.totalRecords = response.data.totalRecords;
          AdminStore.setLoader(false);
        },
        error: () => {
          AdminStore.setLoader(false);
        }
      })
    );
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = ''
  }


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onAdd() {
    this.dataStore.setSelectedProduct(null);
    this.router.navigate(['app/product/add']);
  }

  onEdit(product: any): void {
    this.dataStore.setSelectedProduct({type: 'E', data: product});
    this.router.navigate(['/app/product/update']);
  }

  onDelete(product: any): void {
    // Call delete product API
  }
}
