export interface Batch {
  batchId: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  dateAdded?: Date; // Default to the current date
}
