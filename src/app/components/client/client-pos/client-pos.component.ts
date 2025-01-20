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
  selectedProduct: any = null;
  cartItems: any[] = [];
  productOptions: any[] = [];
  itemsource: any[] = [];
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
    this.apiService
      .getAvailableInventories({companyId: this.auth.info.companyId, includeBatches: true})
      .subscribe(
        (response) => {
          if (response && response.data) {
            this.productOptions = response.data.map((inventory: any) => ({
              id: inventory.productId,
              price: inventory.firstAvailableBatch.sellingPrice,
              name: `${inventory.name} (Qty: ${inventory.totalQuantity})`,
              availableQuantity: inventory.totalQuantity,
              disabled: inventory.totalQuantity === 0, // Disable out-of-stock items
            }));

            console.log('Available products loaded:', this.productOptions);
          } else {
            console.warn('No available inventory found.');
          }
        },
        (error) => {
          console.error('Error fetching available inventory:', error);
        }
      );
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
    console.log('this.selectedProduct', this.selectedProduct)
    console.log('this.productOptions', this.productOptions)
    const selectedInventory = this.productOptions.find((p) => p.id === this.selectedProduct);
    console.log('selectedInventory', selectedInventory)
    if (selectedInventory) {
      // Mock example using firstAvailableBatch details from the API response
      this.addItemToCart({
        id: selectedInventory.id,
        name: selectedInventory.name,
        price: selectedInventory.price,
        availableQuantity: selectedInventory.availableQuantity -1,
      });
    }

    // Reset the dropdown value
    setTimeout(() => {
      this.selectedProduct = '';
    }, 1);
  }


  getProductByBarcode(barcode: string): any {
    const product = this.productOptions.find((p) => p.barcode === barcode);
    if (product) {
      return {
        id: product.productId,
        name: product.name,
        price: product.firstAvailableBatch.sellingPrice,
      };
    }
    return null;
  }


  addItemToCart(product: any): void {
    const existingItem = this.cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.availableQuantity) {
        existingItem.quantity += 1;
        this.updateItemTotal(existingItem);
      } else {
        alert('Insufficient stock available for this product.');
        return;
      }
    } else {
      if (product.availableQuantity > 0) {
        this.cartItems.push({ ...product, quantity: 1, total: product.price });
      } else {
        alert('Insufficient stock available for this product.');
        return;
      }
    }

    // Reduce available quantity in productOptions
    const selectedProduct = this.productOptions.find((p) => p.id === product.id);
    if (selectedProduct) {
      selectedProduct.availableQuantity -= 1;
      selectedProduct.name = `${selectedProduct.name.split('(')[0].trim()} (Qty: ${selectedProduct.availableQuantity})`;
    }

    this.calculateTotals();
  }

  removeItem(item: any): void {
    this.cartItems = this.cartItems.filter((i) => i.id !== item.id);

    // Restore available quantity in productOptions
    const selectedProduct = this.productOptions.find((p) => p.id === item.id);
    if (selectedProduct) {
      selectedProduct.availableQuantity += item.quantity;
      selectedProduct.name = `${selectedProduct.name.split('(')[0].trim()} (Qty: ${selectedProduct.availableQuantity})`;
    }

    this.calculateTotals();
  }

  updateCartQuantity(productId: string, newQuantity: number): void {
    const cartItem = this.cartItems.find((item) => item.id === productId);
    const productOption = this.productOptions.find((p) => p.id === productId);

    if (!cartItem || !productOption) return;

    // Check stock availability
    if (newQuantity > productOption.availableQuantity) {
      alert('Insufficient stock available for this product.');
      return;
    }

    // Update quantities
    const delta = newQuantity - cartItem.quantity; // Difference in quantity
    cartItem.quantity = newQuantity;
    cartItem.total = cartItem.quantity * cartItem.price;

    // Adjust availableQuantity in productOptions
    productOption.availableQuantity -= delta;
    productOption.name = `${productOption.name.split('(')[0].trim()} (Qty: ${productOption.availableQuantity})`;

    this.calculateTotals();
  }

  updateItemTotal(item: any): void {
    console.log('item', item)
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
    let outOfStock = false;

    this.cartItems.forEach((item) => {
      const product = this.productOptions.find((p) => p.id === item.id);
      if (!product || product.availableQuantity < item.quantity) {
        alert(`Insufficient stock for product: ${item.name}`);
        outOfStock = true;
      }
    });

    if (outOfStock) return;

    if (this.balanceAmount >= 0 && this.selectedPaymentMethod) {
      alert('Checkout successful!');
      this.checkoutDialogVisible = false;
      this.clearCart();
    } else {
      alert('Please ensure payment is complete.');
    }
  }




}
