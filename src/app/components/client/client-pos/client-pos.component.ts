import {Component, inject, OnDestroy, OnInit} from '@angular/core';
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
import {POSTransaction, ProductDetails} from '../../../core/models/POSTransaction';
import {ToastrService} from '../../../core/services/toastr.service';
import {catchError, of, Subscription} from 'rxjs';
import {AdminStore} from '../../../core/stores/admin.store';
import {environment} from '../../../environments/environment';

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
  providers: [ToastrService],
  styleUrl: './client-pos.component.scss'
})
export class ClientPosComponent implements OnInit, OnDestroy {
  scannedCode: string = '';
  selectedProduct: any = null;
  cartItems: any[] = [];
  productOptions: any[] = [];
  subtotal: number = 0;
  tax: number = 0;
  total: number = 0;
  currentDateTime: string = '';
  cashierName: string = 'N/A';
  checkoutDialogVisible: boolean = false;
  paymentMethods = [
    {label: 'Cash', value: 'Cash'},
    {label: 'Credit Card', value: 'Credit Card'},
    {label: 'Bank Transfer', value: 'Bank Transfer'},
  ];
  selectedPaymentMethod: string = 'Cash';
  paidAmount: number = 0;
  balanceAmount: number = 0;
  discountAmount: number = 0;
  subscription: Subscription = new Subscription();
  auth = inject(AuthService);
  apiService = inject(RestApiService);
  private toastr = inject(ToastrService)

  ngOnInit(): void {
    this.cashierName = this.auth.info.name;
    this.loadProducts();
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Load products from API
  loadProducts(): void {
    this.subscription.add(this.apiService
      .getAvailableInventories({companyId: this.auth.info.companyId, includeBatches: true})
      .pipe(catchError((error) => {
        console.log('error: ', error);
        AdminStore.setLoader(false);
        this.toastr.showError('Something went wrong', 'Error');
        return of(null); // Return an observable, like `null`, to complete the stream gracefully
      }))
      .subscribe(
        (response) => {
          if (response.data && response.data.success) {
            this.productOptions = response.data.map(this.mapProductOption);
            console.log('Available products loaded:', this.productOptions);
          } else {
            this.toastr.showWarn('No available inventory found.', 'Warning');
            console.warn('No available inventory found.');
          }
        }
      ));
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
        this.toastr.showError('Product not found!', 'Error');
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

  // Remove item from cart
  removeItem(item: any): void {
    this.cartItems = this.cartItems.filter((i) => i.id !== item.id);
    this.restoreAvailableQuantity(item);
    this.calculateTotals();
  }

  updateCartQuantity(productId: string, newQuantity: number): void {
    const cartItem = this.cartItems.find((item) => item.id === productId);
    const productOption = this.productOptions.find((p) => p.id === productId);

    if (!cartItem || !productOption) return;

    const previousQuantity = cartItem.quantity; // Capture the previous quantity
    const delta = newQuantity - previousQuantity;

    // Validate stock availability for the increase
    if (delta > 0 && newQuantity > productOption.availableQuantity) {
      this.toastr.showError('Insufficient stock available for this product.', 'Error');
      return;
    }

    // Update the cart item quantity and total
    cartItem.quantity = newQuantity;
    cartItem.total = cartItem.quantity * cartItem.price;

    // Adjust the available quantity for the product option
    productOption.availableQuantity -= delta;

    // Update the product option name to reflect the new quantity
    productOption.name = `${productOption.name.split('(')[0].trim()} (Qty: ${productOption.availableQuantity})`;

    // Log previous and updated values for debugging or display
    console.log(`Previous Quantity: ${previousQuantity}, Updated Quantity: ${newQuantity}`);
    console.log('Updated productOption:', productOption);
    console.log('Cart Items:', this.cartItems);

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
      this.toastr.showError('Insufficient stock available for some products.', 'Error');
      return;
    }

    if (this.balanceAmount >= 0 && this.selectedPaymentMethod) {
      console.log('Checked out items:', {...this.cartItems});
      this.checkoutDialogVisible = false;
      const payload = this.transactionPayload();
      this.subscription.add(this.apiService.posTransactions(payload)
        .pipe(catchError((error) => {
          console.log('error: ', error);
          AdminStore.setLoader(false);
          this.toastr.showError('Something went wrong', 'Error');
          return of(null); // Return an observable, like `null`, to complete the stream gracefully
        })).subscribe(value => {
        if (value && value.success && value.data && value.data.receiptPath) {
          this.toastr.showSuccess('Transaction completed successfully.', 'Success');
          const receiptUrl = environment.uploadUrl + value.data.receiptPath;
          window.open(receiptUrl, '_blank'); // Open the PDF in a new browser tab
        } else {
          this.toastr.showError('Failed to fetch the receipt path.', 'Error');

        }
      }));
      this.clearCart();
    } else {
      this.toastr.showError('Please ensure payment is complete.', 'Error');
    }
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

  // Reset scanned code
  private resetScannedCode(): void {
    setTimeout(() => (this.scannedCode = ''), 1);
  }

  // Reset selected product
  private resetSelectedProduct(): void {
    setTimeout(() => (this.selectedProduct = ''), 1);
  }

  // Update cart item quantity
  private updateCartItemQuantity(cartItem: any, increment: number): void {
    if (cartItem.quantity + increment <= this.getAvailableQuantity(cartItem.id)) {
      cartItem.quantity += increment;
      cartItem.total = cartItem.quantity * cartItem.price;
    } else {
      this.toastr.showError('Insufficient stock available for this product.', 'Error');
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
      this.toastr.showError('Insufficient stock available for this product!', 'Error');
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

  // Restore available quantity
  private restoreAvailableQuantity(item: any): void {
    const selectedProduct = this.productOptions.find((p) => p.id === item.id);
    if (selectedProduct) {
      selectedProduct.availableQuantity += item.quantity;
      selectedProduct.name = `${selectedProduct.name.split('(')[0].trim()} (Qty: ${selectedProduct.availableQuantity})`;
    }
  }

  private transactionPayload() {
    const payload = new POSTransaction();
    payload.companyId = this.auth.info.companyId;
    payload.createdBy = this.auth.info.id;
    payload.products = this.cartItems.map(item =>
      new ProductDetails({
        productId: item.id,
        unitPrice: item.price,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity, // Calculate the total price accurately
      })
    );


    payload.subTotal = this.subtotal
    payload.discountAmount = this.discountAmount
    payload.taxAmount = this.tax
    payload.totalPayable = this.total
    payload.paymentMethod = this.selectedPaymentMethod
    payload.paidAmount = this.paidAmount
    payload.changeGiven = this.balanceAmount
    console.log('payload:', payload)
    return payload
  }

  // Check stock availability for an item
  private hasSufficientStock(item: any): boolean {
    const product = this.productOptions.find((p) => p.id === item.id);
    return product ? product.availableQuantity >= item.quantity : false;
  }
}
