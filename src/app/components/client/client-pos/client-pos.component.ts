import {Component, inject, OnInit} from '@angular/core';
import {Card} from 'primeng/card';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {CurrencyPipe} from '@angular/common';
import {Button} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {Dialog} from 'primeng/dialog';
import {AuthService} from '../../../core/services/auth.service';
import {RestApiService} from '../../../core/services/rest-api.service';

@Component({
  selector: 'app-client-pos',
  imports: [
    Card,
    FloatLabel,
    InputText,
    FormsModule,
    TableModule,
    CurrencyPipe,
    Button,
    DropdownModule,
    Dialog
  ],
  templateUrl: './client-pos.component.html',
  standalone: true,
  styleUrl: './client-pos.component.scss'
})
export class ClientPosComponent implements OnInit {
  scannedCode: string = '';
  selectedProduct: string = '';
  cartItems: any[] = [];
  productOptions: { id: string; name: string }[] = [];
  subtotal: number = 0;
  tax: number = 0;
  total: number = 0;
  currentDateTime: string = '';
  cashierName: string = 'N/A';
  checkoutDialogVisible: boolean = false;
  paymentMethods: { label: string; value: string }[] = [
    {label: 'Cash', value: 'cash'},
    {label: 'Credit Card', value: 'credit'},
    {label: 'Debit Card', value: 'debit'},];
  selectedPaymentMethod: string = 'cash';
  paidAmount: number = 0;
  balanceAmount: number = 0;
  auth = inject(AuthService);
  apiService = inject(RestApiService);

  ngOnInit(): void {
    this.cashierName = this.auth.info.name;
    this.loadProducts();
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000); // Update time every second
  }

  loadProducts(): void {
    this.apiService.getAvailableInventories({companyId:this.auth.info.companyId, includeBatches:true}).subscribe((response) => {
      console.log('response', response);
    });
    // Simulated API call
    this.productOptions = [
      {id: '001', name: 'Product A'},
      {id: '002', name: 'Product B'},
      {id: '003', name: 'Product C'},
      {id: '004', name: 'Product D'},
      {id: '005', name: 'Product E'},
      {id: '006', name: 'Product F'},
      {id: '007', name: 'Product G'},
      {id: '008', name: 'Product H'},
      {id: '009', name: 'Product I'},
      {id: '010', name: 'Product J'},
      {id: '011', name: 'Product K'},
    ];
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDateTime = now.toLocaleString();
  }

  onScan(): void {
    if (this.scannedCode) {
      const product = this.getProductByBarcode(this.scannedCode);
      if (product) {
        this.addItemToCart(product);
      } else {
        alert('Product not found!');
      }

      // Reset the dropdown value
      setTimeout(() => {
        this.scannedCode = '';
      }, 1);
    }
  }

  onProductSelect(): void {
    const product = this.productOptions.find((p) => p.id === this.selectedProduct);
    if (product) {
      this.addItemToCart({...product, price: 100}); // Assign a mock price for the dropdown selection
    }
    // Reset the dropdown value
    setTimeout(() => {
      this.selectedProduct = '';
    }, 1);
  }

  getProductByBarcode(barcode: string): any {
    const mockProducts = [
      {id: '001', name: 'Product A', price: 100},
      {id: '002', name: 'Product B', price: 200},
    ];
    return mockProducts.find((p) => p.id === barcode);
  }

  addItemToCart(product: any): void {
    const existingItem = this.cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
      this.updateItemTotal(existingItem);
    } else {
      this.cartItems.push({...product, quantity: 1, total: product.price});
    }
    this.calculateTotals();
  }

  removeItem(item: any): void {
    this.cartItems = this.cartItems.filter((i) => i.id !== item.id);
    this.calculateTotals();
  }

  updateItemTotal(item: any): void {
    item.total = item.quantity * item.price;
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + item.total, 0);
    this.tax = this.subtotal * 0.1;
    this.total = this.subtotal + this.tax;
  }

  clearCart(): void {
    this.cartItems = [];
    this.subtotal = 0;
    this.tax = 0;
    this.total = 0;
  }


  showCheckoutDialog(): void {
    this.checkoutDialogVisible = true;
  }

  updateBalance(): void {
    this.balanceAmount = this.paidAmount - this.total;
  }

  confirmCheckout(): void {
    if (this.balanceAmount >= 0 && this.selectedPaymentMethod) {
      alert('Checkout successful!');
      this.checkoutDialogVisible = false;
      this.clearCart();
    } else {
      alert('Please ensure payment is complete.');
    }
  }
}
