import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {RestApiService} from '../../../../core/services/rest-api.service';
import {AdminStore} from '../../../../core/stores/admin.store';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {Router} from '@angular/router';
import {AuthService} from '../../../../core/services/auth.service';

@Component({
  selector: 'app-list-products',
  imports: [
    Button,
    TableModule
  ],
  templateUrl: './list-products.component.html',
  standalone: true,
  styleUrl: './list-products.component.scss'
})
export class ListProductsComponent implements OnInit, OnDestroy {
  products: any[] = [];
  totalRecords: number = 0;
  subscriptions: Subscription = new Subscription();

  constructor(private apiService: RestApiService, private router: Router, private auth: AuthService) {
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(page: number = 1, limit: number = 10, sort: string = 'createdAt'): void {
    AdminStore.setLoader(true);
    this.subscriptions.add(
      this.apiService.getProducts({ page, limit, sort, companyId:this.auth.info.companyId }).subscribe({
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

  onEdit(product: any): void {
    // Navigate to the CRUD form for editing
  }

  onDelete(product: any): void {
    // Call delete product API
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onAdd() {
    this.router.navigate(['app/product/add']);
  }
}
