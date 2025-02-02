import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {

  private selectedProduct = new BehaviorSubject<any>(null);
  private selectedEntity = new BehaviorSubject<any>(null);
  private selectedInventory = new BehaviorSubject<any>(null);
  selectedProduct$ = this.selectedProduct.asObservable();
  selectedEntity$ = this.selectedEntity.asObservable();
  selectedInventory$ = this.selectedInventory.asObservable();

  setSelectedProduct(product: any) {
    this.selectedProduct.next(product);
  }

  setSelectedEntity(product: any) {
    this.selectedEntity.next(product);
  }

  setSelectedInventory(product: any) {
    this.selectedInventory.next(product);
  }
}
