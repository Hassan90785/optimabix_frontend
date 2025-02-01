import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {

  private selectedProduct = new BehaviorSubject<any>(null);
  selectedProduct$ = this.selectedProduct.asObservable();

  private selectedEntity = new BehaviorSubject<any>(null);
  selectedEntity$ = this.selectedProduct.asObservable();

  private selectedInventory = new BehaviorSubject<any>(null);
  selectedInventory$ = this.selectedProduct.asObservable();

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
