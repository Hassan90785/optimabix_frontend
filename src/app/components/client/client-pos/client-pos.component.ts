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
})export class ClientPosComponent implements OnInit {
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
  paymentMethods = [
    { label: 'Cash', value: 'cash' },
    { label: 'Credit Card', value: 'credit' },
    { label: 'Debit Card', value: 'debit' },
  ];
  selectedPaymentMethod: string = 'cash';
  paidAmount: number = 0;
  balanceAmount: number = 0;

  auth = inject(AuthService);
  apiService = inject(RestApiService);

  ngOnInit(): void {
    this.cashierName = this.auth.info.name;
    this.loadProducts();
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
  }

  // Load products from API
  loadProducts(): void {
    this.apiService
      .getAvailableInventories({ companyId: this.auth.info.companyId, includeBatches: true })
      .subscribe(
        (response) => {
          if (response?.data) {
            this.productOptions = response.data.map(this.mapProductOption);
            console.log('Available products loaded:', this.productOptions);
          } else {
            console.warn('No available inventory found.');
          }
        },
        (error) => console.error('Error fetching available inventory:', error)
      );
  }

  // Map product option
  private mapProductOption(inventory: any): any {
    return {
      id: inventory.productId,
      price: inventory.firstAvailableBatch.sellingPrice,
      name: `${inventory.name} (Qty: ${inventory.totalQuantity})`,
      availableQuantity: inventory.totalQuantity,
      disabled: inventory.totalQuantity === 0,
    };
  }

  // Update current date and time
  updateDateTime(): void {
    this.currentDateTime = new Date().toLocaleString();
  }

  // Handle barcode scan
  onScan(): void {
    if (this.scannedCode) {
      const product = this.getProductByBarcode(this.scannedCode);
      if (product) {
        this.addItemToCart(product);
      } else {
        alert('Product not found!');
      }
      this.resetScannedCode();
    }
  }

  // Handle product selection
  onProductSelect(): void {
    const selectedInventory = this.productOptions.find((p) => p.id === this.selectedProduct);
    if (selectedInventory) {
      this.addItemToCart({
        id: selectedInventory.id,
        name: selectedInventory.name,
        price: selectedInventory.price,
        availableQuantity: selectedInventory.availableQuantity,
      });
    }
    this.resetSelectedProduct();
  }

  // Reset scanned code
  private resetScannedCode(): void {
    setTimeout(() => (this.scannedCode = ''), 1);
  }

  // Reset selected product
  private resetSelectedProduct(): void {
    setTimeout(() => (this.selectedProduct = ''), 1);
  }

  // Get product by barcode
  getProductByBarcode(barcode: string): any {
    return this.productOptions.find((p) => p.barcode === barcode);
  }

  // Add item to cart
  addItemToCart(product: any): void {
    const existingItem = this.cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      this.updateCartItemQuantity(existingItem, 1);
    } else {
      this.addNewCartItem(product);
    }

    this.reduceAvailableQuantity(product.id, 1);
    this.calculateTotals();
  }

  // Update cart item quantity
  private updateCartItemQuantity(cartItem: any, increment: number): void {
    if (cartItem.quantity + increment <= this.getAvailableQuantity(cartItem.id)) {
      cartItem.quantity += increment;
      cartItem.total = cartItem.quantity * cartItem.price;
    } else {
      alert('Insufficient stock available for this product.');
    }
  }

  // Add new item to cart
  private addNewCartItem(product: any): void {
    if (product.availableQuantity > 0) {
      this.cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
      });
    } else {
      alert('Insufficient stock available for this product.');
    }
  }

  // Reduce available quantity
  private reduceAvailableQuantity(productId: string, quantity: number): void {
    const selectedProduct = this.productOptions.find((p) => p.id === productId);
    if (selectedProduct) {
      selectedProduct.availableQuantity -= quantity;
      selectedProduct.name = `${selectedProduct.name.split('(')[0].trim()} (Qty: ${selectedProduct.availableQuantity})`;
    }
  }

  // Get available quantity for a product
  private getAvailableQuantity(productId: string): number {
    const productOption = this.productOptions.find((p) => p.id === productId);
    return productOption ? productOption.availableQuantity : 0;
  }

  // Remove item from cart
  removeItem(item: any): void {
    this.cartItems = this.cartItems.filter((i) => i.id !== item.id);
    this.restoreAvailableQuantity(item);
    this.calculateTotals();
  }

  // Restore available quantity
  private restoreAvailableQuantity(item: any): void {
    const selectedProduct = this.productOptions.find((p) => p.id === item.id);
    if (selectedProduct) {
      selectedProduct.availableQuantity += item.quantity;
      selectedProduct.name = `${selectedProduct.name.split('(')[0].trim()} (Qty: ${selectedProduct.availableQuantity})`;
    }
  }

  updateCartQuantity(productId: string, newQuantity: number): void {
    const cartItem = this.cartItems.find((item) => item.id === productId);
    const productOption = this.productOptions.find((p) => p.id === productId);

    if (!cartItem || !productOption) return;

    const delta = newQuantity - cartItem.quantity;

    // Validate stock availability for the increase
    if (delta > 0 && newQuantity > productOption.availableQuantity) {
      alert('Insufficient stock available for this product.');
      return;
    }

    // Update the cart item quantity and total
    cartItem.quantity = newQuantity;
    cartItem.total = cartItem.quantity * cartItem.price;

    // Adjust the available quantity for the product option
    productOption.availableQuantity -= delta;

    // Update the product option name to reflect the new quantity
    productOption.name = `${productOption.name.split('(')[0].trim()} (Qty: ${productOption.availableQuantity})`;

    console.log('Updated productOption:', productOption);
    console.log('cartItems', this.cartItems)
    this.calculateTotals();
  }

  // Calculate totals
  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + item.total, 0);
    this.tax = this.subtotal * 0.1;
    this.total = this.subtotal + this.tax;
  }

  // Clear cart
  clearCart(): void {
    this.cartItems = [];
    this.subtotal = 0;
    this.tax = 0;
    this.total = 0;
  }

  // Show checkout dialog
  showCheckoutDialog(): void {
    this.checkoutDialogVisible = true;
  }

  // Update balance amount
  updateBalance(): void {
    this.balanceAmount = this.paidAmount - this.total;
  }

  // Confirm checkout
  confirmCheckout(): void {
    if (this.cartItems.some((item) => !this.hasSufficientStock(item))) {
      alert('Insufficient stock available for some products.');
      return;
    }

    if (this.balanceAmount >= 0 && this.selectedPaymentMethod) {
      console.log('Checked out items:', this.cartItems);
      alert('Checkout successful!');
      this.checkoutDialogVisible = false;
      this.clearCart();
    } else {
      alert('Please ensure payment is complete.');
    }
  }

  // Check stock availability for an item
  private hasSufficientStock(item: any): boolean {
    const product = this.productOptions.find((p) => p.id === item.id);
    return product ? product.availableQuantity >= item.quantity : false;
  }
}
