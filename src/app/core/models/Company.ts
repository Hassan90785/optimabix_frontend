export interface Company {
  id?: string;
  name: string;
  registrationNumber?: string;
  businessType: 'POS' | 'B2C' | 'B2B' | 'Both' | 'All';
  contactDetails?: {
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  };
  logo?: string;
  accessStatus?: 'Active' | 'Suspended' | 'Revoked' | 'Trial' | 'Expired';
  suspendedReason?: string;
  revokedReason?: string;
  paymentHistory?: {
    date: string;
    amount: number;
    paymentMethod: string;
  }[];
  nextPaymentDue?: string;
  gracePeriod?: number;
  isDeleted?: boolean;
  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
