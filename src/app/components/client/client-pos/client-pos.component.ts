import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Card} from 'primeng/card';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {Button} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {Dialog} from 'primeng/dialog';
import {AuthService} from '../../../core/services/auth.service';
import {RestApiService} from '../../../core/services/rest-api.service';
import {POSTransaction, ProductDetails} from '../../../core/models/POSTransaction';
import {ToastrService} from '../../../core/services/toastr.service';
import {catchError, of, Subscription} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {AutoComplete} from 'primeng/autocomplete';

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
    CommonModule,
    DropdownModule,
    Dialog,
    ReactiveFormsModule,
    AutoComplete
  ],
  templateUrl: './client-pos.component.html',
  standalone: true,
  providers: [ToastrService],
  styleUrl: './client-pos.component.scss'
})

export class ClientPosComponent implements OnInit, OnDestroy {
  posForm: FormGroup;
  cartItems: any[] = []; // ✅ Regular array instead of FormArray
  filteredProducts: any[] = [];
  productOptions: any[] = [];
  subscription: Subscription = new Subscription();
  checkoutDialogVisible = false;
  currentDateTime = new Date().toLocaleString();
  cashierName: string = 'N/A';
  paymentMethods = [
    {label: 'Cash', value: 'Cash'},
    {label: 'Credit Card', value: 'Credit Card'},
    {label: 'Bank Transfer', value: 'Bank Transfer'}
  ];

  auth = inject(AuthService);
  apiService = inject(RestApiService);
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);

  constructor() {

    this.posForm = this.fb.group({
      scannedCode: [''],
      selectedProduct: [''],
      cartItems: this.cartItems, // ✅ Use the initialized FormArray
      subtotal: [0],
      tax: [0],
      total: [0],
      paidAmount: [0, [Validators.min(0)]],
      balanceAmount: [0],
      selectedPaymentMethod: ['Cash', Validators.required]
    });

  }

  ngOnInit(): void {
    this.cashierName = this.auth.info.name;
    this.loadProducts();
    setInterval(() => this.currentDateTime = new Date().toLocaleString(), 1000);

  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onScan(): void {
    const scannedCode = this.posForm.value.scannedCode;
    if (scannedCode) {
      const product = this.productOptions.find(p => p.barcode === scannedCode);
      if (product) {
        this.addItemToCart(product);
      } else {
        this.toastr.showError('Product not found!', 'Error');
      }
      this.posForm.patchValue({scannedCode: ''});
    }
  }

  onProductSelect(): void {
    const selectedBatchId = this.posForm.value.selectedProduct;
    const product = this.productOptions.find(p => p.batchId === selectedBatchId);

    if (product) {
      this.addItemToCart(product);
    }

    // Reset selection
    this.posForm.patchValue({selectedProduct: ''});
  }


  addItemToCart(product: any): void {
    const existingIndex = this.cartItems.findIndex((item) => item.batchId === product.batchId);
    if (existingIndex !== -1) {
      this.cartItems[existingIndex].quantity += 1;
      this.cartItems[existingIndex].total = this.cartItems[existingIndex].quantity * this.cartItems[existingIndex].price;
    } else {
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        availableQuantity: product.availableQuantity,
        total: product.price,
        batchId: product.batchId
      };

      this.cartItems.push(newItem); // ✅ Use regular array push instead of FormArray
    }

    this.updateAvailableStock(product.id, -1);
    this.calculateTotals();
  }

  removeItem(item: any): void {
    const index = this.cartItems.findIndex(i => i.id === item.id);
    // Restore the stock before removing the item
    this.updateAvailableStock(item.id, item.quantity);

    // Remove the item from the cart
    this.cartItems.splice(index, 1);

    // Recalculate totals
    this.calculateTotals();
  }

  filterProducts(event: any): void {
    const query = event.query.toLowerCase();
    this.filteredProducts = this.productOptions.filter(product =>
      product.name.toLowerCase().includes(query)
    );
  }

  updateCartQuantity(item: any, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newQuantity = parseInt(inputElement.value, 10);

    if (isNaN(newQuantity) || newQuantity < 1) return; // Prevent invalid numbers

    const product = this.productOptions.find(p => p.id === item.id);
    if (!product) return;

    const previousQuantity = item.quantity;

    // Check stock availability before updating
    if (newQuantity > product.availableQuantity + previousQuantity) {
      this.toastr.showError('Insufficient stock available.', 'Error');
      return;
    }

    // Update the quantity and total
    item.quantity = newQuantity;
    item.total = newQuantity * item.price;

    // Restore the previous stock and subtract the new quantity
    this.updateAvailableStock(item.id, previousQuantity - newQuantity);

    // Recalculate totals
    this.calculateTotals();
  }

  updateAvailableStock(productId: string, change: number): void {
    const product = this.productOptions.find(p => p.id === productId);
    if (product) {
      product.availableQuantity += change;
      product.name = `${product.name.split('(')[0].trim()} (Qty: ${product.availableQuantity})`;
    }
  }

  calculateTotals(): void {
    const subtotal = this.cartItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0 // Assuming 10% tax
    const total = subtotal + tax;
    this.posForm.patchValue({subtotal, tax, total});
  }

  showCheckoutDialog(): void {
    const total = this.posForm.value.total;
    if (total > 0) {
      this.checkoutDialogVisible = true;
    } else {
      this.toastr.showInfo('Please add items to the cart.');
    }
  }

  updateBalance(): void {
    const total = this.posForm.value.total;
    const paidAmount = this.posForm.value.paidAmount;
    this.posForm.patchValue({balanceAmount: paidAmount - total});
  }

  confirmCheckout(): void {
    if (this.cartItems.some(item => item.quantity > item.availableQuantity)) {
      this.toastr.showError('Insufficient stock available.', 'Error');
      return;
    }

    if (this.posForm.value.balanceAmount < 0) {
      this.toastr.showError('Please ensure full payment is made.', 'Error');
      return;
    }

    this.checkoutDialogVisible = false;
    const payload = this.buildTransactionPayload();

    this.subscription.add(this.apiService.posTransactions(payload)
      .pipe(catchError(error => {
        console.error('Checkout Error:', error);
        this.toastr.showError('Something went wrong', 'Error');
        return of(null);
      }))
      .subscribe(response => {
        if (response?.success) {
          this.toastr.showSuccess('Transaction completed successfully.', 'Success');
          window.open(environment.uploadUrl + response.data.receiptPath, '_blank');
        } else {
          this.toastr.showError('Failed to process transaction.', 'Error');
        }
      }));

    this.clearCart();
  }

  clearCart(): void {
    this.cartItems = []; // ✅ Clear the array instead of using FormArray.clear()
    this.posForm.reset({subtotal: 0, tax: 0, total: 0, paidAmount: 0, balanceAmount: 0});
    this.loadProducts(); // Reload stock data
  }

  private loadProducts(): void {
    this.subscription.add(this.apiService.getAvailableInventories({
        companyId: this.auth.info.companyId,
        includeBatches: true
      })
        .pipe(catchError(error => {
          console.error('Error fetching products:', error);
          this.toastr.showError('Something went wrong while loading products', 'Error');
          return of([]);
        }))
        .subscribe(response => {
          if (response.data && response.success) {
            this.productOptions = response.data.flatMap(this.mapProductOption)
              .sort((a:any, b:any) => a.name.localeCompare(b.name));
          } else {
            this.toastr.showWarn('No available inventory found.', 'Warning');
          }
        })
    );
  }

  private mapProductOption(product: any): any[] {
    return product.batches.map((batch: any) => ({
      id: product.productId,
      name: `${product.name} (Qty: ${batch.quantity})`,
      price: batch.sellingPrice,
      barcode: batch.barcode,
      availableQuantity: batch.quantity,
      batchId: batch.batchId
    }));
  }


  private buildTransactionPayload(): POSTransaction {
    return new POSTransaction({
      companyId: this.auth.info.companyId,
      createdBy: this.auth.info.id,
      products: this.cartItems.map(item => new ProductDetails({
        productId: item.id,
        unitPrice: item.price,
        quantity: item.quantity,
        totalPrice: item.total,
        batchId: item.batchId
      })),
      subTotal: this.posForm.value.subtotal,
      taxAmount: this.posForm.value.tax,
      totalPayable: this.posForm.value.total,
      paidAmount: this.posForm.value.paidAmount,
      changeGiven: this.posForm.value.balanceAmount,
      paymentMethod: this.posForm.value.selectedPaymentMethod
    });
  }


}
