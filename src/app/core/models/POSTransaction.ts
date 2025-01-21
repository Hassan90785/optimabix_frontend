// TypeScript class for POSTransaction
export class POSTransaction {
  public _id: string | null = null;
  public companyId: string | null = null;
  public date: Date = new Date();
  public transactionNumber: string = "";
  public products: ProductDetails[] = [];
  public subTotal: number = 0;
  public discountAmount: number = 0;
  public taxAmount: number = 0;
  public totalPayable: number = 0;
  public paymentMethod: 'Cash' | 'Credit Card' | 'Bank Transfer' = 'Cash';
  public paymentReference: string | null = null;
  public paidAmount: number = 0;
  public changeGiven: number = 0;
  public linkedEntityId: string | null = null;
  public ledgerEntryId: string  | null = null;
  public isDeleted: boolean = false;
  public createdBy: string  | null = null;

  constructor(init?: Partial<POSTransaction>) {
    Object.assign(this, init);
  }
}

// TypeScript class for product details
export class ProductDetails {
  public productId: string  | null = null;
  public batchId: string | null = null;
  public quantity: number = 0;
  public unitPrice: number = 0;
  public totalPrice: number = 0;

  constructor(init?: Partial<ProductDetails>) {
    Object.assign(this, init);
  }
}

// TypeScript class for Payment
export class Payment {
  public _id: string | null = null;
  public companyId: string  | null = null;
  public transactionId: string | null = null;
  public ledgerEntryId: string  | null = null;
  public paymentMethod: 'Cash' | 'Credit Card' | 'Bank Transfer' = 'Cash';
  public amountPaid: number = 0;
  public paymentStatus: 'Completed' | 'Pending' | 'Failed' = 'Pending';
  public paymentReference: string | null = null;
  public paidBy: string | null = null;
  public paymentDate: Date = new Date();
  public isDeleted: boolean = false;
  public createdBy: string | null = null;

  constructor(init?: Partial<Payment>) {
    Object.assign(this, init);
  }
}
